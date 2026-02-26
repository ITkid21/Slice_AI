from models import ArchitectureGraph, FloorplanResult, Block, Region, RoutedEdge, Point
import random
import math

# Constants
# Constants
GRID_SIZE = 10 # 10x10 basic grid unit
MARGIN = 20

def generate_floorplan(graph: ArchitectureGraph) -> FloorplanResult:
    # 1. Metadata Enrichment & Sizing
    enriched_blocks = enrich_metadata(graph.nodes)
    
    # 2. Placement Strategy (Improved from simple cursor)
    placed_blocks = []
    
    # Segregate blocks
    core_blocks = [b for b in enriched_blocks if b['type'] not in ['io', 'analog']]
    edge_blocks = [b for b in enriched_blocks if b['type'] in ['io', 'analog']]
    
    # Place Core Blocks (Center-out or Grid fill)
    # Sort by size (descending) for better packing
    core_blocks.sort(key=lambda x: x['area_weight'], reverse=True)
    
    # Dynamic Grid Allocator
    # Start at 0,0 relative to core region
    cursor_x = 0
    cursor_y = 0
    row_height = 0
    max_row_width = 800 # Target max width before wrapping
    
    current_row_width = 0
    total_core_width = 0
    total_core_height = 0
    
    # First pass: Place relative to (0,0) to determine size
    temp_placements = []
    
    for block in core_blocks:
        # Scale factor - Make them CHUNKY for better visuals
        scale = 40 
        b_w = block['area_weight'] * scale
        b_h = block['area_weight'] * (scale * 0.8) # Slightly rectangular
        
        # Hardcode some aspect ratios for known types
        if "High-Bandwidth" in block['label']: # HBM like
             b_w = 40
             b_h = 120
        elif "DDR" in block['label']:
             b_w = 120
             b_h = 40
        
        # Check if fits in row
        if current_row_width + b_w > max_row_width:
            cursor_x = 0
            cursor_y += row_height + 20 # Gap
            row_height = 0
            current_row_width = 0
            
        temp_placements.append({
            "block": block,
            "x": cursor_x,
            "y": cursor_y,
            "w": b_w,
            "h": b_h
        })
        
        row_height = max(row_height, b_h)
        current_row_width += b_w + 20
        cursor_x += b_w + 20
        
        total_core_width = max(total_core_width, cursor_x)
        total_core_height = max(total_core_height, cursor_y + row_height)

    # Calculate actual Core Region size
    core_w = total_core_width if total_core_width > 0 else 400
    core_h = total_core_height if total_core_height > 0 else 400
    
    # Add Padding for IO Ring
    ring_thickness = 60
    chip_width = int(core_w + (2 * ring_thickness) + 40)
    chip_height = int(core_h + (2 * ring_thickness) + 40)
    
    # Core Region Definition
    core_region = Region(
        name="Digital Core",
        x=ring_thickness + 20, 
        y=ring_thickness + 20,
        width=core_w,
        height=core_h,
        color="#0f172a" # Slate 900
    )
    
    # Finalize Core Block Positions
    for p in temp_placements:
        placed_blocks.append(Block(
            id=p['block']['id'],
            label=p['block']['label'],
            x=p['x'] + core_region.x,
            y=p['y'] + core_region.y,
            width=p['w'],
            height=p['h'],
            region="core",
            logic_type=p['block']['logic_type'],
            power_density=float(p['block']['power_weight'])
        ))

    # Place Edge Blocks (Snap to boundary)
    if edge_blocks:
        perimeter = (chip_width + chip_height) * 2
        step = perimeter / len(edge_blocks)
        current_step = 0
        
        for block in edge_blocks:
            b_w = 50
            b_h = 30
            
            # Simple logic: Top -> Right -> Bottom -> Left
            pos = current_step
            
            if pos < chip_width: # Top Edge
                x = pos
                y = 10 
            elif pos < chip_width + chip_height: # Right Edge
                x = chip_width - b_w - 10
                y = pos - chip_width
            elif pos < (chip_width * 2) + chip_height: # Bottom Edge
                x = (chip_width * 2 + chip_height) - pos
                y = chip_height - b_h - 10
            else: # Left Edge
                x = 10
                y = (chip_width * 2 + chip_height * 2) - pos
                
            # Clamp
            x = max(0, min(x, chip_width - b_w))
            y = max(0, min(y, chip_height - b_h))
            
            placed_blocks.append(Block(
                id=block['id'],
                label=block['label'],
                x=x,
                y=y,
                width=b_w,
                height=b_h,
                region="io",
                logic_type=block['logic_type'],
                power_density=float(block['power_weight'])
            ))
            current_step += step

    # 4. Routing Engine (Manhattan L-Shape)
    routed_edges = []
    block_map = {b.id: b for b in placed_blocks}
    
    for edge in graph.edges:
        if edge.source not in block_map or edge.target not in block_map:
            continue
            
        src = block_map[edge.source]
        dst = block_map[edge.target]
        
        # weight logic
        weight = 2
        if "bus" in edge.target or "bus" in edge.source:
             weight = 4 
        
        start_p = Point(x=src.x + src.width/2, y=src.y + src.height/2)
        end_p = Point(x=dst.x + dst.width/2, y=dst.y + dst.height/2)
        
        # Manhattan Path: Start -> Mid-X -> End-Y -> End
        mid_x = start_p.x
        mid_y = end_p.y
        
        path = [
            start_p,
            Point(x=mid_x, y=start_p.y), # Out horizontal
            Point(x=mid_x, y=mid_y),     # Vertical
            end_p                        # In horizontal
        ]
        
        routed_edges.append(RoutedEdge(
            id=edge.id,
            path=path,
            thickness=weight,
            color="#3b82f6" if weight > 2 else "#64748b"
        ))

    # 5. Analysis & Metrics
    # Heatmap Grid (Simple 10x10 grid approximation)
    heatmap = [[0.0 for _ in range(10)] for _ in range(10)]
    for b in placed_blocks:
        # Map block center to grid cell
        gx = int((b.x + b.width/2) / chip_width * 10)
        gy = int((b.y + b.height/2) / chip_height * 10)
        if 0 <= gx < 10 and 0 <= gy < 10:
            heatmap[gy][gx] += b.power_density

    # --- Metrics Calculation ---
    total_tops = 0.0
    power_breakdown = {"Compute": 0.0, "Memory": 0.0, "IO": 0.0, "Interconnect": 0.0}
    
    # Analyze blocks for capabilities
    for block in enriched_blocks:
        if "tops" in block:
            total_tops += block['tops']
            
        p_type = block['type'].capitalize()
        # Initial approximate power distribution
        if "Compute" in p_type: 
             power_breakdown["Compute"] += block['power_weight'] * 1.5
        elif "Memory" in p_type:
             power_breakdown["Memory"] += block['power_weight'] * 0.8
        elif "Io" in p_type:
             power_breakdown["IO"] += block['power_weight'] * 0.5
        else:
             power_breakdown["Interconnect"] += block['power_weight'] * 0.2
             
    # Normalize Power to realistic values (e.g. 5-20W range)
    total_weight = sum(power_breakdown.values())
    if total_weight > 0:
        scale_target = 15.0 # assume 15W typical
        for k in power_breakdown:
            power_breakdown[k] = (power_breakdown[k] / total_weight) * scale_target
            
    # Calculate Latency (Batch 1 Inference)
    # Latency ~ Depth / Freq + Memory Access
    # Heuristic: 0.5ms base + 0.1ms per 10 TOPS processed
    latency_ms = 0.5 + (100 / (total_tops + 1)) * 0.1
    
    # Calculate Efficiency
    total_power = sum(power_breakdown.values())
    efficiency = total_tops / total_power if total_power > 0 else 0.0

    # Memory Bandwidth Heuristic
    mem_ctrls = [b for b in enriched_blocks if "Memory" in b.get('logic_type', '') or "memory" in b.get('type','')]
    bandwidth_gbps = 0.0
    for block in mem_ctrls:
        lbl = block['label'].upper()
        if "HBM3" in lbl: bandwidth_gbps += 819.0
        elif "HBM2" in lbl: bandwidth_gbps += 460.0 # 256GB/s per stack roughly
        elif "LPDDR5" in lbl: bandwidth_gbps += 51.2
        elif "DDR5" in lbl: bandwidth_gbps += 32.0
        elif "DDR4" in lbl: bandwidth_gbps += 25.6
        
    # Bottleneck Detection
    bottlenecks = []
    # If bandwidth per TOPS is low (< 0.5 GB/s/TOPS) -> Memory Bound
    if total_tops > 0 and bandwidth_gbps / total_tops < 0.5:
        bottlenecks.append("Global Memory Bottleneck")
        
    return FloorplanResult(
        chip_width=chip_width,
        chip_height=chip_height,
        regions=[core_region],
        blocks=placed_blocks,
        routed_edges=routed_edges,
        power_density_grid=heatmap,
        congestion_score="Medium" if len(routed_edges) > len(placed_blocks)*1.2 else "Low",
        area_utilization=f"{min(95, int(len(placed_blocks) * 100 / 15))}%", 
        estimated_tops=float(f"{total_tops:.1f}"),
        power_breakdown={k: round(v, 1) for k, v in power_breakdown.items()},
        memory_bandwidth=f"{bandwidth_gbps:.1f} GB/s",
        latency_estimate=f"{latency_ms:.2f} ms",
        efficiency_tops_per_watt=round(efficiency, 2),
        interconnect_bottlenecks=bottlenecks,
        total_area_mm2=float(f"{(chip_width * chip_height) / 10000:.2f}") 
    )

