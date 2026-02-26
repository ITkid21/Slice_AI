
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_full_flow():
    print("--- Starting System Verification ---")
    
    # 1. Define Spec (Competition Mode)
    spec = {
        "purpose": "High-Performance AI Training",
        "frequency": 2.5,
        "power_budget": 50.0,
        "process_node": "5nm",
        "memory_type": "HBM3",
        "standards": ["PCIe", "USB"],
        "num_npu_clusters": 8,
        "mac_units_per_cluster": 1024,
        "axi_width": 256,
        "ddr_width": 256,
        "competition_mode": True
    }
    
    # 2. Test Architecture Gen
    print("\n[TEST] Generating Architecture...")
    try:
        t0 = time.time()
        res = requests.post(f"{BASE_URL}/analyze", json=spec)
        dt = time.time() - t0
        if res.status_code == 200:
            data = res.json()
            warnings = data['feasibility']['warnings']
            print(f"✅ Success ({dt:.2f}s)")
            print(f"   Area: {data['feasibility']['area_estimate']}")
            if warnings: print(f"   Warnings: {warnings}")
        else:
            print(f"❌ Failed: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return

    # 3. Test RTL Gen
    print("\n[TEST] Generating RTL...")
    try:
        res = requests.post(f"{BASE_URL}/generate-code", json=spec)
        if res.status_code == 200:
            data = res.json()
            rtl = data['rtl']
            if "top_chip.v" in rtl and "npu_cluster.v" in rtl:
                print("✅ Success: Top and NPU modules generated.")
                # Check for placeholders
                if "Place holder" in rtl['axi_interconnect.v']:
                     print("⚠️ Warning: Interconnect is placeholder (Expected for simple version but check requirements).")
                else:
                     print("✅ Interconnect is valid logic.")
            else:
                print("❌ Missing required RTL files.")
        else:
             print(f"❌ Failed: {res.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 4. Test AI Analysis
    print("\n[TEST] AI Analysis (Gemini 1.5 Flash)...")
    try:
        res = requests.post(f"{BASE_URL}/ai/analyze", json=spec)
        if res.status_code == 200:
            ai_data = res.json()
            if "summary" in ai_data and "bottlenecks" in ai_data:
                print("✅ Success: Structured JSON received.")
                print(f"   Summary: {ai_data['summary'][:100]}...")
            else:
                print(f"❌ Invalid format: {ai_data.keys()}")
        else:
            print(f"❌ Failed: {res.status_code} - {res.text}")
    except Exception as e:
         print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_full_flow()
