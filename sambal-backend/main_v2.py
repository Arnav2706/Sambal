"""
SAMBAL AI Engine v2 — FastAPI Server
Serves all 4 ML modules via REST API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import pickle
import math
import uvicorn
import requests as req_lib
import datetime

# ─── City coordinates (lat, lon) for Open-Meteo weather API ──────────────────
CITY_COORDS = {
    "Mumbai":    (19.0760, 72.8777),
    "Delhi":     (28.6139, 77.2090),
    "Bangalore": (12.9716, 77.5946),
    "Chennai":   (13.0827, 80.2707),
    "Hyderabad": (17.3850, 78.4867),
    "Kolkata":   (22.5726, 88.3639),
    "Pune":      (18.5204, 73.8567),
}

def fetch_live_weather(city: str) -> dict:
    """Fetch real-time weather from Open-Meteo (free, no API key needed). Uses Geocoding API to find city."""
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"
    try:
        geo_resp = req_lib.get(geo_url, timeout=5)
        geo_resp.raise_for_status()
        geo_data = geo_resp.json()
        if "results" not in geo_data or not geo_data["results"]:
            return None
        
        lat = geo_data["results"][0]["latitude"]
        lon = geo_data["results"][0]["longitude"]
        resolved_city = geo_data["results"][0]["name"]
    except Exception as e:
        print(f"Geocoding failed: {e}")
        return None

    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=precipitation,apparent_temperature,temperature_2m,rain,windspeed_10m"
        f"&timezone=Asia%2FKolkata"
    )
    try:
        resp = req_lib.get(url, timeout=8)
        resp.raise_for_status()
        data = resp.json()["current"]
        rain_mm      = float(data.get("rain", 0) or data.get("precipitation", 0))
        heat_index_c = float(data.get("apparent_temperature", data.get("temperature_2m", 30)))
        wind_kmh     = float(data.get("windspeed_10m", 0))
        return {
            "rain_mm":      round(rain_mm, 2),
            "heat_index_c": round(heat_index_c, 1),
            "wind_kmh":     round(wind_kmh, 1),
            "aqi":          120.0,   # Open-Meteo free tier doesn't include AQI; default moderate
            "source":       "Open-Meteo (live)",
            "fetched_at":   datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST"),
        }
    except Exception as e:
        print(f"Weather fetch failed: {e}")
        return None


# ─── Load trained SAMBAL AI Model ─────────────────────────────────────────────
MODEL_PATH = "sambal_ai_v3.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)

    m1_risk      = bundle["module1_risk_profiler"]
    m2_pricer    = bundle["module2_weekly_pricer"]
    m3_fraud     = bundle["module3_fraud_detector"]
    m4_trigger   = bundle["module4_trigger_classifier"]
    m4_conf      = bundle["module4_confidence_scorer"]
    ZONE_MULT    = bundle["zone_multiplier_map"]
    PERSONA_MAP  = bundle["persona_map"]
    CITY_TIER    = bundle["city_tier_map"]
    MODEL_VER    = bundle["version"]
    AI_READY     = True
    print(f"SAMBAL AI {MODEL_VER} loaded — all 4 modules active")
except FileNotFoundError:
    AI_READY = False
    MODEL_VER = "NOT_TRAINED"
    print("WARNING: sambal_ai_v3.pkl not found. Run train_v3.py first.")

app = FastAPI(title="SAMBAL AI Engine v2", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ──────────────────────────────────────────────────────────────────

class OnboardingRequest(BaseModel):
    """Module 1 — Risk Profiler"""
    city: str
    delivery_zone: int = Field(ge=1, le=5)
    persona: str                          # food_delivery / grocery / ride_hailing / logistics
    avg_daily_earn: float
    weekly_hours: float
    month: int = Field(ge=1, le=12)

class OnboardingResponse(BaseModel):
    risk_score: float
    risk_zone: int                        # 1–4
    zone_multiplier: float
    model_version: str

class PricerRequest(BaseModel):
    """Module 2 — Dynamic Weekly Pricer"""
    rain_7d: float
    temp_avg: float
    aqi: float
    civic_events: int
    zone_claims: float
    worker_q_claims: int
    base_premium: float

class PricerResponse(BaseModel):
    premium_adjustment_pct: float         # ±15%
    new_premium: float
    direction: str                        # increase / decrease / stable
    model_version: str

class FraudRequest(BaseModel):
    """Module 3 — Fraud Detection"""
    gps_distance_km: float
    platform_logged_in: bool
    earnings_drop_pct: float              # 0–1
    claims_7_days: int
    duplicate_flag: bool
    cross_worker_match: float             # 0–1 similarity score

class FraudResponse(BaseModel):
    fraud_level: str                      # Low / Medium / High
    auto_approve: bool
    requires_admin_review: bool
    anomaly_score: float
    triggered_rules: list[str]
    model_version: str

class TriggerRequest(BaseModel):
    """Module 4 — Parametric Trigger Classifier"""
    city: str
    platform: str
    rain_mm: float
    heat_index_c: float
    strike_severity: float
    hour_of_day: int = Field(ge=0, le=23)
    persona: str
    zone_match: bool

class TriggerResponse(BaseModel):
    trigger_valid: bool
    confidence_score: float
    estimated_payout_inr: int
    risk_factors: list[str]
    ai_reasoning: str
    model_version: str

# ─── Helpers ──────────────────────────────────────────────────────────────────

def haversine_check(distance_km: float) -> bool:
    """True if worker is within expected delivery zone (< 2km buffer)"""
    return distance_km <= 2.0

def rule_based_fraud(req: FraudRequest) -> list[str]:
    rules = []
    if req.gps_distance_km > 2.0:
        rules.append("GPS geofence violation: worker outside claimed zone")
    if not req.platform_logged_in:
        rules.append("Platform login status: OFFLINE during claimed disruption")
    if req.earnings_drop_pct > 0.70:
        rules.append("Earnings drop >70% vs prior 4-week average")
    if req.claims_7_days > 2:
        rules.append(f"Velocity check: {req.claims_7_days} claims in 7 days → manual review")
    if req.duplicate_flag:
        rules.append("Duplicate claim fingerprint detected")
    if req.cross_worker_match > 0.8:
        rules.append("Cross-worker pattern analysis: suspicious cluster match")
    return rules

def payout_from_trigger(rain, heat, strike, multiplier):
    """Calculates deterministic payout with sustainability tapers and explicit formulas."""
    payout = 0
    
    # Rain Taper: ₹8/mm (30-80) -> ₹12/mm (80-100) -> ₹6/mm (100+)
    if rain > 30:
        rain_30_80 = min(rain, 80) - 30
        payout += rain_30_80 * 8
    if rain > 80:
        rain_80_100 = min(rain, 100) - 80
        payout += rain_80_100 * 12
    if rain > 100:
        rain_100_plus = rain - 100
        payout += rain_100_plus * 6  # Soft taper for sustainability
        
    # Heat: ₹50/deg above 38
    if heat > 38:
        payout += (heat - 38) * 50
        
    # Strike — Explicit Formulas:
    # 3-7 severity: (sev/7) * 600
    # 7-10 severity: (sev/10) * 1500
    if 0.3 <= strike < 0.7:
        payout += (strike / 0.7) * 600
    elif strike >= 0.7:
        payout += (strike / 1.0) * 1500
        
    return max(0, min(2500, int(payout * multiplier)))

# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/status")
def status():
    return {"ready": AI_READY, "model": MODEL_VER,
            "modules": ["risk_profiler", "weekly_pricer", "fraud_detector", "trigger_classifier"]}


@app.get("/api/weather/{city}")
def get_weather(city: str):
    """Fetch live weather for a city from Open-Meteo — no API key required."""
    weather = fetch_live_weather(city)
    if not weather:
        raise HTTPException(404, f"City '{city}' not supported or weather fetch failed.")
    return weather


class LiveAnalysisRequest(BaseModel):
    """Auto-fetch weather + run trigger classifier in one call."""
    city:            str
    platform:        str
    persona:         str
    strike_severity: float = 0.0   # still manual — no reliable free strike API
    zone_match:      bool  = True
    test_mode:       bool  = False
    manual_rain:     Optional[float] = None
    manual_heat:     Optional[float] = None

class LiveTriggerResponse(BaseModel):
    trigger_valid:        bool
    confidence_score:     float
    estimated_payout_inr: int
    risk_factors:         list[str]
    ai_reasoning:         str
    model_version:        str
    weather_source:       str
    weather_fetched_at:   str
    live_rain_mm:         float
    live_heat_index_c:    float
    hour_of_day:          int


@app.post("/api/live-analysis", response_model=LiveTriggerResponse)
def live_analysis(req: LiveAnalysisRequest):
    """Fetch real weather then run Module 4 automatically. Supports Test/Simulation mode."""
    if not AI_READY:
        raise HTTPException(503, "Model not loaded")

    # Simulation vs Live Weather Logic
    if req.test_mode:
        rain_mm      = req.manual_rain if req.manual_rain is not None else 0.0
        heat_index_c = req.manual_heat if req.manual_heat is not None else 30.0
        wind_kmh     = 10.0
        aqi          = 80.0
        weather = {
            "source": "SAMBAL Simulator",
            "fetched_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + " (Simulated)"
        }
        # Force "ideal" working day in the features for simulation
        hour = 12 
        is_work = 1
        is_peak = 1
    else:
        weather = fetch_live_weather(req.city)
        if not weather:
            raise HTTPException(503, f"Could not fetch weather for '{req.city}'")
        
        rain_mm      = weather["rain_mm"]
        heat_index_c = weather["heat_index_c"]
        wind_kmh     = weather.get("wind_kmh", 0.0)
        aqi          = weather.get("aqi", 120.0)
        
        now = datetime.datetime.now()
        hour = now.hour
        is_peak = int((7 <= hour <= 10) or (18 <= hour <= 22))
        is_work = int(6 <= hour <= 23)

    persona_id = PERSONA_MAP.get(req.persona, 0)
    zone_match = int(req.zone_match)

    # v3 model expects 10 features
    features = [[rain_mm, heat_index_c, req.strike_severity,
                 hour, persona_id, zone_match, is_peak, is_work,
                 wind_kmh, aqi]]

    trigger_valid = bool(m4_trigger.predict(features)[0])
    confidence    = float(m4_conf.predict(features)[0])
    confidence    = round(max(0.0, min(1.0, confidence)), 3)

    if not is_work:
        trigger_valid = False
        confidence    = 0.02

    risk_factors = []
    if rain_mm > 100:             risk_factors.append(f"Extreme disruption ({rain_mm}mm rainfall) verified")
    elif rain_mm > 50:            risk_factors.append(f"Heavy rain disruption verified ({rain_mm}mm)")
    elif rain_mm > 30:            risk_factors.append(f"Moderate rain disruption verified ({rain_mm}mm)")
    elif rain_mm > 5:             risk_factors.append(f"Minor rain detected ({rain_mm}mm) — below threshold")
    if heat_index_c > 42:         risk_factors.append(f"Extreme heat stress verified ({heat_index_c}C)")
    elif heat_index_c > 38:       risk_factors.append(f"Verified heat disruption: {heat_index_c}C index")
    if wind_kmh > 40:             risk_factors.append(f"Severe wind hazard verified ({wind_kmh}km/h)")
    if req.strike_severity > 0.3: risk_factors.append(f"Verified strike disruption in {req.city}")
    if not is_work:               risk_factors.append("Outside core coverage hours — trigger suppressed")
    if not zone_match:            risk_factors.append("Location outside verified disruption zone")
    if not risk_factors:          risk_factors.append(f"Normal operating conditions in {req.city}")

    zone_mult = ZONE_MULT.get(1, 1.0)
    payout = payout_from_trigger(rain_mm, heat_index_c, req.strike_severity, zone_mult) if trigger_valid else 0
    
    # SAMBAL Trust: Minimum ₹100 guarantee for any approved disruption
    if trigger_valid:
        payout = max(100, payout)

    reasoning = (
        f"SAMBAL Intelligence verifies disruptions in real time before releasing payouts. "
        f"Current conditions in {req.city}: {rain_mm}mm rain, {heat_index_c}C heat index. "
        f"{'Trigger APPROVED — payout initiated.' if trigger_valid else 'Trigger REJECTED — conditions do not meet payout threshold.'}"
    )

    return LiveTriggerResponse(
        trigger_valid=trigger_valid,
        confidence_score=confidence,
        estimated_payout_inr=payout,
        risk_factors=risk_factors,
        ai_reasoning=reasoning,
        model_version=MODEL_VER,
        weather_source=weather["source"],
        weather_fetched_at=weather["fetched_at"],
        live_rain_mm=rain_mm,
        live_heat_index_c=heat_index_c,
        hour_of_day=hour,
    )


@app.post("/api/onboard/risk-profile", response_model=OnboardingResponse)
def risk_profile(req: OnboardingRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not loaded")

    city_tier  = CITY_TIER.get(req.city, 2)
    persona_id = PERSONA_MAP.get(req.persona, 0)

    features = [[city_tier, req.delivery_zone, persona_id,
                 req.avg_daily_earn, req.weekly_hours, req.month]]
    zone_label  = int(m1_risk.predict(features)[0])
    risk_score  = m1_risk.predict_proba(features)[0]
    # Convert probabilities to a 0–100 score
    score = sum((i+1) * p for i, p in enumerate(risk_score)) / 4 * 100

    return OnboardingResponse(
        risk_score=round(score, 1),
        risk_zone=zone_label + 1,        # convert 0-index to 1-4
        zone_multiplier=ZONE_MULT[zone_label],
        model_version=MODEL_VER,
    )


@app.post("/api/pricing/weekly-adjustment", response_model=PricerResponse)
def weekly_price(req: PricerRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not loaded")

    features = [[req.rain_7d, req.temp_avg, req.aqi, req.civic_events,
                 req.zone_claims, req.worker_q_claims, req.base_premium]]
    adj = float(m2_pricer.predict(features)[0])
    adj = max(-0.15, min(0.15, adj))
    new_premium = req.base_premium * (1 + adj)

    direction = "increase" if adj > 0.02 else ("decrease" if adj < -0.02 else "stable")

    return PricerResponse(
        premium_adjustment_pct=round(adj * 100, 2),
        new_premium=round(new_premium, 2),
        direction=direction,
        model_version=MODEL_VER,
    )


@app.post("/api/claims/fraud-check", response_model=FraudResponse)
def fraud_check(req: FraudRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not loaded")

    features = [[
        req.gps_distance_km, int(req.platform_logged_in),
        req.earnings_drop_pct, req.claims_7_days,
        int(req.duplicate_flag), req.cross_worker_match
    ]]

    # Isolation Forest score (-1 = anomaly, 1 = normal)
    iso_pred  = m3_fraud.predict(features)[0]
    iso_score = m3_fraud.decision_function(features)[0]  # more negative = more anomalous
    # Normalize to 0–1 (lower = more fraudulent)
    anomaly_score = round(1 - (iso_score + 0.5), 3)     # approx 0–1 risk

    triggered_rules = rule_based_fraud(req)
    rule_count = len(triggered_rules)

    # Combined fraud level
    if iso_pred == -1 or rule_count >= 3 or req.claims_7_days > 2 or req.duplicate_flag:
        fraud_level = "High"
    elif rule_count >= 1 or anomaly_score > 0.65:
        fraud_level = "Medium"
    else:
        fraud_level = "Low"

    return FraudResponse(
        fraud_level=fraud_level,
        auto_approve=fraud_level == "Low",
        requires_admin_review=fraud_level == "High",
        anomaly_score=min(1.0, max(0.0, anomaly_score)),
        triggered_rules=triggered_rules if triggered_rules else ["No rule violations detected"],
        model_version=MODEL_VER,
    )


@app.post("/api/trigger/classify", response_model=TriggerResponse)
def classify_trigger(req: TriggerRequest):
    if not AI_READY:
        raise HTTPException(503, "Model not loaded")

    persona_id = PERSONA_MAP.get(req.persona, 0)
    is_peak    = int((7 <= req.hour_of_day <= 10) or (18 <= req.hour_of_day <= 22))
    is_work    = int(6 <= req.hour_of_day <= 23)
    zone_match = int(req.zone_match)

    features = [[req.rain_mm, req.heat_index_c, req.strike_severity,
                 req.hour_of_day, persona_id, zone_match, is_peak, is_work]]

    trigger_valid = bool(m4_trigger.predict(features)[0])
    confidence    = float(m4_conf.predict(features)[0])
    confidence    = round(max(0.0, min(1.0, confidence)), 3)

    # Time-of-day guard: rain at 4am = no trigger
    if not is_work:
        trigger_valid = False
        confidence    = 0.02

    risk_factors = []
    if req.rain_mm > 100:    risk_factors.append(f"Red-alert rainfall ({req.rain_mm:.0f}mm)")
    elif req.rain_mm > 50:   risk_factors.append(f"Heavy rain warning ({req.rain_mm:.0f}mm)")
    if req.heat_index_c > 42: risk_factors.append(f"Extreme heat ({req.heat_index_c:.0f}C)")
    if req.strike_severity > 0.5: risk_factors.append(f"Major strike in {req.city}")
    if not is_work:          risk_factors.append("Outside working hours — trigger suppressed")
    if not zone_match:       risk_factors.append("Geographic zone overlap: not matched")
    if not risk_factors:     risk_factors.append("Normal conditions")

    # Payout estimate (only if valid)
    zone_mult = ZONE_MULT.get(1, 1.0)   # default zone 2 multiplier for demo
    payout = payout_from_trigger(req.rain_mm, req.heat_index_c,
                                  req.strike_severity, zone_mult) if trigger_valid else 0

    severity = "severe" if confidence > 0.7 else "moderate" if confidence > 0.4 else "low"
    reasoning = (
        f"SAMBAL AI assessed a {severity} disruption event at {req.hour_of_day:02d}:00 hrs "
        f"in {req.city} for {req.persona} workers on {req.platform}. "
        f"{'Trigger APPROVED — payout initiated.' if trigger_valid else 'Trigger REJECTED — conditions do not meet payout threshold at this hour.'}"
    )

    return TriggerResponse(
        trigger_valid=trigger_valid,
        confidence_score=confidence,
        estimated_payout_inr=payout,
        risk_factors=risk_factors,
        ai_reasoning=reasoning,
        model_version=MODEL_VER,
    )


if __name__ == "__main__":
    print("Starting SAMBAL AI v2 Server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
