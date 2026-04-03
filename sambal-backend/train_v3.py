"""
SAMBAL AI v3.0 — Enhanced Training Pipeline
Improvements over v2:
  - 3–4x more training samples per module
  - Higher tree counts with stronger regularization (subsample, colsample_bytree)
  - Richer feature engineering + combined-signal triggers
  - Lower trigger thresholds (rain >30mm + combined conditions)
  - Probability calibration on XGBoost outputs
  - Consistent random seeds for reproducibility
"""

import numpy as np
import pandas as pd
import pickle
import random
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error, brier_score_loss
import warnings
warnings.filterwarnings("ignore")

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

CITY_TIERS = {
    "Mumbai": 1, "Delhi": 1, "Bangalore": 1,
    "Hyderabad": 2, "Chennai": 2, "Kolkata": 2, "Pune": 2,
    "Jaipur": 3, "Lucknow": 3, "Bhopal": 3, "Surat": 3, "Nagpur": 3
}
PERSONAS = {"food_delivery": 0, "grocery": 1, "ride_hailing": 2, "logistics": 3}

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 1 — XGBoost Risk Profiler  (20,000 samples | 300 trees | depth 7)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 1: XGBoost Risk Profiler  [v3]")
print("="*60)

def gen_risk_data(n=20000):
    rows = []
    for _ in range(n):
        city      = random.choice(list(CITY_TIERS.keys()))
        city_tier = CITY_TIERS[city]
        zone      = random.randint(1, 5)
        persona   = random.choice(list(PERSONAS.keys()))
        p_id      = PERSONAS[persona]
        earn      = random.uniform(300, 2000)
        hours     = random.uniform(15, 75)
        month     = random.randint(1, 12)
        tenure_months = random.randint(1, 36)   # NEW: how long on platform

        risk = 15
        risk += (4 - city_tier) * 9
        risk += zone * 4
        risk += max(0, hours - 40) * 0.6
        risk += max(0, 1000 - earn) * 0.012
        risk += max(0, 18 - tenure_months) * 0.5   # new workers = higher risk
        if month in [6, 7, 8, 9]:   risk += 22     # monsoon
        if month in [4, 5]:          risk += 8      # summer heat
        if persona == "food_delivery": risk += 12
        if persona == "ride_hailing":  risk += 6
        risk += random.gauss(0, 6)
        risk = max(1, min(99, risk))

        if   risk < 28: label = 0
        elif risk < 50: label = 1
        elif risk < 72: label = 2
        else:           label = 3

        rows.append([city_tier, zone, p_id, earn, hours, month, tenure_months, label])

    return pd.DataFrame(rows, columns=[
        "city_tier", "delivery_zone", "persona",
        "avg_daily_earn", "weekly_hours", "month", "tenure_months", "zone_label"
    ])

df1 = gen_risk_data(20000)
X1 = df1.drop("zone_label", axis=1)
y1 = df1["zone_label"]
X1_tr, X1_te, y1_tr, y1_te = train_test_split(X1, y1, test_size=0.2, random_state=SEED)

base_m1 = XGBClassifier(
    n_estimators=300, max_depth=7, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
    reg_alpha=0.1, reg_lambda=1.0,
    eval_metric="mlogloss", random_state=SEED, verbosity=0
)
base_m1.fit(X1_tr, y1_tr)
# Calibrate probabilities for better confidence scores
xgb_risk = CalibratedClassifierCV(base_m1, method="isotonic", cv=3)
xgb_risk.fit(X1_tr, y1_tr)
print(classification_report(y1_te, xgb_risk.predict(X1_te), target_names=["Zone1","Zone2","Zone3","Zone4"]))

ZONE_MULTIPLIER = {0: 1.0, 1: 1.2, 2: 1.5, 3: 2.0}

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 2 — GBR Weekly Pricer  (25,000 samples | 400 trees | depth 6)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 2: Gradient Boosting Weekly Pricer  [v3]")
print("="*60)

def gen_pricer_data(n=25000):
    rows = []
    for _ in range(n):
        rain_7d    = random.uniform(0, 250)
        temp_avg   = random.uniform(18, 50)
        aqi        = random.uniform(40, 450)
        civic_ev   = random.randint(0, 4)
        zone_claims = random.uniform(0, 80)
        wq_claims  = random.randint(0, 10)
        base_prem  = random.uniform(40, 400)
        wind_kmh   = random.uniform(0, 60)       # NEW: wind speed factor

        adj = 0.0
        if rain_7d > 80:   adj += 0.07
        if rain_7d > 130:  adj += 0.05
        if rain_7d > 180:  adj += 0.03
        if temp_avg > 40:  adj += 0.04
        if temp_avg > 45:  adj += 0.03
        if aqi > 200:      adj += 0.03
        if aqi > 300:      adj += 0.04
        if wind_kmh > 40:  adj += 0.03
        if civic_ev > 0:   adj += 0.04 * civic_ev
        if zone_claims > 40: adj += 0.04
        if zone_claims > 60: adj += 0.03
        if wq_claims > 5:  adj -= 0.04
        if wq_claims > 8:  adj -= 0.03
        adj += random.gauss(0, 0.015)
        adj = max(-0.15, min(0.15, adj))

        rows.append([rain_7d, temp_avg, aqi, civic_ev,
                     zone_claims, wq_claims, base_prem, wind_kmh, adj])

    return pd.DataFrame(rows, columns=[
        "rain_7d", "temp_avg", "aqi", "civic_events",
        "zone_claims", "worker_q_claims", "base_premium", "wind_kmh", "premium_adj"
    ])

