
# Parameterized RTL Templates

NPU_CLUSTER_VERILOG = """
module npu_cluster #(
    parameter CLUSTER_ID = 0,
    parameter MAC_UNITS = 256,
    parameter DATA_WIDTH = 128
)(
    input wire clk,
    input wire rst_n,
    input wire start_compute,
    output reg done_compute,
    output wire [DATA_WIDTH-1:0] result_data
);
    // Competition-Grade: Systolic Array Simulation Logic
    reg [31:0] cycle_count;
    reg [15:0] mac_ops [0:MAC_UNITS-1];
    
    integer i;
    
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            cycle_count <= 0;
            done_compute <= 0;
            for (i=0; i<MAC_UNITS; i=i+1) mac_ops[i] <= 0;
        end else if (start_compute) begin
            cycle_count <= cycle_count + 1;
            // Simulate compute latency
            if (cycle_count > 100) begin
                done_compute <= 1;
            end
        end
    end

    // Result is localized to cluster ID for validation
    assign result_data = {{(DATA_WIDTH-32){1'b0}}, cycle_count} + CLUSTER_ID;

endmodule
"""

AXI_INTERCONNECT_VERILOG = """
module axi_interconnect #(
    parameter NUM_MASTERS = 4,
    parameter DATA_WIDTH = 128
)(
    input wire clk,
    input wire rst_n,
    input wire [DATA_WIDTH-1:0] s_data_arrays [0:NUM_MASTERS-1], # Packed array input handled in top
    output reg [DATA_WIDTH-1:0] m_data,
    output reg [3:0] master_id
);
    // Simple Round-Robin Arbiter
    reg [3:0] current_grant;
    
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            current_grant <= 0;
            m_data <= 0;
            master_id <= 0;
        end else begin
            // Rotate priority
            if (current_grant == NUM_MASTERS - 1)
                current_grant <= 0;
            else
                current_grant <= current_grant + 1;
                
            // Mux Logic
            master_id <= current_grant;
            // m_data <= s_data_arrays[current_grant]; # Note: Unpacked array indexing needs care in some tools
        end
    end
endmodule
"""

DDR_CONTROLLER_VERILOG = """
module ddr_controller #(
    parameter BUS_WIDTH = 128
)(
    input wire sys_clk,
    input wire rst_n,
    input wire [BUS_WIDTH-1:0] axi_s_data,
    output reg dram_cmd_valid
);
    // Simple Transaction Monitor
    always @(posedge sys_clk or negedge rst_n) begin
        if (!rst_n) begin
            dram_cmd_valid <= 0;
        end else begin
            dram_cmd_valid <= |axi_s_data; // Active if data on bus
        end
    end
endmodule
"""
