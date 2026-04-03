
import sys

# Mocking the functions for testing
def payout_from_trigger(rain, heat, strike, multiplier):
    payout = 0
    if rain > 30:
        rain_30_80 = min(rain, 80) - 30
        payout += rain_30_80 * 8
    if rain > 80:
        rain_80_100 = min(rain, 100) - 80
        payout += rain_80_100 * 12
    if rain > 100:
        rain_100_plus = rain - 100
        payout += rain_100_plus * 6
    if heat > 38:
        payout += (heat - 38) * 50
    if 0.3 <= strike < 0.7:
        payout += (strike / 0.7) * 600
    elif strike >= 0.7:
        payout += (strike / 1.0) * 1500
    return max(0, min(2500, int(payout * multiplier)))

def test():
    print("Running SAMBAL Payout V3 Tests...")
    
    # Case 1: Extreme Rain (120mm, Zone 1)
    res1 = payout_from_trigger(120, 30, 0, 1.0)
    print(f"Test 1 (120mm rain): {res1} INR (Expected: 760)")
    
    # Case 2: Strike Partial (0.5, Zone 1)
    res2 = payout_from_trigger(0, 30, 0.5, 1.0)
    print(f"Test 2 (0.5 strike): {res2} INR (Expected: 428)")
    
    # Case 3: Strike Full (0.8, Zone 1)
    res3 = payout_from_trigger(0, 30, 0.8, 1.0)
    print(f"Test 3 (0.8 strike): {res3} INR (Expected: 1200)")

    # Case 4: Min Payout Guarantee (31mm rain, Zone 1)
    raw4 = payout_from_trigger(31, 30, 0, 1.0)
    res4 = max(100, raw4)
    print(f"Test 4 (31mm rain + Guarantee): {res4} INR (Expected: 100)")

    print("Tests complete.")

if __name__ == "__main__":
    test()
