"""
SAMBAL AI — Full ML Training Pipeline
Module 1: XGBoost Risk Profiler
Module 2: Gradient Boosting Dynamic Weekly Pricer
Module 3: Isolation Forest Fraud Detection
Module 4: Parametric Trigger Classifier
"""

import numpy as np
import pandas as pd
import pickle
import random
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error

random.seed(42)
np.random.seed(42)

CITY_TIERS = {"Mumbai": 1, "Delhi": 1, "Bangalore": 1, "Hyderabad": 2, "Chennai": 2,
              "Kolkata": 2, "Pune": 2, "Jaipur": 3, "Lucknow": 3, "Bhopal": 3}
PERSONAS   = {"food_delivery": 0, "grocery": 1, "ride_hailing": 2, "logistics": 3}
PLATFORMS  = ["Swiggy", "Zomato", "Blinkit", "Rapido", "Uber", "Porter"]

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 1 — RISK PROFILER (XGBoost Classifier)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 1: XGBoost Risk Profiler")
print("="*60)

def gen_risk_profiler_data(n=8000):
    rows = []
    for _ in range(n):
        city       = random.choice(list(CITY_TIERS.keys()))
        city_tier  = CITY_TIERS[city]
        zone       = random.randint(1, 5)           # delivery zone density
        persona    = random.choice(list(PERSONAS.keys()))
        persona_id = PERSONAS[persona]
        avg_daily_earn = random.uniform(300, 1800)
        weekly_hours   = random.uniform(20, 70)
        month          = random.randint(1, 12)

        # Risk score logic: higher tier city, high hours, monsoon months → higher risk
        risk = 20
        risk += (4 - city_tier) * 8           # tier 1 = more exposure
        risk += zone * 5                       # denser zones = more risk
        risk += (weekly_hours - 40) * 0.5     # long hours = fatigue risk
        risk += (1000 - avg_daily_earn) * 0.01 # lower earners = more vulnerable
        if month in [6, 7, 8, 9]:             # monsoon season
            risk += 20
        if persona == "food_delivery":
            risk += 10
        risk += random.gauss(0, 8)
        risk = max(1, min(99, risk))

        # Map to zone 1–4
        if risk < 30:   zone_label = 0
        elif risk < 50: zone_label = 1
        elif risk < 70: zone_label = 2
        else:           zone_label = 3

        rows.append([city_tier, zone, persona_id, avg_daily_earn,
                     weekly_hours, month, risk, zone_label])

    df = pd.DataFrame(rows, columns=["city_tier", "delivery_zone", "persona",
                                     "avg_daily_earn", "weekly_hours", "month",
                                     "risk_score", "zone_label"])
    return df

df1 = gen_risk_profiler_data(8000)
X1  = df1[["city_tier", "delivery_zone", "persona", "avg_daily_earn", "weekly_hours", "month"]]
y1  = df1["zone_label"]

X1_tr, X1_te, y1_tr, y1_te = train_test_split(X1, y1, test_size=0.2, random_state=42)

xgb_risk = XGBClassifier(n_estimators=150, max_depth=5, learning_rate=0.1,
                          use_label_encoder=False, eval_metric="mlogloss",
                          random_state=42, verbosity=0)
xgb_risk.fit(X1_tr, y1_tr)
preds1 = xgb_risk.predict(X1_te)
print(classification_report(y1_te, preds1, target_names=["Zone1","Zone2","Zone3","Zone4"]))

# Zone → risk multiplier mapping
ZONE_MULTIPLIER = {0: 1.0, 1: 1.2, 2: 1.5, 3: 2.0}

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — DYNAMIC WEEKLY PRICER (Gradient Boosting Regressor)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 2: Gradient Boosting Dynamic Weekly Pricer")
print("="*60)

