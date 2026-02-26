from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import ChipSpecification
from engine import analyze_feasibility, generate_architecture, generate_rtl, generate_testbench
from floorplan_engine import generate_floorplan
from ai_engine import ai_copilot
from models import ChipSpecification, ArchitectureGraph

app = FastAPI(title="SiliceAI Architect Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sliceai-96926.web.app",
        "https://sliceai-96926.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SiliceAI Architect Backend is running"}

@app.post("/analyze")
def analyze(spec: ChipSpecification):
    feasibility = analyze_feasibility(spec)
    architecture = generate_architecture(spec)
    return {
        "feasibility": feasibility,
        "architecture": architecture
    }

@app.post("/generate-floorplan")
def generate_floorplan_endpoint(graph: ArchitectureGraph):
    return generate_floorplan(graph)

@app.post("/generate-code")
def generate_code_endpoint(spec: ChipSpecification):
    architecture = generate_architecture(spec) # Re-generate or pass graph? specificying spec is easier for MVP
    rtl = generate_rtl(spec, architecture)
    tb = generate_testbench(spec)
    return {
        "rtl": rtl,
        "testbench": tb
    }

@app.post("/ai/analyze")
def analyze_with_ai(spec: ChipSpecification):
    # Run deterministic analysis first to give context to AI
    feasibility = analyze_feasibility(spec)
    # Get AI insights
    ai_result = ai_copilot.analyze_architecture(spec.dict(), feasibility.dict())
    return ai_result

@app.post("/ai/optimize")
def optimize_with_ai(spec: ChipSpecification, goal: str = "balanced"):
    optimization = ai_copilot.suggest_optimization(spec.dict(), goal)
    return optimization

@app.post("/ai/parse")
def parse_ai_spec(request: dict):
    """
    Parses natural language text into a structured Chip Specification.
    Expects {"text": "I want a 5nm automotive chip..."}
    """
    text = request.get("text", "")
    return ai_copilot.parse_natural_language_spec(text)
