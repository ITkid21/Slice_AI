/**
 * LayoutCalculator.js
 * 
 * Handles all geometric calculations for the EDA floorplan engine.
 * Computes:
 * - Grid placement for NPU clusters
 * - Die dimensions based on specs
 * - Component positions (Memory, PCIe, AXI)
 */

export const calculateLayout = (spec) => {
    const {
        num_npu_clusters = 1,
        axi_width = 64,
        ddr_width = 128,
        pcie_gen = 'Gen4',
        process_node = '28nm'
    } = spec;

    // --- Constants & Scaling Factors ---
    // Base unit size in micrometers (um)
    const CLUSTER_BASE_SIZE = 400;
    const IO_RING_THICKNESS = 100;
    const SPACING = 40;

    // Scale factors based on specs
    // More bits = wider bus area
    const AXI_SCALE = axi_width / 64;
    const DDR_SCALE = ddr_width / 128;

    // --- 1. NPU Cluster Grid Layout ---
    // Compute grid dimensions (Square-ish aspect ratio)
    const cols = Math.ceil(Math.sqrt(num_npu_clusters));
    const rows = Math.ceil(num_npu_clusters / cols);

    const clusters = [];
    const clusterWidth = CLUSTER_BASE_SIZE;
    const clusterHeight = CLUSTER_BASE_SIZE;

    let currentX = IO_RING_THICKNESS + SPACING;
    let currentY = IO_RING_THICKNESS + SPACING;

    // Generate Cluster Blocks
    for (let i = 0; i < num_npu_clusters; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        clusters.push({
            id: `npu_${i}`,
            label: `NPU Cluster ${i}`,
            type: 'Compute',
            x: (IO_RING_THICKNESS + SPACING) + (col * (clusterWidth + SPACING)),
            y: (IO_RING_THICKNESS + SPACING) + (row * (clusterHeight + SPACING)),
            width: clusterWidth,
            height: clusterHeight,
            stats: {
                tops: 100, // Placeholder, dynamic later
                power: 2.5
            }
        });
    }

    // --- 2. Calculate Core Dimensions ---
    const coreWidth = (cols * clusterWidth) + ((cols - 1) * SPACING) + (SPACING * 2);
    const coreHeight = (rows * clusterHeight) + ((rows - 1) * SPACING) + (SPACING * 2);

    // --- 3. Peripheral Blocks (Memory, PCIe, Grid Logic) ---
    const peripherals = [];

    // Memory Controllers (Top/Bottom)
    const memCount = Math.max(2, Math.ceil(DDR_SCALE * 2)); // 2 to 8 controllers
    const memWidth = (coreWidth / memCount) - 20;

    for (let i = 0; i < memCount; i++) {
        // Top
        peripherals.push({
            id: `ddr_top_${i}`,
            label: `DDR Ctrl ${i}`,
            type: 'Memory',
            x: (IO_RING_THICKNESS + SPACING) + (i * (memWidth + 20)),
            y: 10,
            width: memWidth,
            height: 60,
            stats: { bandwidth: '25.6 GB/s' }
        });
        // Bottom
        peripherals.push({
            id: `ddr_bot_${i}`,
            label: `DDR Ctrl ${i + memCount}`,
            type: 'Memory',
            x: (IO_RING_THICKNESS + SPACING) + (i * (memWidth + 20)),
            y: coreHeight + IO_RING_THICKNESS + SPACING + 20, // Below core
            width: memWidth,
            height: 60,
            stats: { bandwidth: '25.6 GB/s' }
        });
    }

    // PCIe / IO (Left/Right)
    const pcieHeight = 300;
    peripherals.push({
        id: 'pcie_phy',
        label: `PCIe ${pcie_gen} PHY`,
        type: 'IO',
        x: 10, // Left edge
        y: (coreHeight / 2) + IO_RING_THICKNESS - (pcieHeight / 2),
        width: 60,
        height: pcieHeight,
        stats: { lanes: 16 }
    });

    // --- 4. Total Die Size ---
    const dieWidth = coreWidth + (IO_RING_THICKNESS * 2) + (SPACING * 2);
    const dieHeight = coreHeight + (IO_RING_THICKNESS * 2) + (SPACING * 2);

    // --- 5. Routing Lines (Virtual) ---
    const routes = [];
    // Connect each NPU to nearest Memory (Simple Manhattan)
    clusters.forEach((cluster, i) => {
        // Find nearest memory
        // For MVP, just connect to top/bottom randomly to look dense
        const targetY = i % 2 === 0 ? 60 : dieHeight - 60; // Top or Bottom
        routes.push({
            id: `route_${i}`,
            from: { x: cluster.x + clusterWidth / 2, y: cluster.y + clusterHeight / 2 },
            to: { x: cluster.x + clusterWidth / 2, y: targetY },
            width: AXI_SCALE * 2,
            color: '#06b6d4' // Cyan
        });
    });

    return {
        width: dieWidth,
        height: dieHeight,
        blocks: [...clusters, ...peripherals],
        routes,
        stats: {
            area: (dieWidth * dieHeight) / 1000000, // mm2
            utilization: 0.85,
            power: spec.multi_die_partitioning ? 0.62 : 1.2,
            congestion: spec.multi_die_partitioning ? 'Low' : 'High'
        }
    };
};