def gen_pricer_data(n=10000):
    rows = []
    for _ in range(n):
        rain_7d     = random.uniform(0, 200)          # 7-day accumulated rain mm
        temp_avg    = random.uniform(20, 48)
        aqi         = random.uniform(50, 400)
        civic_events = random.randint(0, 3)            # strikes/events in 7 days
        zone_claims  = random.uniform(0, 50)           # zone-level claims
        worker_q_claims = random.randint(0, 8)         # worker's quarterly claim count
        base_premium = random.uniform(50, 300)

        # Adjustment logic
        adj = 0.0
        if rain_7d > 100: adj += 0.10
        if rain_7d > 150: adj += 0.05
        if temp_avg > 42: adj += 0.05
        if aqi > 250:     adj += 0.05
        if civic_events > 1: adj += 0.05 * civic_events
        if zone_claims > 30: adj += 0.05
        if worker_q_claims > 4: adj -= 0.05  # high-claim workers pay more → less discount
        adj += random.gauss(0, 0.02)
        adj = max(-0.15, min(0.15, adj))  # cap at ±15%

        rows.append([rain_7d, temp_avg, aqi, civic_events,
                     zone_claims, worker_q_claims, base_premium, adj])

    df = pd.DataFrame(rows, columns=["rain_7d", "temp_avg", "aqi", "civic_events",
                                     "zone_claims", "worker_q_claims", "base_premium",
                                     "premium_adj"])
    return df

df2 = gen_pricer_data(10000)
X2  = df2[["rain_7d", "temp_avg", "aqi", "civic_events", "zone_claims",
           "worker_q_claims", "base_premium"]]
y2  = df2["premium_adj"]

X2_tr, X2_te, y2_tr, y2_te = train_test_split(X2, y2, test_size=0.2, random_state=42)

gbr_pricer = GradientBoostingRegressor(n_estimators=200, max_depth=5,
                                        learning_rate=0.05, random_state=42)
gbr_pricer.fit(X2_tr, y2_tr)
preds2 = gbr_pricer.predict(X2_te)
print(f"  Premium Adj MAE: {mean_absolute_error(y2_te, preds2)*100:.2f}%")

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 3 — FRAUD DETECTION (Isolation Forest + Rule Layer)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 3: Isolation Forest Fraud Detection Engine")
print("="*60)

def gen_fraud_data(n=12000):
    rows = []
    for _ in range(n):
        gps_distance_km    = random.uniform(0, 5)    # Haversine distance from claimed zone
        platform_logged_in = random.choice([0, 1])
        earnings_drop_pct  = random.uniform(0, 1)    # 0=none, 1=100% drop
        claims_7_days      = random.randint(0, 6)
        duplicate_flag     = random.choice([0, 0, 0, 0, 1])  # 20% duplicate
        cross_worker_match = random.uniform(0, 1)    # similarity to other claims at same time

        # Fraud scoring for training reference (not used as label — unsupervised)
        rows.append([gps_distance_km, platform_logged_in, earnings_drop_pct,
                     claims_7_days, duplicate_flag, cross_worker_match])

    return pd.DataFrame(rows, columns=["gps_distance_km", "platform_logged_in",
                                       "earnings_drop_pct", "claims_7_days",
                                       "duplicate_flag", "cross_worker_match"])

df3 = gen_fraud_data(12000)
iso_fraud = IsolationForest(n_estimators=200, contamination=0.08,
                             random_state=42, n_jobs=-1)
iso_fraud.fit(df3)
scores = iso_fraud.decision_function(df3)
print(f"  Isolation Forest trained. Score range: [{scores.min():.3f}, {scores.max():.3f}]")
print(f"  Anomalies flagged: {(iso_fraud.predict(df3) == -1).sum()} / {len(df3)}")

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 4 — PARAMETRIC TRIGGER CLASSIFIER
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 4: Parametric Trigger Classifier")
print("="*60)