def enrich_metadata(nodes):
    enriched = []
    for node in nodes:
        meta = {
            "id": node.id,
            "label": node.data['label'],
            "logic_type": node.data['logic_type'],
            "type": "compute", # default
            "area_weight": 4,
            "power_weight": 4,
            "tops": 0.0
        }
        
        # Heuristic rules
        label = meta['label'].lower()
        if "gpu" in label:
            meta['type'] = "compute"
            meta['area_weight'] = 8
            meta['power_weight'] = 9
            meta['tops'] = 15.0 # TFLOPS/TOPS
        elif "npu" in label:
            meta['type'] = "compute"
            # Check for Array
            if "array" in label or "clusters" in label:
                 # Try to extract count or just assume huge
                 count = 1
                 if "(" in label:
                     try:
                         part = label.split("(")[1] # "16x Clusters)"
                         count = int(part.split("x")[0])
                     except:
                         count = 8
                 meta['area_weight'] = 4 * count # Scale area
                 meta['power_weight'] = 3 * count
                 meta['tops'] = 100.0 * count
            else:
                meta['area_weight'] = 7
                meta['power_weight'] = 8
                meta['tops'] = 100.0 # High AI perf
        elif "cpu" in label:
            meta['type'] = "compute"
            meta['area_weight'] = 5
            meta['power_weight'] = 5
            meta['tops'] = 0.5 # General purpose
        elif "bus" in label or "noc" in label:
            meta['type'] = "interconnect"
            meta['area_weight'] = 6
            meta['power_weight'] = 3
        elif "memory" in label or "sram" in label or "ddr" in label:
            meta['type'] = "memory"
            meta['area_weight'] = 5
            meta['power_weight'] = 4
        elif "phy" in label or "io" in node.id:
            meta['type'] = "io"
            meta['area_weight'] = 3
            meta['power_weight'] = 2
            
        enriched.append(meta)
    return enriched