df2 = gen_pricer_data(25000)
X2 = df2.drop("premium_adj", axis=1)
y2 = df2["premium_adj"]
X2_tr, X2_te, y2_tr, y2_te = train_test_split(X2, y2, test_size=0.2, random_state=SEED)

gbr_pricer = GradientBoostingRegressor(
    n_estimators=400, max_depth=6, learning_rate=0.03,
    subsample=0.8, min_samples_split=10, min_samples_leaf=5,
    random_state=SEED
)
gbr_pricer.fit(X2_tr, y2_tr)
print(f"  Premium Adj MAE: {mean_absolute_error(y2_te, gbr_pricer.predict(X2_te))*100:.2f}%")

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 3 — Isolation Forest Fraud  (30,000 samples | 300 trees)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 3: Isolation Forest Fraud Engine  [v3]")
print("="*60)

def gen_fraud_data(n=30000):
    rows = []
    for _ in range(n):
        gps_dist     = random.uniform(0, 6)
        logged_in    = random.choice([0, 1])
        earn_drop    = random.uniform(0, 1)
        claims_7d    = random.randint(0, 7)
        duplicate    = random.choice([0, 0, 0, 0, 1])
        cross_match  = random.uniform(0, 1)
        claim_gap_hrs = random.uniform(0, 168)   # NEW: hours since last claim

        rows.append([gps_dist, logged_in, earn_drop,
                     claims_7d, duplicate, cross_match, claim_gap_hrs])

    return pd.DataFrame(rows, columns=[
        "gps_distance_km", "platform_logged_in", "earnings_drop_pct",
        "claims_7_days", "duplicate_flag", "cross_worker_match", "claim_gap_hrs"
    ])

df3 = gen_fraud_data(30000)
iso_fraud = IsolationForest(
    n_estimators=300, contamination=0.07,
    max_samples=512, random_state=SEED, n_jobs=-1
)
iso_fraud.fit(df3)
scores = iso_fraud.decision_function(df3)
print(f"  Score range: [{scores.min():.3f}, {scores.max():.3f}]")
print(f"  Anomalies: {(iso_fraud.predict(df3)==-1).sum()} / {len(df3)}")

# ─────────────────────────────────────────────────────────────────────────────
# MODULE 4 — Parametric Trigger + Confidence  (30,000 samples | 400+200 trees)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("MODULE 4: Parametric Trigger + Confidence Scorer  [v3]")
print("="*60)

def gen_trigger_data(n=30000):
    rows = []
    for _ in range(n):
        rain_mm   = random.uniform(0, 160)
        heat_c    = random.uniform(20, 52)
        strike    = random.uniform(0, 1)
        hour      = random.randint(0, 23)
        persona   = random.choice(list(PERSONAS.keys()))
        p_id      = PERSONAS[persona]
        zone_match = random.choice([0, 1])
        wind_kmh  = random.uniform(0, 60)         # NEW
        aqi       = random.uniform(40, 400)        # NEW

        is_peak   = (7 <= hour <= 10) or (18 <= hour <= 22)
        is_work   = 6 <= hour <= 23

        base = False
        conf = 0.0

        if not is_work:
            base = False
            conf = 0.02
        elif zone_match:
            # ENHANCED: combined signals lower the threshold
            rain_score   = 0.0
            heat_score   = 0.0
            strike_score = 0.0

            # Rain: triggers at >30mm now (was 50mm)
            if rain_mm > 30:
                rain_score = min(0.55, (rain_mm - 30) / 130 * 0.55)
                if is_peak: rain_score += 0.15
            if rain_mm > 80:
                rain_score = min(0.80, rain_score + 0.20)
            if rain_mm > 120:
                rain_score = min(0.95, rain_score + 0.15)

            # Heat: triggers at >38°C (was 42°C)
            if heat_c > 38:
                heat_score = min(0.45, (heat_c - 38) / 14 * 0.45)
            if heat_c > 44:
                heat_score = min(0.75, heat_score + 0.30)

            # Strike: triggers at >0.3 (was 0.5)
            if strike > 0.3:
                strike_score = min(0.60, (strike - 0.3) / 0.7 * 0.60)
            if strike > 0.7:
                strike_score = min(0.90, strike_score + 0.30)

            # Combined bonus: rain + strike together
            if rain_mm > 30 and strike > 0.3:
                combo = min(0.20, (rain_mm / 160 + strike) * 0.10)
                rain_score = min(1.0, rain_score + combo)
                strike_score = min(1.0, strike_score + combo)

            # High wind adds to confidence
            if wind_kmh > 40:
                rain_score = min(1.0, rain_score + 0.08)

            conf = max(rain_score, heat_score, strike_score)
            base = conf > 0.15   # threshold to be a valid trigger

        conf += random.gauss(0, 0.03)
        conf = max(0.0, min(1.0, conf))

        rows.append([rain_mm, heat_c, strike, hour, p_id,
                     int(zone_match), int(is_peak), int(is_work),
                     wind_kmh, aqi, int(base), round(conf, 3)])

    return pd.DataFrame(rows, columns=[
        "rain_mm", "heat_index_c", "strike_severity", "hour_of_day",
        "persona", "zone_match", "is_peak", "is_work_hour",
        "wind_kmh", "aqi", "trigger_valid", "confidence"
    ])

