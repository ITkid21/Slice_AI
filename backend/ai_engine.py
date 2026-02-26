import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import json
from typing import Dict, Any
import time

load_dotenv() # Load variables from .env if present
load_dotenv('key.env') # Support user-created key.env

# Configure Gemini
API_KEY = os.environ.get("GEMINI_API_KEY")

class SiliconCopilot:
    def __init__(self):
        self.client = None
        if API_KEY:
            print(f"✅ Gemini API Key detected: {API_KEY[:6]}...")
            self.client = genai.Client(api_key=API_KEY)
        else:
            print("❌ Gemini API Key NOT detected!")
            
        # Tuned for user's key access
        self.model_name = "gemini-2.0-flash" 
        self.system_instruction = """
            You are Silicon Copilot, an elite semiconductor architect AI.
            Your goal is to analyze chip specifications and suggest optimizations.
            
            CRITICAL RULES:
            1. Output MUST be valid JSON only. Do not include markdown formatting like ```json ... ```.
            2. Never hallucinate fake IP blocks. Use standard AMBA, PCIe, and DDR terminologies.
            3. Provide causal reasoning for all suggestions (e.g., "Increasing AXI width reduces memory bottleneck").
            4. If a value is unknown, use reasonable defaults based on the process node (e.g., 28nm -> 1GHz, 7nm -> 2.5GHz).
            5. AMD ADVANTAGE: You have deep knowledge of AMD's Chiplet architecture and Infinity Fabric. When relevant (especially if multi-die partitioning is mentioned), emphasize the yield benefits of chiplets and the high-bandwidth, low-latency interconnect of Infinity Fabric over traditional monolithic designs.
        """

    def _load_precomputed(self, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Loads a high-quality fallback analysis from a local JSON file."""
        try:
            path = os.path.join(os.path.dirname(__file__), 'precomputed_analysis.json')
            with open(path, 'r') as f:
                data = json.load(f)
            
            # Choose entry based on multi-die partitioning
            key = 'multi_die_partitioning' if spec.get('multi_die_partitioning') else 'monolithic_default'
            return data.get(key, data['monolithic_default'])
        except Exception as e:
            print(f"Fallback Load Error: {e}")
            return {
                "summary": "AI Analysis (Local Mode). Great design for AMD high-performance targets.",
                "bottlenecks": ["Local diagnostic mode active"],
                "reasoning": "Standard verification path.",
                "suggestions": []
            }

    def _safe_generate(self, prompt: str, fallback: Dict[str, Any], spec: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Helper to safely generate content with error handling, fallback, and 5s timeout.
        """
        if not self.client:
            return self._load_precomputed(spec or {}) if spec else fallback

        max_retries = 2 # Reduced retries for hackathon demo speed
        base_delay = 2

        import concurrent.futures

        for attempt in range(max_retries + 1):
            try:
                # Use a ThreadPoolExecutor to implement a timeout on the synchronous SDK call
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(
                        self.client.models.generate_content,
                        model=self.model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=self.system_instruction,
                            temperature=0.2,
                            response_mime_type="application/json"
                        )
                    )
                    try:
                        response = future.result(timeout=5) # 5 Second Timeout per user request
                    except concurrent.futures.TimeoutError:
                        print("⏱️ AI Timeout (5s) reached. Falling back to Pre-computed Analysis.")
                        return self._load_precomputed(spec or {})
                
                # Parse JSON
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text.replace("```json", "").replace("```", "")
                
                return json.loads(text)

            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt < max_retries:
                        delay = base_delay * (2 ** attempt)
                        print(f"⚠️ Rate Limit hit. Retrying in {delay}s... (Attempt {attempt+1}/{max_retries})")
                        time.sleep(delay)
                        continue
                
                print(f"❌ AI Generation Error: {e}")
                break
        
        return self._load_precomputed(spec or {})

    def analyze_architecture(self, spec: Dict[str, Any], analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes the chip architecture using Gemini to find bottlenecks.
        """
        prompt = f"""
        Analyze this AI accelerator design:
        
        Spec:
        {json.dumps(spec)}
        
        Preliminary Analysis:
        {json.dumps(analysis_result)}
        
        AMD MODE: {'ENABLED (Multi-Die Partitioning via Infinity Fabric)' if spec.get('multi_die_partitioning') else 'DISABLED'}
        If enabled, focus on how partitioning the design across multiple dies (Chiplets) improves yield and how AMD Infinity Fabric manages the cross-die communication efficiently.
        
        Return JSON structure:
        {{
            "summary": "Executive summary string",
            "bottlenecks": ["List of strings"],
            "reasoning": "Detailed string explanation",
            "suggestions": [
                {{ "parameter": "name", "action": "increase/decrease", "value": "new_val", "reason": "why" }}
            ]
        }}
        """
        
        fallback = {
            "summary": "Analysis unavailable.",
            "bottlenecks": ["Unknown"],
            "reasoning": "Could not connect to Silicon Copilot.",
            "suggestions": []
        }

        return self._safe_generate(prompt, fallback, spec)

    def suggest_optimization(self, spec: Dict[str, Any], goal: str) -> Dict[str, Any]:
        """
        Suggests optimizations for Power, Performance, or Balanced.
        """
        prompt = f"""
        Optimize this spec for goal: {goal.upper()}
        
        Spec:
        {json.dumps(spec)}
        
        Constraints:
        - Maintain functional correctness.
        - Process node can be changed.
        
        Return JSON structure:
        {{
            "optimized_spec": {{ ...complete spec object... }},
            "changes": [
                {{ "parameter": "name", "old": "val", "new": "val", "reason": "explanation" }}
            ],
            "trade_offs": "Explanation string"
        }}
        """
        
        fallback = {
            "error": "Optimization unavailable",
            "changes": [],
            "trade_offs": "N/A"
        }

        return self._safe_generate(prompt, fallback, spec)
        
    def parse_natural_language_spec(self, text: str) -> Dict[str, Any]:
        """
        Parses natural language input into a ChipSpecification JSON.
        """
        prompt = f"""
        Convert this user request into a detailed Chip Specification JSON.
        User Input: "{text}"
        
        Extract or infer:
        - process_node (e.g. 5nm, 7nm, 28nm)
        - performance_goal (Edge AI, Data Center AI, Automotive AI)
        - compute_type (Inference Only, Training)
        - power_budget (in Watts)
        - standards (PCIe, USB, etc.)
        - cooling_solution (Passive, Active, Automotive)
        - packaging_type
        
        Return ONLY valid JSON matching this schema:
        {{
            "purpose": "Inferred title",
            "process_node": "...",
            "performance_goal": "...",
            "compute_type": "...",
            "power_budget": 5.0,
            "standards": ["..."],
            "num_npu_clusters": 1,
            "mac_units_per_cluster": 256,
            "packaging_type": "...",
            "temperature_range": "..."
        }}
        Use reasonable technical defaults for missing values based on the context (e.g. Data Center -> High Power, 5nm).
        """
        
        fallback = {
            "purpose": "AI Accelerator (Fallback)",
            "process_node": "28nm",
            "power_budget": 5.0,
            "performance_goal": "Edge AI"
        }
        
        return self._safe_generate(prompt, fallback)

# Singleton instance
ai_copilot = SiliconCopilot()
