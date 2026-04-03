from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import random
import json
import uvicorn
import os

# Import our custom ML classes so pickle can deserialize the trained model
from train_model import RandomForest, DecisionNode, _build_tree, _predict_sample

# ─── Load trained SAMBAL AI Model ─────────────────────────────────────────────
MODEL_PATH = "sambal_ai_model.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        model_bundle = pickle.load(f)
    rf_payout = model_bundle["rf_payout"]
    rf_prob   = model_bundle["rf_probability"]
    MODEL_VERSION = model_bundle["version"]
    print(f"SAMBAL AI loaded: {MODEL_VERSION}  ({len(rf_payout.trees)} trees each)")
    AI_READY = True
except FileNotFoundError:
    AI_READY = False
    MODEL_VERSION = "NOT_TRAINED"
    print("WARNING: sambal_ai_model.pkl not found. Run train_model.py first.")

# ─── City density lookup ───────────────────────────────────────────────────────
CITY_DENSITY = {
    "Mumbai":    1.4,
    "Delhi":     1.3,
    "Bangalore": 1.1,
    "Chennai":   1.0,
    "Hyderabad": 1.0,
    "Kolkata":   1.2,
}

# ─── Risk factor generator (rule-based labels derived from inputs) ─────────────
def derive_risk_factors(city, rain_mm, heat_c, strike, platform):
    factors = []
    if rain_mm > 100:
        factors.append(f"Red-alert rainfall ({rain_mm:.0f}mm) in {city}")
    elif rain_mm > 50:
        factors.append(f"Heavy rain warning ({rain_mm:.0f}mm) — delivery disruption")
    elif rain_mm > 20:
        factors.append(f"Moderate rainfall in {city}")

    if heat_c > 47:
        factors.append(f"Extreme heatwave ({heat_c:.0f}C) — dangerous work conditions")
    elif heat_c > 42:
        factors.append(f"High heat advisory ({heat_c:.0f}C) — {platform} slowdown expected")
    elif heat_c > 38:
        factors.append(f"Elevated heat index ({heat_c:.0f}C)")

    if strike > 0.8:
        factors.append(f"City-wide shutdown in {city} — total {platform} disruption")
    elif strike > 0.5:
        factors.append(f"Major strike activity in {city} — {platform} heavily impacted")
    elif strike > 0.2:
        factors.append(f"Localized strike reported near {city} zones")

    if not factors:
        factors.append("Normal operating conditions — no disruption detected")

    return factors

# ─── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SAMBAL AI Engine v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ───────────────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    city: str
    rain_mm: float
    heat_index_c: float
    strike_severity: float
    platform: str

class PredictionResponse(BaseModel):
    model_version: str
    disruption_probability: float
    estimated_payout_inr: int
    risk_factors: list[str]
    ai_reasoning: str

# ─── Prediction endpoint ───────────────────────────────────────────────────────
@app.post("/api/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not trained. Run train_model.py first.")

    density = CITY_DENSITY.get(req.city, 1.0)
    features = [[req.rain_mm, req.heat_index_c, req.strike_severity, density]]

    raw_payout = rf_payout.predict(features)[0]
    raw_prob   = rf_prob.predict(features)[0]

    payout = max(0, min(2500, int(raw_payout)))
    prob   = round(max(1.0, min(99.0, raw_prob)), 1)

    factors = derive_risk_factors(
        req.city, req.rain_mm, req.heat_index_c, req.strike_severity, req.platform
    )

    # Generate a concise AI reasoning string from the model outputs
    severity = "severe" if prob > 70 else "moderate" if prob > 40 else "low"
    reasoning = (
        f"SAMBAL AI assessed a {severity} disruption risk ({prob:.0f}%) in {req.city} "
        f"for {req.platform} workers. "
        f"{'Rain and strike factors significantly raised the payout threshold.' if req.rain_mm > 50 or req.strike_severity > 0.5 else 'Conditions are within acceptable operating ranges.'}"
    )

    return PredictionResponse(
        model_version=MODEL_VERSION,
        disruption_probability=prob,
        estimated_payout_inr=payout,
        risk_factors=factors,
        ai_reasoning=reasoning,
    )

@app.get("/api/status")
def status():
    return {
        "ready": AI_READY,
        "model": MODEL_VERSION,
        "trees": len(rf_payout.trees) if AI_READY else 0,
    }

if __name__ == "__main__":
    print("Starting SAMBAL AI Server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