df4 = gen_trigger_data(30000)
feat4 = ["rain_mm", "heat_index_c", "strike_severity", "hour_of_day",
         "persona", "zone_match", "is_peak", "is_work_hour", "wind_kmh", "aqi"]
X4  = df4[feat4]
y4t = df4["trigger_valid"]
y4c = df4["confidence"]

X4_tr, X4_te, yt_tr, yt_te = train_test_split(X4, y4t, test_size=0.2, random_state=SEED)
_,     _,     yc_tr, yc_te = train_test_split(X4, y4c, test_size=0.2, random_state=SEED)

# Trigger classifier — calibrated
base_m4 = XGBClassifier(
    n_estimators=400, max_depth=8, learning_rate=0.04,
    subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
    reg_alpha=0.05, reg_lambda=1.0,
    eval_metric="logloss", random_state=SEED, verbosity=0
)
base_m4.fit(X4_tr, yt_tr)
xgb_trigger = CalibratedClassifierCV(base_m4, method="isotonic", cv=3)
xgb_trigger.fit(X4_tr, yt_tr)
print(classification_report(yt_te, xgb_trigger.predict(X4_te),
      target_names=["Invalid Trigger", "Valid Trigger"]))

# Confidence scorer
gbr_confidence = GradientBoostingRegressor(
    n_estimators=200, max_depth=6, learning_rate=0.05,
    subsample=0.8, min_samples_split=8, min_samples_leaf=4,
    random_state=SEED
)
gbr_confidence.fit(X4_tr, yc_tr)
preds_c = gbr_confidence.predict(X4_te)
print(f"  Confidence MAE: {mean_absolute_error(yc_te, preds_c):.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# SAVE BUNDLE v3
# ─────────────────────────────────────────────────────────────────────────────
bundle = {
    "version": "SAMBAL_AI_v3.0",
    "module1_risk_profiler":      xgb_risk,
    "module2_weekly_pricer":      gbr_pricer,
    "module3_fraud_detector":     iso_fraud,
    "module4_trigger_classifier": xgb_trigger,
    "module4_confidence_scorer":  gbr_confidence,
    "zone_multiplier_map":        ZONE_MULTIPLIER,
    "persona_map":                PERSONAS,
    "city_tier_map":              CITY_TIERS,
    "trigger_features":           feat4,
    "features": {
        "module1": ["city_tier","delivery_zone","persona","avg_daily_earn",
                    "weekly_hours","month","tenure_months"],
        "module2": ["rain_7d","temp_avg","aqi","civic_events","zone_claims",
                    "worker_q_claims","base_premium","wind_kmh"],
        "module3": ["gps_distance_km","platform_logged_in","earnings_drop_pct",
                    "claims_7_days","duplicate_flag","cross_worker_match","claim_gap_hrs"],
        "module4": feat4,
    }
}

with open("sambal_ai_v3.pkl", "wb") as f:
    pickle.dump(bundle, f)

import os
size_mb = os.path.getsize("sambal_ai_v3.pkl") / 1_000_000
print("\n" + "="*60)
print(f"SAMBAL AI v3.0 saved  [{size_mb:.1f} MB]")
print(f"  M1 Risk Profiler    : 300 trees, depth 7 | 20,000 samples")
print(f"  M2 Weekly Pricer    : 400 trees, depth 6 | 25,000 samples")
print(f"  M3 Isolation Forest : 300 trees          | 30,000 samples")
print(f"  M4 Trigger XGBoost  : 400 trees, depth 8 | 30,000 samples")
print(f"  M4 Confidence GBR   : 200 trees, depth 6 | 30,000 samples")
print(f"  Combined trees      : {300+400+300+400+200}")
print("="*60)
