from pydantic import BaseModel
from typing import List, Optional, Literal, Dict

class ChipSpecification(BaseModel):
    purpose: str
    
    # 1. Process & Technology
    process_node: str = "28nm" # 28nm, 16nm, 7nm, 5nm, 3nm
    foundry: Optional[str] = "TSMC" # TSMC, Samsung, Intel
    voltage_target: Optional[float] = 0.8
    temperature_range: Optional[str] = "Commercial" # Commercial, Automotive, Industrial

    # 2. Performance Targets
    frequency: float = 1.0 # In GHz
    power_budget: float = 5.0 # In Watts
    performance_goal: Optional[str] = "Edge AI" # Edge AI, Mobile AI, Data Center AI, Automotive AI, IoT AI
    compute_type: Optional[str] = "Inference Only" # Inference Only, Training, Mixed
    precision: Optional[str] = "INT8" # INT8, FP16, BF16, FP32, Mixed Precision

    # 3. Architecture Configuration
    num_npu_clusters: int = 1
    mac_units_per_cluster: int = 256
    sram_size: Optional[int] = 1 # MB
    axi_width: int = 128
    interconnect_type: Optional[str] = "AXI" # AXI, NoC Mesh, Ring, Crossbar
    
    # 4. Memory System
    memory_type: str = "DDR4" # DDR4, DDR5, LPDDR5, HBM2, HBM3
    ddr_width: int = 64
    memory_channels: Optional[int] = 1
    on_chip_ratio: Optional[str] = "Low" # Low, Medium, High

    # 5. IO & Standards
    standards: List[str] = [] # e.g., PCIe, USB, Ethernet, MIPI, HDMI, DisplayPort
    pcie_version: Optional[str] = "None" # None, Gen3, Gen4, Gen5

    # 6. Power Architecture
    power_strategy: Optional[str] = "Dynamic Voltage Scaling" # Always-On, DVS, Multi Power Domains, Aggressive Clock Gating
    cooling_solution: Optional[str] = "Passive Cooling" # Passive, Active, Automotive Grade

    # 7. Chip Strategy (Advanced)
    packaging_type: Optional[str] = "Monolithic" # Monolithic, Chiplet, 2.5D, 3D
    die_area_target: Optional[str] = "50-150 mm²" # <50, 50-150, 150-400
    cost_target: Optional[str] = "Mid-range" # Low-cost, Mid-range, Premium
    multi_die_partitioning: bool = False # AMD Chiplet / Infinity Fabric approach

    # Legacy/Internal
    clock_domains: Optional[dict] = {"core": 1.0, "mem": 0.8, "io": 0.5}
    competition_mode: Optional[bool] = False

class Node(BaseModel):
    id: str
    type: str # "custom" or default
    data: dict # label, purpose, logic_type (analog/digital)
    position: dict # x, y
    # New metadata for floorplanning
    area_weight: Optional[int] = 1
    power_weight: Optional[int] = 1
    bandwidth_weight: Optional[int] = 1
    latency_sensitive: Optional[bool] = False

class Edge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = False
    # New metadata
    bandwidth_weight: Optional[int] = 1

class ArchitectureGraph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

class Point(BaseModel):
    x: float
    y: float

class Region(BaseModel):
    name: str # "digital_core", "analog_boundary", etc.
    x: float
    y: float
    width: float
    height: float
    color: str

class Block(BaseModel):
    id: str
    label: str
    x: float
    y: float
    width: float
    height: float
    region: str
    logic_type: str
    power_density: float

class RoutedEdge(BaseModel):
    id: str
    path: List[Point] # List of X,Y points for Manhattan routing
    thickness: int
    color: str

class FloorplanResult(BaseModel):
    chip_width: float
    chip_height: float
    regions: List[Region]
    blocks: List[Block]
    routed_edges: List[RoutedEdge]
    power_density_grid: List[List[float]] = [] # Simple grid for heatmap
    congestion_score: str
    area_utilization: str
    # Enhanced Metrics
    estimated_tops: float = 0.0
    power_breakdown: Dict[str, float] = {} # e.g., {"compute": 10.5, "memory": 2.0}
    memory_bandwidth: str = "0 GB/s"
    latency_estimate: str = "N/A"
    efficiency_tops_per_watt: float = 0.0
    interconnect_bottlenecks: List[str] = [] # List of Edge IDs
    total_area_mm2: float = 0.0

class AnalysisResult(BaseModel):
    warnings: List[str]
    area_estimate: str
    power_estimate: str
    max_freq_estimate: str
