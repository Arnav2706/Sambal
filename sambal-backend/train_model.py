"""
SAMBAL AI — Pure Python Random Forest Trainer
Implements Decision Trees + Bagging ensemble from scratch.
No external ML libraries required.
"""

import random
import pickle
import math

# ─────────────────────────────────────────────────────────────────────────────
# 1. TRAINING DATA GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def generate_dataset(n=6000, seed=42):
    """
    Generate realistic training samples mapping environmental/social
    conditions to disruption probability and payout amounts.

    Features:
        rain_mm          (0 – 150)   Rainfall in millimetres
        heat_index_c     (20 – 52)   Feels-like temperature in Celsius
        strike_severity  (0.0 – 1.0) 0 = none, 1 = total city shutdown
        density_factor   (0.5 – 1.5) Urban density multiplier

    Targets:
        payout           (0 – 2500)  INR payout for that day
        probability      (0 – 100)   Disruption probability %
    """
    random.seed(seed)
    X, y_payout, y_prob = [], [], []

    for _ in range(n):
        rain   = random.uniform(0, 150)
        heat   = random.uniform(20, 52)
        strike = random.uniform(0.0, 1.0)
        density = random.uniform(0.5, 1.5)

        # --- Payout logic (domain knowledge encoded as training signal) ---
        payout = 0.0

        # Rain component
        if rain > 20:  payout += (rain - 20) * 2
        if rain > 50:  payout += (rain - 50) * 8
        if rain > 100: payout += (rain - 100) * 15

        # Heat component (workers stop once heat is dangerous)
        if heat > 38:  payout += (heat - 38) * 20
        if heat > 42:  payout += (heat - 42) * 55
        if heat > 47:  payout += (heat - 47) * 80

        # Strike component (most impactful)
        if strike > 0.2: payout += (strike - 0.2) * 200
        if strike > 0.5: payout += (strike - 0.5) * 600
        if strike > 0.8: payout += (strike - 0.8) * 1200

        payout *= density
        noise  = random.gauss(0, 60)
        payout = max(0.0, min(2500.0, payout + noise))

        # --- Probability logic ---
        prob = 5.0
        if rain   > 20:   prob += 10
        if rain   > 50:   prob += 20
        if rain   > 100:  prob += 20
        if heat   > 38:   prob += 10
        if heat   > 42:   prob += 15
        if strike > 0.3:  prob += 20
        if strike > 0.6:  prob += 20
        if strike > 0.85: prob += 15
        prob = max(1.0, min(99.0, prob + random.gauss(0, 3)))

        X.append([rain, heat, strike, density])
        y_payout.append(payout)
        y_prob.append(prob)

    return X, y_payout, y_prob


# ─────────────────────────────────────────────────────────────────────────────
# 2. DECISION TREE (pure Python)
# ─────────────────────────────────────────────────────────────────────────────

class DecisionNode:
    __slots__ = ("feature", "threshold", "left", "right", "value")

    def __init__(self, feature=None, threshold=None, left=None,
                 right=None, value=None):
        self.feature   = feature
        self.threshold = threshold
        self.left      = left
        self.right     = right
        self.value     = value   # leaf value (mean of y in node)


def _mse(values):
    if not values:
        return 0.0
    mean = sum(values) / len(values)
    return sum((v - mean) ** 2 for v in values) / len(values)


