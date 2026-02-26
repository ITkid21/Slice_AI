from models import ChipSpecification, ArchitectureGraph, Node, Edge, AnalysisResult
from typing import Dict
from rtl_templates import NPU_CLUSTER_VERILOG, AXI_INTERCONNECT_VERILOG, DDR_CONTROLLER_VERILOG

def analyze_feasibility(spec: ChipSpecification) -> AnalysisResult:
    warnings = []
    
    # 1. Deterministic Physics Checks
    # Limits based on process node physics (approx)
    node_limits = {
        "130nm": {"max_freq": 0.5, "power_factor": 10.0},
        "65nm":  {"max_freq": 1.2, "power_factor": 5.0},
        "28nm":  {"max_freq": 2.0, "power_factor": 2.5},
        "7nm":   {"max_freq": 4.5, "power_factor": 1.0},
        "5nm":   {"max_freq": 5.5, "power_factor": 0.8},
    }
    
    node = spec.process_node
    # Safety fallback
    if node not in node_limits:
        node = "28nm"
        warnings.append(f"Unknown process node '{spec.process_node}', defaulting to 28nm physics.")

    limit = node_limits[node]
    
    # --- CALCULATIONS ---
    # 1. TOPS (Tera Operations Per Second)
    # TOPS = Freq (GHz) * MACs * Clusters * 2 (Ops/MAC) / 1000
    ops_per_cycle = spec.mac_units_per_cluster * spec.num_npu_clusters * 2
    tops = (spec.frequency * ops_per_cycle) / 1000.0
    
    # 2. Bandwidth (GB/s)
    # BW = (Rate * Width * Channels) / 8
    # Rates: DDR4 ~3.2Gbps, DDR5 ~6.4Gbps, HBM2 ~2Gbps, HBM3 ~6.4Gbps
    # Widths should be total bus width
    mem_rate_map = {
        "DDR4": 3.2, "DDR5": 6.4, "LPDDR5": 6.4, 
        "HBM2": 2.0, "HBM3": 6.4
    }
    rate = mem_rate_map.get(spec.memory_type, 3.2)
    # HBM has massive bus width (e.g. 1024)
    eff_width = spec.ddr_width
    if "HBM" in spec.memory_type:
        eff_width = 1024 # assumption for HBM stack
        
    bandwidth = (rate * eff_width * spec.memory_channels) / 8.0
    
    # 3. Power Estimation
    # Base + Dynamic + Leakage
    base_power = 0.5 
    dynamic_power = 0.1 * spec.frequency * limit["power_factor"] * (spec.num_npu_clusters * 0.5)
    
    # Voltage scaling effect (Square law)
    nominal_v = 0.8
    if spec.voltage_target:
        v_scale = (spec.voltage_target / nominal_v) ** 2
        dynamic_power *= v_scale
        
    est_power = base_power + dynamic_power
    
    # 4. Neural Efficiency
    eff_tops_w = 0.0
    if est_power > 0:
        eff_tops_w = tops / est_power

    # --- CHECKS ---
    
    # Check 1: Frequency
    if spec.frequency > limit["max_freq"]:
        warnings.append(f"Freq {spec.frequency}GHz exceeds {node} limits (Max: {limit['max_freq']}GHz).")
        
    # Check 2: Power
    if est_power > spec.power_budget:
        warnings.append(f"Est. Power ({est_power:.1f}W) exceeds budget ({spec.power_budget}W).")
        
    # Check 3: Bandwidth bottlenecks
    # Rule of thumb: Need ~0.5 GB/s per TOPS for efficient inference? (Roofline model approximation)
    required_bw = tops * 0.5 
    if bandwidth < required_bw:
         warnings.append(f"Memory Bottleneck: {bandwidth:.1f} GB/s is low for {tops:.1f} TOPS (Suggest >{required_bw:.1f} GB/s).")

    # Competition Mode Checks
    if spec.competition_mode:
        if spec.axi_width < 128:
            warnings.append("[Competition] AXI Width 64-bit is bottleneck for NPU. Suggest 128+.")
        if spec.num_npu_clusters < 2:
             warnings.append("[Competition] Single cluster NPU is low performance. Suggest 2+ for competition.")

    return AnalysisResult(
        warnings=warnings, 
        area_estimate=f"{(10 + spec.num_npu_clusters * 5 * limit.get('power_factor',1)):.1f} mm²", 
        power_estimate=f"{est_power:.2f} W",
        max_freq_estimate=f"{limit['max_freq']} GHz"
    )