def gen_trigger_data(n=10000):
    rows = []
    for _ in range(n):
        rain_mm        = random.uniform(0, 150)
        heat_index_c   = random.uniform(20, 52)
        strike_severity= random.uniform(0, 1)
        hour_of_day    = random.randint(0, 23)
        persona        = random.choice(["food_delivery", "grocery", "ride_hailing"])
        zone_match     = random.choice([0, 1])     # geographic overlap with event

        # Peak-hour weighting: 7-10am and 6-10pm for food delivery
        is_peak = (7 <= hour_of_day <= 10) or (18 <= hour_of_day <= 22)
        is_work_hour = 6 <= hour_of_day <= 23

        # Trigger logic
        base_trigger = False
        confidence = 0.0

        if not is_work_hour:
            # Rain at 3am doesn't trigger — no income being generated
            base_trigger = False
            confidence = 0.02
        elif rain_mm > 50 and zone_match:
            base_trigger = True
            confidence += min(1.0, rain_mm / 150 * 0.6 + (0.3 if is_peak else 0.1))
        elif heat_index_c > 42 and zone_match and is_work_hour:
            base_trigger = True
            confidence += min(1.0, (heat_index_c - 42) / 10 * 0.5 + 0.2)
        elif strike_severity > 0.5 and zone_match:
            base_trigger = True
            confidence += min(1.0, strike_severity * 0.8)

        confidence += random.gauss(0, 0.05)
        confidence = max(0.0, min(1.0, confidence))

        rows.append([rain_mm, heat_index_c, strike_severity, hour_of_day,
                     PERSONAS.get(persona, 0), int(zone_match), int(is_peak),
                     int(is_work_hour), int(base_trigger), round(confidence, 3)])

    return pd.DataFrame(rows, columns=["rain_mm", "heat_index_c", "strike_severity",
                                       "hour_of_day", "persona", "zone_match",
                                       "is_peak", "is_work_hour",
                                       "trigger_valid", "confidence"])

df4 = gen_trigger_data(10000)
X4  = df4[["rain_mm", "heat_index_c", "strike_severity", "hour_of_day",
           "persona", "zone_match", "is_peak", "is_work_hour"]]
y4_trigger = df4["trigger_valid"]
y4_conf    = df4["confidence"]

X4_tr, X4_te, yt_tr, yt_te = train_test_split(X4, y4_trigger, test_size=0.2, random_state=42)
_, _, yc_tr, yc_te  = train_test_split(X4, y4_conf, test_size=0.2, random_state=42)

# XGBoost for trigger valid/invalid classification
xgb_trigger = XGBClassifier(n_estimators=150, max_depth=6, learning_rate=0.1,
                              use_label_encoder=False, eval_metric="logloss",
                              random_state=42, verbosity=0)
xgb_trigger.fit(X4_tr, yt_tr)

# GBR for confidence score
gbr_confidence = GradientBoostingRegressor(n_estimators=100, max_depth=4,
                                            learning_rate=0.1, random_state=42)
gbr_confidence.fit(X4_tr, yc_tr)

preds4 = xgb_trigger.predict(X4_te)
print(classification_report(yt_te, preds4, target_names=["Invalid Trigger", "Valid Trigger"]))

# ─────────────────────────────────────────────────────────────────────────────
# SAVE ALL MODELS
# ─────────────────────────────────────────────────────────────────────────────
bundle = {
    "version": "SAMBAL_AI_v2.0",
    "module1_risk_profiler":     xgb_risk,
    "module2_weekly_pricer":     gbr_pricer,
    "module3_fraud_detector":    iso_fraud,
    "module4_trigger_classifier": xgb_trigger,
    "module4_confidence_scorer": gbr_confidence,
    "zone_multiplier_map":       ZONE_MULTIPLIER,
    "persona_map":               PERSONAS,
    "city_tier_map":             CITY_TIERS,
    "features": {
        "module1": ["city_tier", "delivery_zone", "persona", "avg_daily_earn", "weekly_hours", "month"],
        "module2": ["rain_7d", "temp_avg", "aqi", "civic_events", "zone_claims", "worker_q_claims", "base_premium"],
        "module3": ["gps_distance_km", "platform_logged_in", "earnings_drop_pct", "claims_7_days", "duplicate_flag", "cross_worker_match"],
        "module4": ["rain_mm", "heat_index_c", "strike_severity", "hour_of_day", "persona", "zone_match", "is_peak", "is_work_hour"],
    }
}

with open("sambal_ai_v2.pkl", "wb") as f:
    pickle.dump(bundle, f)

print("\n" + "="*60)
print("SAMBAL AI v2.0 — All 4 modules trained and saved.")
print(f"  Module 1: XGBoost Risk Profiler      ({len(df1)} samples)")
print(f"  Module 2: GBR Weekly Pricer          ({len(df2)} samples)")
print(f"  Module 3: Isolation Forest Fraud     ({len(df3)} samples)")
print(f"  Module 4: XGBoost Trigger Classifier ({len(df4)} samples)")
print("="*60)
