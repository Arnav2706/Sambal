import pickle
try:
    with open("sambal_ai_v3.pkl", "rb") as f:
        bundle = pickle.load(f)
    print("SUCCESS: Model loaded!")
    print("Version:", bundle.get("version", "unknown"))
    print("Keys:", list(bundle.keys()))
except FileNotFoundError:
    print("ERROR: sambal_ai_v3.pkl not found in current directory")
except Exception as e:
    print(f"ERROR loading model: {e}")
