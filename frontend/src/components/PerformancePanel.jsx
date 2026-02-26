import React from 'react';

const PerformancePanel = ({ floorplan }) => {
    if (!floorplan) return null;

    const { estimated_tops, power_breakdown, memory_bandwidth, total_area_mm2, interconnect_bottlenecks } = floorplan;

    // Helper for power bars
    const maxPower = Math.max(...Object.values(power_breakdown), 1);

    return (
        <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 backdrop-blur-md p-4 rounded-lg shadow-2xl w-64 z-20 text-sm animate-fade-in-down">
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400 mb-3">
                Performance Metrics
            </h3>

            {/* AI Performance */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-gray-400">Est. AI Perf</span>
                    <span className="text-xl font-mono font-bold text-white">{estimated_tops} <span className="text-xs text-gray-500">TOPS</span></span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000"
                        style={{ width: `${Math.min(estimated_tops, 200) / 2}%` }}
                    />
                </div>
            </div>

            {/* Memory Bandwidth */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-gray-400">Mem Bandwidth</span>
                    <span className="text-white font-mono">{memory_bandwidth}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 h-full transition-all duration-1000"
                        style={{ width: '60%' }} // Dummy visual fill, bandwidth varies widely
                    />
                </div>
            </div>

            {/* Power Breakdown */}
            <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Power Breakdown</h4>
                <div className="space-y-2">
                    {Object.entries(power_breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center text-xs">
                            <span className="w-20 text-gray-400 truncate">{key}</span>
                            <div className="flex-1 bg-gray-800 h-1.5 rounded-full mx-2">
                                <div
                                    className="bg-orange-500 h-full rounded-full"
                                    style={{ width: `${(val / maxPower) * 100}%` }}
                                />
                            </div>
                            <span className="text-gray-300 w-8 text-right">{val.toFixed(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Area */}
            <div className="flex justify-between border-t border-gray-700 pt-3">
                <span className="text-gray-400">Die Area</span>
                <span className="text-white font-mono">{total_area_mm2.toFixed(1)} mm²</span>
            </div>

            {/* Bottleneck Warning */}
            {interconnect_bottlenecks && interconnect_bottlenecks.length > 0 && (
                <div className="mt-3 p-2 bg-red-900/30 border border-red-800 rounded flex items-center space-x-2 text-red-200 text-xs animate-pulse">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Interconnect Bottleneck Detected</span>
                </div>
            )}
        </div>
    );
};

export default PerformancePanel;
