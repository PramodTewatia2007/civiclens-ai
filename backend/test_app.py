from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.models import Issue

# Ensure database is prepared
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

def run_all_tests():
    print("=== STARTING CIVICLENS AI VERIFICATION SUITE ===")

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    print("[PASS] Health Check Passed:", data)

    # 2. Issues listing
    res = client.get("/api/issues")
    assert res.status_code == 200
    issues = res.json()
    assert len(issues) >= 9, f"Expected at least 9 seeded issues, got {len(issues)}"
    print(f"[PASS] Retrieved {len(issues)} issues successfully from database.")

    # 3. Filter by category
    res = client.get("/api/issues?category=potholes")
    assert res.status_code == 200
    potholes = res.json()
    assert all(i["category"] == "potholes" for i in potholes)
    print(f"[PASS] Category filter test passed: found {len(potholes)} potholes.")

    # 4. Filter by duplicates only
    res = client.get("/api/issues?duplicates_only=true")
    assert res.status_code == 200
    dupes = res.json()
    assert len(dupes) >= 1
    print(f"[PASS] Flagged duplicate filter passed: found {len(dupes)} flagged duplicate records.")

    # 5. AI Classification Endpoint
    res = client.post("/api/ai/classify", json={
        "title": "Severe road cavity on 4th Ave",
        "description": "Deep crater in the asphalt right next to bike lane causing tire deflection and wheel damage.",
        "image_name": "pothole_crater.jpg"
    })
    assert res.status_code == 200
    ai_data = res.json()
    assert ai_data["category"] == "potholes"
    assert ai_data["severity"] in ["high", "critical", "medium"]
    print("[PASS] AI Classification Engine Passed:", ai_data["category_name"], "| Severity:", ai_data["severity"], "| SLA:", ai_data["estimated_sla"])

    # 6. AI Duplicate Detection Endpoint
    # Test coordinates near Oak Street (37.7750, -122.4193) with category 'potholes'
    res = client.post("/api/ai/check-duplicates", json={
        "latitude": 37.7751,
        "longitude": -122.4192,
        "category": "potholes",
        "title": "Large hole in asphalt on Oak St",
        "description": "Car tires getting damaged by crater on Oak Street"
    })
    assert res.status_code == 200
    dupe_data = res.json()
    assert dupe_data["has_duplicates"] is True
    print(f"[PASS] Duplicate Detection Engine Passed: Detected {len(dupe_data['potential_matches'])} matches. Top match #{dupe_data['top_match_id']} ({dupe_data['potential_matches'][0]['similarity_score']}% match)")

    # 7. Create New Issue Report
    res = client.post("/api/issues", json={
        "title": "Broken glass and overflowing trash bin at bus stop",
        "description": "Public garbage bin overflowing with broken bottles, fast food wrappers, and cardboard boxes blocking commuter waiting area.",
        "category": "waste",
        "severity": "medium",
        "latitude": 37.7800,
        "longitude": -122.4150,
        "address": "500 Market Street Bus Shelter",
        "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        "reporter_name": "Transit Rider Alex"
    })
    assert res.status_code == 201
    new_issue = res.json()
    new_id = new_issue["id"]
    print(f"[PASS] Issue Creation Passed: Created #{new_id} ({new_issue['title']}) with initial status '{new_issue['status']}'.")
    assert len(new_issue["timeline_events"]) == 1
    assert new_issue["timeline_events"][0]["to_status"] == "submitted"

    # 8. Update Status with Evidence Trail Audit Log
    res = client.patch(f"/api/issues/{new_id}/status", json={
        "status": "in_progress",
        "changed_by": "Sanitation Dispatcher Rodriguez",
        "notes": "Crew 4 dispatched with hydraulic lift and recycling container.",
        "assigned_department": "Sanitation & Waste Management Bureau",
        "assigned_person": "Alex Ramos (Crew 4)"
    })
    assert res.status_code == 200
    updated_issue = res.json()
    assert updated_issue["status"] == "in_progress"
    assert len(updated_issue["timeline_events"]) == 2
    print(f"[PASS] Status Transition & Evidence Trail Passed: #{new_id} updated to 'in_progress' with 2 timeline events.")

    # 9. Staff Classification Override
    res = client.patch(f"/api/issues/{new_id}/classification", json={
        "category": "waste",
        "severity": "high",
        "override_reason": "Glass fragments present direct pedestrian cut hazard for students.",
        "changed_by": "Supervisor Elena"
    })
    assert res.status_code == 200
    overridden_issue = res.json()
    assert overridden_issue["severity"] == "high"
    assert overridden_issue["severity_overridden"] is True
    print(f"[PASS] Staff Human-in-the-Loop Reclassification Passed: Severity upgraded to 'high' with reason logged.")

    # 10. Community Upvote
    init_upvotes = overridden_issue["upvotes"]
    res = client.post(f"/api/issues/{new_id}/upvote")
    assert res.status_code == 200
    assert res.json()["upvotes"] == init_upvotes + 1
    print(f"[PASS] Community Upvote Test Passed: Upvotes increased to {init_upvotes + 1}.")

    # 11. Analytics Summary
    res = client.get("/api/analytics")
    assert res.status_code == 200
    analytics = res.json()
    assert analytics["total_reports"] >= 10
    assert "potholes" in analytics["category_breakdown"]
    assert "avg_resolution_hours" in analytics
    print(f"[PASS] Analytics Telemetry Passed: Total {analytics['total_reports']} reports, {analytics['resolution_rate']}% resolved, {analytics['avg_resolution_hours']}h avg turnaround.")

    # 12. Frontend SPA index.html serving
    res = client.get("/")
    assert res.status_code == 200
    assert "CivicLens" in res.text
    print("[PASS] Frontend SPA Integration Passed: Root URL serves compiled index.html successfully.")

    print("\n[SUCCESS] ALL 12 TEST SUITE CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_all_tests()
