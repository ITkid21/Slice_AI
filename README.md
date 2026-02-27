🚀 AI-Powered IC Architecture Studio

Our idea is to bring complex IC design into a smooth, visual, and easy-to-understand software experience.

This project is an AI-assisted hardware architecture platform that allows users to visually design AI accelerators and custom chips, then automatically generate clean, synthesizable Verilog RTL.

🔥 What It Does

🧩 Drag-and-drop architecture builder (NPU clusters, NoC, DDR, etc.)

🤖 AI-generated RTL (Verilog) from visual block diagrams

⚡ Automatic parameter handling (AXI width, cluster count, bus width)

🧠 Intelligent validation (detects connection mismatches & structural errors)

🎬 Interactive onboarding + cinematic startup experience

📤 Export-ready code for FPGA/ASIC workflows

💡 Why This Project Exists

Traditional hardware tools like Vivado and Quartus Prime require deep HDL knowledge before architectural understanding.

Our platform flips the workflow:

Architecture First → AI Generates RTL → Validate → Export

This makes hardware design:

More accessible to students

Faster for startups

Less error-prone for system architects

🎯 Target Users

B.Tech / ECE / CSE students learning VLSI & FPGA

AI hardware researchers

Accelerator prototype developers

Early-stage semiconductor startups

🛠 Tech Stack (Planned / In Progress)

Frontend: Dynamic visual builder UI

Backend: AI RTL generation engine

HDL Output: Verilog (parameterized, modular)

Future: Synthesis compatibility & cloud simulation

🚀 Vision

To democratize chip architecture design by combining:

Visual system design

AI-assisted code generation

Beginner-friendly onboarding

Industry-level scalability
# SiliceAI Architect

A full-stack web application for designing AI chip architectures.
As a copilot, it takes high-level specifications and generates:
- Feasibility Analysis (Power, Area, Warnings based on Process Node)
- Architectural Block Diagram (Visualized interactively)
- RTL Skeleton (Verilog)
- Testbench Template (Verilog)

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, React Flow
- **Backend**: Python FastAPI

## Prerequisites
- Python 3.8+
- Node.js & npm

## Setup & Run

### Automated Start (Windows)
simply run the `start_app.bat` script in the root directory.
```powershell
.\start_app.bat
```

### Manual Start

**Backend:**
1. Navigate to `backend/`
2. Create virtual env: `python -m venv venv`
3. Activate: `venv\Scripts\activate`
4. Install deps: `pip install -r requirements.txt`
5. Run: `uvicorn main:app --reload`
   (Server runs at http://127.0.0.1:8000)

**Frontend:**
1. Navigate to `frontend/`
2. Install deps: `npm install`
3. Run: `npm run dev`
   (App runs at http://localhost:5173)

## Features
- **Specification Input**: Configure Purpose, Frequency, Power, Node, Memory, Standards.
- **Feasibility Engine**: Checks for unrealistic constraints (e.g., >1.5GHz at 100nm).
- **Architecture Generator**: Auto-generates blocks (NPU, CPU, SRAM) based on purpose.
- **RTL Generation**: Produces synthesis-ready Verilog skeletons.
- **Visualizer**: Interactive node-based diagram.
