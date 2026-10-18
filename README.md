# CivicLens AI 🏛️
> **“Turn community complaints into organized, actionable evidence.”**

[![CI/CD](https://github.com/PramodTewatia2007/civiclens-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/PramodTewatia2007/civiclens-ai/actions/workflows/ci.yml)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An AI-powered civic issue reporting and evidence tracking platform built for residents, students, campus maintenance crews, and municipal dispatchers.

---

## 🌟 Key Capabilities

1. **Issue Reporting with Photographic Evidence**
   - Drag-and-drop or file upload for photo evidence.
   - Built-in **Quick Demo Sample Photos** (one-click testing for Potholes, Waste, Broken Streetlights, and Water Leaks).
   - Interactive OpenStreetMap (Leaflet) location picker with quick civic hotspots.

2. **Automated AI Classification & Risk Assessment**
   - Automatically categorizes issues into **4 core civic domains**:
     - 🚧 `potholes` — Potholes & Road Hazards
     - 🗑️ `waste` — Illegal Dumping & Waste Management
     - 💡 `broken_streetlights` — Broken Streetlights & Electrical Outages
     - 💧 `water_leaks` — Water Leaks & Pipe Bursts
   - Generates confidence scores, severity assessments (*Low, Medium, High, Critical*), diagnostic reasoning, and department routing.
   - **Dual AI Architecture:** Real-time multimodal Gemini API (`gemini-2.5-flash`) integration with an intelligent deterministic local NLP heuristic & vision fallback for 100% reliable offline/demo operation.

3. **Geospatial & Semantic Duplicate Detection**
   - Compares incoming reports against active nearby issues using Haversine geospatial proximity and text token similarity.
   - Flags possible duplicates (`duplicate_status: "flagged"`) with match percentage and distance in meters.
   - **Never auto-deletes:** Preserves all citizen submissions as corroborating evidence.

4. **Transparent Evidence Trail & Status Progression**
   - Tracks reports through a 5-stage lifecycle:
     $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved}$$
   - Every status transition creates an immutable audit log recording the actor name, timestamp, and action notes.
   - Resolution verification includes before/after proof photos and official staff sign-off notes.

5. **Human-in-the-Loop Staff Dispatch & Admin Portal**
   - Switch seamlessly between **Resident View** and **City Staff View**.
   - Review pending queue, override AI predictions with mandatory justification logs, dispatch field leads, and merge duplicate flags.
   - **AI Governance Safeguard:** AI outputs remain strictly advisory; municipal staff make final severity and assignment decisions.

6. **Civic Operations Analytics**
   - Real-time KPI summaries: Total Reports, Unresolved, In Progress, Resolved %, and Flagged Duplicates.
   - Category distribution, severity matrices, and department SLA resolution velocities.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Mapping** | Leaflet with OpenStreetMap tiles |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLAlchemy ORM with SQLite (or PostgreSQL/Supabase via `DATABASE_URL`) |
| **AI Engine** | Google Gemini API (`google-genai` SDK) + Built-in civic semantic classifier |
| **CI/CD** | GitHub Actions (Node 20 + Python 3.12 + Docker build validation) |
| **Deployment** | Docker & Render Blueprint (`render.yaml`) |

---

## ☁️ Deployment on Render

CivicLens AI is preconfigured for **zero-config 1-click deployment** on Render.

### Option A: 1-Click Render Blueprint (Recommended)
1. Fork or push this repository to your GitHub account (`https://github.com/PramodTewatia2007/civiclens-ai`).
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Select your `civiclens-ai` repository.
5. Render reads `render.yaml` automatically:
   - Sets up the unified Docker web service.
   - Configures health check on `/api/health`.
   - Binds to dynamic `$PORT` automatically.
6. Click **Apply**. Your app will be live with a free HTTPS URL in ~2 minutes!

### Option B: Render Web Service via Docker
1. On [Render](https://dashboard.render.com), click **New +** > **Web Service**.
2. Connect your `civiclens-ai` repository.
3. Choose **Docker** environment.
4. Click **Create Web Service**.

### Option C: Native Python Web Service on Render
If you prefer native Python instead of Docker:
- **Build Command:** `./build.sh` (or `npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt`)
- **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 🐳 Docker Local Run

You can build and test the production container locally with a single command:
```bash
docker build -t civiclens-ai .
docker run -p 8000:8000 -e PORT=8000 civiclens-ai
```
Visit **`http://localhost:8000`** in your browser.

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt

# (Optional) Add your Gemini API key in backend/.env:
# GEMINI_API_KEY=your_key_here

python run.py
```
> Server runs on `http://127.0.0.1:8000` (API docs at `/docs`).

### 2. Frontend Setup
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
> Vite dev server runs on `http://localhost:5173`.

### 3. Batch Launchers (Windows)
- Double-click **`start_dev.bat`** to start both Backend and Vite dev server.
- Double-click **`start_all.bat`** to start the unified production FastAPI server with compiled React SPA.

---

## 🧪 Automated Test Suite

A complete verification suite is provided in `backend/test_app.py`:
```bash
cd backend
python test_app.py
```
**Test Verification Coverage:**
- `GET /api/health` — System status and configuration check
- `GET /api/issues` — Category, status, and duplicate filter verification
- `POST /api/ai/classify` — AI category and severity prediction
- `POST /api/ai/check-duplicates` — Proximity and text similarity match verification
- `POST /api/issues` — New report submission with audit trail initialization
- `PATCH /api/issues/{id}/status` — Status lifecycle transitions
- `PATCH /api/issues/{id}/classification` — Human-in-the-loop staff override
- `POST /api/issues/{id}/upvote` — Community confirmation counter
- `GET /api/analytics` — SLA metrics and category distribution
- `GET /` — Production SPA delivery

---

## 🔒 Responsible AI & Governance

- **Advisory AI:** All classifications, severities, and duplicate flags are labeled as recommendations.
- **Human Authority:** Authorized personnel have full override capability with audit trails.
- **Privacy First:** Citizen reporter contact information is optional and protected.
- **No False Claims:** Clear disclaimers clarify that reports are community evidence records and not direct 911 emergency services.

---

## 📄 License

MIT License. Designed with civic-tech engineering standards.
