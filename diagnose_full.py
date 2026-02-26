import urllib.request
import json
import os
import sys
import socket

# --- COLORS ---
G = '\033[92m' # Green
R = '\033[91m' # Red
Y = '\033[93m' # Yellow
W = '\033[0m'  # Reset

def check(name, status, msg=""):
    s = f"{G}PASS{W}" if status else f"{R}FAIL{W}"
    print(f"[{s}] {name}: {msg}")

def check_socket(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        result = s.connect_ex((host, port))
        return result == 0

def check_env_file():
    key_env = "backend/key.env"
    if os.path.exists(key_env):
        with open(key_env, "r") as f:
            content = f.read().strip()
            if "GEMINI_API_KEY" in content and "AIza" in content:
                check("Key File", True, f"Found valid key in {key_env}")
                return True
            else:
                check("Key File", False, f"File exists but content invalid: {content[:20]}...")
                return False
    else:
        check("Key File", False, f"Not found at {os.path.abspath(key_env)}")
        return False

def check_endpoint(host):
    url = f"http://{host}:8000/ai/analyze"
    try:
        req = urllib.request.Request(url, method="POST")
        with urllib.request.urlopen(req) as response:
            pass # Should not happen with POST
    except urllib.error.HTTPError as e:
        if e.code == 422: # Validation Error = It's alive!
            check(f"Endpoint ({host})", True, "Reachable (422 as expected)")
            return True
        elif e.code == 404:
            check(f"Endpoint ({host})", False, "404 Not Found (Old code running?)")
        elif e.code == 500:
             check(f"Endpoint ({host})", False, "500 Internal Error (Crash?)")
        else:
            check(f"Endpoint ({host})", False, f"Unexpected code: {e.code}")
    except Exception as e:
        check(f"Endpoint ({host})", False, f"Connection Failed: {e}")
    return False

print("--- DIAGNOSTIC START ---")

# 1. Check Key File
check_env_file()

# 2. Check Socket
port_open = check_socket("127.0.0.1", 8000)
check("Backend Port 8000", port_open, "Listening" if port_open else "Not Listening (Server down?)")

if port_open:
    # 3. Check Endpoint reachability
    check_endpoint("127.0.0.1")
    check_endpoint("localhost")

print("--- DIAGNOSTIC END ---")
