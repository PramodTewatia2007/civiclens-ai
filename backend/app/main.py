from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from .config import settings, BASE_DIR
from .database import engine, Base, get_db
from .seed_data import seed_database
from .routers import issues, ai, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed with realistic civic issues
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Turn community complaints into organized, actionable evidence.",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static/uploads directory
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(issues.router)
app.include_router(ai.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }


@app.post("/api/demo/reset-seed")
def reset_seed_data(db: Session = Depends(get_db)):
    """Resets the demo database back to clean realistic seed records."""
    from .models import Issue, StatusHistory
    db.query(StatusHistory).delete()
    db.query(Issue).delete()
    db.commit()
    seed_database(db)
    return {"message": "Database reset and seeded with realistic civic records successfully."}


# Serve built frontend if dist exists
# Support multiple locations (local dev, docker container, or static copy)
POSSIBLE_DIST_DIRS = [
    BASE_DIR.parent / "frontend" / "dist",
    BASE_DIR / "static" / "dist",
    Path("frontend/dist"),
    Path("/app/frontend/dist")
]

FRONTEND_DIST = next((d for d in POSSIBLE_DIST_DIRS if d.exists()), None)

if FRONTEND_DIST:
    assets_dir = FRONTEND_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API, uploads, or OpenAPI docs
        if (
            full_path.startswith("api") or 
            full_path.startswith("uploads") or 
            full_path in ("docs", "redoc", "openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = FRONTEND_DIST / full_path
        if file_path.is_file():
            return FileResponse(file_path)
            
        index_file = FRONTEND_DIST / "index.html"
        if index_file.is_file():
            return FileResponse(index_file)
            
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