def _best_split(X, y, n_features):
    n_samples = len(y)
    best_mse  = float("inf")
    best_feat = best_thresh = None

    # Random feature subset (Random Forest key step)
    feat_indices = random.sample(range(len(X[0])), min(n_features, len(X[0])))

    for feat in feat_indices:
        # Use a random subset of thresholds for speed
        values = sorted(set(row[feat] for row in X))
        step   = max(1, len(values) // 20)      # test at most ~20 split points
        thresholds = [values[i] for i in range(0, len(values), step)]

        for thresh in thresholds:
            left_y  = [y[i] for i in range(n_samples) if X[i][feat] <= thresh]
            right_y = [y[i] for i in range(n_samples) if X[i][feat] >  thresh]
            if not left_y or not right_y:
                continue

            mse = (len(left_y) * _mse(left_y) + len(right_y) * _mse(right_y)) / n_samples
            if mse < best_mse:
                best_mse, best_feat, best_thresh = mse, feat, thresh

    return best_feat, best_thresh


def _build_tree(X, y, depth, max_depth, min_samples, n_features):
    if depth >= max_depth or len(y) < min_samples or len(set(y)) == 1:
        return DecisionNode(value=sum(y) / len(y))

    feat, thresh = _best_split(X, y, n_features)
    if feat is None:
        return DecisionNode(value=sum(y) / len(y))

    left_mask  = [i for i in range(len(y)) if X[i][feat] <= thresh]
    right_mask = [i for i in range(len(y)) if X[i][feat] >  thresh]

    left  = _build_tree([X[i] for i in left_mask],  [y[i] for i in left_mask],
                        depth + 1, max_depth, min_samples, n_features)
    right = _build_tree([X[i] for i in right_mask], [y[i] for i in right_mask],
                        depth + 1, max_depth, min_samples, n_features)

    return DecisionNode(feature=feat, threshold=thresh, left=left, right=right)


def _predict_sample(node, x):
    while node.value is None:
        node = node.left if x[node.feature] <= node.threshold else node.right
    return node.value


# ─────────────────────────────────────────────────────────────────────────────
# 3. RANDOM FOREST (bagging of decision trees)
# ─────────────────────────────────────────────────────────────────────────────

class RandomForest:
    def __init__(self, n_trees=60, max_depth=10, min_samples=5, n_features=None):
        self.n_trees    = n_trees
        self.max_depth  = max_depth
        self.min_samples = min_samples
        self.n_features = n_features   # resolved at fit time
        self.trees      = []

    def fit(self, X, y):
        n = len(y)
        self.n_features = self.n_features or max(1, int(len(X[0]) ** 0.5))
        self.trees = []

        for t in range(self.n_trees):
            # Bootstrap sample
            indices = [random.randint(0, n - 1) for _ in range(n)]
            X_b = [X[i] for i in indices]
            y_b = [y[i] for i in indices]
            tree = _build_tree(X_b, y_b, 0, self.max_depth,
                               self.min_samples, self.n_features)
            self.trees.append(tree)
            print(f"  Tree {t+1}/{self.n_trees} trained", end="\r")

        print()

    def predict(self, X):
        return [
            sum(_predict_sample(t, x) for t in self.trees) / self.n_trees
            for x in X
        ]


# ─────────────────────────────────────────────────────────────────────────────
# 4. TRAIN & EVALUATE
# ─────────────────────────────────────────────────────────────────────────────

def rmse(preds, actuals):
    return math.sqrt(sum((p - a) ** 2 for p, a in zip(preds, actuals)) / len(preds))


if __name__ == "__main__":
    print("Generating dataset (6,000 samples)...")
    X, y_payout, y_prob = generate_dataset(6000)

    # 80/20 train-test split
    split = int(len(X) * 0.8)
    X_train, X_test   = X[:split], X[split:]
    yp_train, yp_test = y_payout[:split], y_payout[split:]
    yb_train, yb_test = y_prob[:split],   y_prob[split:]

    # ── Train payout model ────────────────────────────────────────────────
    print("\nTraining payout model (60 trees, depth 10)...")
    rf_payout = RandomForest(n_trees=60, max_depth=10)
    rf_payout.fit(X_train, yp_train)
    preds_p   = rf_payout.predict(X_test)
    print(f"  Payout RMSE: INR {rmse(preds_p, yp_test):.1f}")

    # ── Train probability model ───────────────────────────────────────────
    print("\nTraining probability model (60 trees, depth 10)...")
    rf_prob = RandomForest(n_trees=60, max_depth=10)
    rf_prob.fit(X_train, yb_train)
    preds_b  = rf_prob.predict(X_test)
    print(f"  Probability RMSE: {rmse(preds_b, yb_test):.2f}%")

    # ── Save trained models ───────────────────────────────────────────────
    model_bundle = {
        "version": "SAMBAL_AI_RF_v1",
        "rf_payout":      rf_payout,
        "rf_probability": rf_prob,
        "features": ["rain_mm", "heat_index_c", "strike_severity", "density_factor"],
    }

    with open("sambal_ai_model.pkl", "wb") as f:
        pickle.dump(model_bundle, f)

    print("\n  SAMBAL AI trained and saved as sambal_ai_model.pkl")
    print(f"   Model version : {model_bundle['version']}")
    print(f"   Trees per model: 60  |  Max depth: 10")
    print(f"   Training samples: {split}")