def generate_architecture(spec: ChipSpecification) -> ArchitectureGraph:
    nodes = []
    edges = []
    
    # --- Layout Constants ---
    width = 800
    height = 600
    center_x = width / 2
    center_y = height / 2
    
    # --- 1. System Bus (Spine) ---
    bus_type = "AXI4 Interconnect"
    if spec.frequency < 0.5: bus_type = "AHB-Lite Bus"
    if spec.num_npu_clusters > 4: bus_type = "NoC (Mesh)"
    
    nodes.append(Node(id="bus", type="default", data={"label": bus_type, "logic_type": "Digital"}, position={"x": center_x, "y": center_y}))
    
    # --- 2. Compute Clusters (Top) ---
    # Smart placement based on count
    npu_count = spec.num_npu_clusters
    
    if npu_count <= 4:
        # Individual Nodes
        spacing = 200
        start_x = center_x - ((npu_count - 1) * spacing) / 2
        for i in range(npu_count):
            nid = f"npu_{i}"
            nodes.append(Node(id=nid, type="input", data={"label": f"NPU Cluster {i}", "logic_type": "Digital"}, position={"x": start_x + (i*spacing), "y": center_y - 150}))
            edges.append(Edge(id=f"e_{nid}", source=nid, target="bus", bandwidth_weight=10))
    else:
        # Array Representation
        cols = 4
        rows = (npu_count + cols - 1) // cols
        nodes.append(Node(id="npu_array", type="input", data={"label": f"Systolic Array ({rows}x{cols})", "logic_type": "Digital"}, position={"x": center_x, "y": center_y - 150}))
        edges.append(Edge(id="e_npu_array", source="npu_array", target="bus", bandwidth_weight=50))

    # Host CPU (Always present)
    nodes.append(Node(id="cpu", type="input", data={"label": "RISC-V Host", "logic_type": "Digital"}, position={"x": center_x - 300, "y": center_y - 50}))
    edges.append(Edge(id="e_cpu", source="cpu", target="bus"))

    # --- 3. Memory Subsystem (Right) ---
    mem_y = center_y
    if spec.memory_type != "SRAM":
        nodes.append(Node(id="ddr_ctrl", type="default", data={"label": f"{spec.memory_type} Controller", "logic_type": "Memory"}, position={"x": center_x + 250, "y": mem_y}))
        edges.append(Edge(id="e_mem", source="bus", target="ddr_ctrl", bandwidth_weight=20))
        
        # PHY
        nodes.append(Node(id="ddr_phy", type="output", data={"label": f"{spec.memory_type} PHY", "logic_type": "Analog"}, position={"x": center_x + 350, "y": mem_y + 80}))
        edges.append(Edge(id="e_phy", source="ddr_ctrl", target="ddr_phy"))

    # --- 4. Peripherals (Bottom) ---
    periph_spacing = 150
    start_x = center_x - ((len(spec.standards) - 1) * periph_spacing) / 2
    
    for i, std in enumerate(spec.standards):
        pid = f"io_{std.lower()}"
        l_type = "Analog" if "PHY" in std or "USB" in std else "Digital"
        nodes.append(Node(id=pid, type="output", data={"label": f"{std} Controller", "logic_type": l_type}, position={"x": start_x + (i*periph_spacing), "y": center_y + 150}))
        edges.append(Edge(id=f"e_{pid}", source="bus", target=pid))

    return ArchitectureGraph(nodes=nodes, edges=edges)

def generate_rtl(spec: ChipSpecification, graph: ArchitectureGraph) -> Dict[str, str]:
    files = {}
    
    # 1. Top Level Parameterization
    top = f"""
// Top Module for {spec.purpose}
// Params: {spec.process_node}, {spec.frequency}GHz
// Generated by SiliceAI Architect

module top_chip #(
    parameter NUM_CLUSTERS = {spec.num_npu_clusters},
    parameter AXI_WIDTH = {spec.axi_width},
    parameter DDR_WIDTH = {spec.ddr_width}
)(
    input wire clk,
    input wire rst_n,
    // External Interfaces
"""
    # IO Generation
    for std in spec.standards:
        top += f"    inout wire {std.lower()}_d,\n"
        
    top += """    output wire [3:0] status_led
);

    // Internal Signals
    wire [AXI_WIDTH-1:0] axi_m_data [0:NUM_CLUSTERS-1];
    wire [AXI_WIDTH-1:0] axi_s_data;

    // --- 1. NPU Clusters ---
    genvar i;
    generate
        for (i=0; i<NUM_CLUSTERS; i=i+1) begin : CLUSTERS
            npu_cluster #(
                .CLUSTER_ID(i), 
                .DATA_WIDTH(AXI_WIDTH)
            ) u_npu (
                .clk(clk),
                .rst_n(rst_n),
                .start_compute(1'b1), // Auto-start for demo
                .result_data(axi_m_data[i])
            );
        end
    endgenerate

    // --- 2. Interconnect ---
    axi_interconnect #(
        .NUM_MASTERS(NUM_CLUSTERS),
        .DATA_WIDTH(AXI_WIDTH)
    ) u_noc (
        .clk(clk),
        .rst_n(rst_n),
        .s_data_arrays(axi_m_data), // Verilog packing handled by tool or flattening required
        .m_data(axi_s_data)
    );

    // --- 3. Memory ---
    ddr_controller #(
        .BUS_WIDTH(DDR_WIDTH)
    ) u_ddr (
        .sys_clk(clk),
        .rst_n(rst_n),
        .axi_s_data(axi_s_data)
    );

endmodule
"""
    files["top_chip.v"] = top
    files["npu_cluster.v"] = NPU_CLUSTER_VERILOG
    files["axi_interconnect.v"] = AXI_INTERCONNECT_VERILOG
    files["ddr_controller.v"] = DDR_CONTROLLER_VERILOG
    
    return files

def generate_testbench(spec: ChipSpecification) -> str:
    return """
`timescale 1ns/1ps

module tb_top_chip;
    reg clk;
    reg rst_n;
    
    // DUT Instance
    top_chip u_dut (
        .clk(clk),
        .rst_n(rst_n)
    );
    
    // Clock Gen
    always #5 clk = ~clk; // 100MHz
    
    initial begin
        $dumpfile("waveform.vcd");
        $dumpvars(0, tb_top_chip);
        
        clk = 0;
        rst_n = 0;
        #20 rst_n = 1;
        
        #1000;
        $finish;
    end

endmodule
"""
