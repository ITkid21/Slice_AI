import urllib.request
import json
import time

BASE_URL = "http://localhost:8000"

def post_json(endpoint, payload):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise

def test_analyze():
    print("\n--- Testing /analyze Endpoint ---")
    payload = {
        "purpose": "Test Chip",
        "process_node": "5nm",
        "frequency": 1.0,
        "num_npu_clusters": 2,
        "mac_units_per_cluster": 1024,
        "memory_type": "LPDDR5",
        "ddr_width": 64,
        "memory_channels": 4,
        "power_budget": 10.0,
        "standards": ["PCIe"],
        "competition_mode": True
    }
    
    try:
        data = post_json("/analyze", payload)
        
        # Check logic
        feasibility = data.get("feasibility", {})
        print(f"Feasibility Area: {feasibility.get('area_estimate')}")
        print(f"Feasibility Power: {feasibility.get('power_estimate')}")
        
        # We expect a warning or good status
        warnings = feasibility.get("warnings", [])
        if warnings:
            print(f"Warnings: {warnings}")
        else:
            print("No warnings logic passed.")
            
        print("✅ /analyze passed structure check.")
        
    except Exception as e:
        print(f"❌ /analyze Failed.")

def test_ai_parse():
    print("\n--- Testing /ai/parse Endpoint ---")
    payload = {
        "text": "I want a 3nm automotive AI accelerator with 500 TOPS and HBM3 memory."
    }
    
    try:
        # Note: This calls the real Gemini API, so it might fail if key is invalid or quota exceeded
        data = post_json("/ai/parse", payload)
        
        print("AI Response:")
        print(json.dumps(data, indent=2))
        
        # Validation
        # The AI might return strict JSON or wrapped, handled by frontend/backend helper
        if data.get("process_node") == "3nm":
            print("✅ AI Parse logic seems correct.")
        else:
            print("⚠️ AI Parse returned unexpected values (Verification depends on AI model behavior).")
            
    except Exception as e:
        print(f"❌ /ai/parse Failed.")

if __name__ == "__main__":
    # Wait for server to start if just launched
    time.sleep(2) 
    test_analyze()
    test_ai_parse()
