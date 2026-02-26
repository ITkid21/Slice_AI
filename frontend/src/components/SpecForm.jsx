import React, { useState, useEffect } from 'react';

const SpecForm = ({ onSubmit, isLoading, initialSpec }) => {
    const [formData, setFormData] = useState({
        purpose: 'AI Accelerator',
        // 1. Process
        process_node: '28nm',
        foundry: 'TSMC',
        voltage_target: 0.8,
        temperature_range: 'Commercial',
        // 2. Performance
        frequency: 1.0,
        power_budget: 5.0,
        performance_goal: 'Edge AI',
        compute_type: 'Inference Only',
        precision: 'INT8',
        // 3. Architecture
        num_npu_clusters: 1,
        mac_units_per_cluster: 256,
        sram_size: 1,
        axi_width: 128,
        interconnect_type: 'AXI',
        // 4. Memory
        memory_type: 'DDR4',
        ddr_width: 64,
        memory_channels: 1,
        on_chip_ratio: 'Low',
        // 5. IO
        standards: [],
        pcie_version: 'None',
        // 6. Power
        power_strategy: 'Dynamic Voltage Scaling',
        cooling_solution: 'Passive Cooling',
        // 7. Chip
        packaging_type: 'Monolithic',
        die_area_target: '50-150 mm²',
        cost_target: 'Mid-range',
        competition_mode: false,
        multi_die_partitioning: false
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [aiInput, setAiInput] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Update form when parent passes new spec
    useEffect(() => {
        if (initialSpec) {
            setFormData(prev => ({ ...prev, ...initialSpec }));
        }
    }, [initialSpec]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) : value });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let standards = [...formData.standards];
        if (checked) {
            standards.push(value);
        } else {
            standards = standards.filter(std => std !== value);
        }
        setFormData({ ...formData, standards });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleAiParse = async () => {
        if (!aiInput.trim()) return;
        setIsAiLoading(true);
        try {
            const res = await fetch('http://localhost:8000/ai/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiInput })
            });
            if (res.ok) {
                const data = await res.json();
                if (data && !data.error) {
                    setFormData(prev => ({ ...prev, ...data }));
                }
            }
        } catch (err) {
            console.error("AI Parse Error:", err);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-900 text-gray-200 rounded-lg shadow-xl space-y-6 border border-gray-700 h-full overflow-y-auto">
            {/* Header & AI Input */}
            <div>
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Silicon Architect</h2>

                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 mb-4">
                    <label className="block text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wide">AI Copilot Mode</label>
                    <div className="flex gap-2">
                        <textarea
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="Describe your chip (e.g., '5nm automotive AI chip with 100 TOPS and PCIe Gen5')..."
                            className="w-full bg-gray-900 text-sm p-2 rounded border border-gray-600 focus:border-purple-500 outline-none resize-none h-16"
                        />
                        <button
                            type="button"
                            onClick={handleAiParse}
                            disabled={isAiLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded font-bold text-xs"
                        >
                            {isAiLoading ? '...' : 'AUTO FILL'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 1. Process & Technology */}
            <section>
                <h3 className="text-sm font-bold text-blue-400 mb-2 border-b border-blue-900 pb-1">1. Process & Technology</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Node</label>
                        <select name="process_node" value={formData.process_node} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option>28nm</option><option>16nm</option><option>7nm</option><option>5nm</option><option>3nm</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Foundry</label>
                        <select name="foundry" value={formData.foundry} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option>TSMC</option><option>Samsung</option><option>Intel</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 2. Performance Targets */}
            <section>
                <h3 className="text-sm font-bold text-green-400 mb-2 border-b border-green-900 pb-1">2. Performance Targets</h3>
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Freq (GHz)</label>
                        <input type="number" step="0.1" name="frequency" value={formData.frequency} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Power (W)</label>
                        <input type="number" step="0.5" name="power_budget" value={formData.power_budget} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm" />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Goal</label>
                    <select name="performance_goal" value={formData.performance_goal} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                        <option>Edge AI</option><option>Mobile AI</option><option>Data Center AI</option><option>Automotive AI</option><option>IoT AI</option>
                    </select>
                </div>
            </section>

            {/* 3. Architecture Config */}
            <section>
                <h3 className="text-sm font-bold text-yellow-400 mb-2 border-b border-yellow-900 pb-1">3. Architecture</h3>
                <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Clusters</label>
                        <input type="number" min="1" max="32" name="num_npu_clusters" value={formData.num_npu_clusters} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">MACs/Cluster</label>
                        <select name="mac_units_per_cluster" value={formData.mac_units_per_cluster} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option value="64">64</option><option value="128">128</option><option value="256">256</option><option value="512">512</option><option value="1024">1024</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 4. Memory System */}
            <section>
                <h3 className="text-sm font-bold text-red-400 mb-2 border-b border-red-900 pb-1">4. Memory</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Type</label>
                        <select name="memory_type" value={formData.memory_type} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option>DDR4</option><option>DDR5</option><option>LPDDR5</option><option>HBM2</option><option>HBM3</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Width (bits)</label>
                        <select name="ddr_width" value={formData.ddr_width} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option value="32">32</option><option value="64">64</option><option value="128">128</option><option value="256">256</option><option value="512">512</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Advanced Toggle */}
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-xs text-gray-500 hover:text-white border-t border-gray-800 pt-2 flex items-center justify-center gap-2"
            >
                {showAdvanced ? '▲ Hide Advanced' : '▼ Show Advanced (IO, Power, Strategy)'}
            </button>

            {showAdvanced && (
                <div className="space-y-6 pt-2 animate-fade-in">
                    {/* 5. IO */}
                    <section>
                        <div className="mb-2">
                            <label className="text-xs text-gray-400 block mb-1">PCIe Version</label>
                            <select name="pcie_version" value={formData.pcie_version} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                                <option>None</option><option>Gen3</option><option>Gen4</option><option>Gen5</option>
                            </select>
                        </div>
                        <label className="text-xs text-gray-400 block mb-1">Standards</label>
                        <div className="flex flex-wrap gap-2">
                            {['USB 3.0', 'Ethernet', 'MIPI CSI', 'HDMI', 'DP'].map(std => (
                                <label key={std} className="flex items-center space-x-1 bg-gray-800 px-2 py-1 rounded text-xs cursor-pointer border border-gray-700 hover:border-gray-500">
                                    <input type="checkbox" value={std} checked={formData.standards.includes(std)} onChange={handleCheckboxChange} className="accent-blue-500" />
                                    <span>{std}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* 6. Power */}
                    <section>
                        <h3 className="text-sm font-bold text-orange-400 mb-2">Power Strategy</h3>
                        <select name="power_strategy" value={formData.power_strategy} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm mb-2">
                            <option>Always-On</option><option>Dynamic Voltage Scaling</option><option>Multi Power Domains</option><option>Aggressive Clock Gating</option>
                        </select>
                        <select name="cooling_solution" value={formData.cooling_solution} onChange={handleChange} className="w-full bg-gray-800 border border-gray-600 rounded p-1 text-sm">
                            <option>Passive Cooling</option><option>Active Cooling</option><option>Automotive Grade</option>
                        </select>
                    </section>

                    {/* 7. Chip Strategy */}
                    <section>
                        <h3 className="text-sm font-bold text-pink-400 mb-2">Chip Strategy</h3>
                        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-blue-300 group-hover:text-blue-200 transition-colors">Multi-Die Partitioning</span>
                                    <span className="text-[10px] text-gray-500">AMD Chiplet & Infinity Fabric Mode</span>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="multi_die_partitioning"
                                        checked={formData.multi_die_partitioning}
                                        onChange={(e) => setFormData({ ...formData, multi_die_partitioning: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded text-white font-bold shadow-lg transition duration-200 disabled:opacity-50 mt-4"
            >
                {isLoading ? 'Architecting...' : 'GENERATE ARCHITECTURE'}
            </button>
        </form>
    );
};

export default SpecForm;
