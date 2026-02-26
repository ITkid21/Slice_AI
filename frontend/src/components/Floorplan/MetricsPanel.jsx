import React from 'react';
import { Cpu, Zap, Activity, Grid, ArrowRight } from 'lucide-react';

const MetricsPanel = ({ stats, previousStats, spec }) => {
    if (!stats) return null;

    // Derived Metrics
    // Tops = logic_units * freq
    const totalTops = (spec.num_npu_clusters || 1) * (spec.frequency || 1.0) * 128;

    return (
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col space-y-6 h-full overflow-y-auto font-sans">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                <Activity size={20} className="text-blue-500" />
                <span>Simulation Metrics</span>
            </h3>

            {/* Before vs After Comparison */}
            {previousStats && (
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">AI Optimization Impact</div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Power Draw</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500 line-through">{previousStats.power}W</span>
                            <ArrowRight size={10} className="text-blue-500" />
                            <span className="text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded">{stats.power}W</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Congestion</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{previousStats.congestion}</span>
                            <ArrowRight size={10} className="text-blue-500" />
                            <span className="text-blue-300 font-bold uppercase">{stats.congestion}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center p-1 bg-green-500/20 rounded border border-green-500/30 text-[10px] text-green-300 font-bold">
                        <Zap size={10} className="mr-1" />
                        {((1 - stats.power / previousStats.power) * 100).toFixed(0)}% POWER SAVINGS
                    </div>
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase">Est. Power</div>
                    <div className={`text-2xl font-mono font-bold ${spec.multi_die_partitioning ? 'text-green-400 animate-pulse' : 'text-orange-400'}`}>
                        {stats.power} W
                    </div>
                </div>
                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs uppercase">Die Area</div>
                    <div className="text-2xl font-mono text-blue-400 font-bold">
                        {(stats.area).toFixed(1)} mm²
                    </div>
                </div>
            </div>

            {/* Utilization Bar */}
            <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Utilization</span>
                    <span>{(stats.utilization * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${stats.utilization * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Congestion Bar */}
            <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>Routing Congestion</span>
                    <span className={`${stats.congestion === 'High' ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
                        {stats.congestion}
                    </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                    <div
                        className={`${stats.congestion === 'High' ? 'bg-red-500' : 'bg-emerald-500'} h-2.5 rounded-full transition-all duration-500`}
                        style={{ width: stats.congestion === 'High' ? '85%' : '15%' }}
                    ></div>
                </div>
            </div>

            {/* Detailed Spec List */}
            <div className="border-t border-gray-800 pt-4 space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                    <span>Process Node</span>
                    <span className="text-white">{spec.process_node}</span>
                </div>
                <div className="flex justify-between">
                    <span>Compute</span>
                    <span className="text-white">{totalTops.toFixed(1)} TOPS</span>
                </div>
                <div className="flex justify-between">
                    <span>Memory BW</span>
                    <span className="text-white">{spec.memory_type === 'DDR5' ? '512 GB/s' : '256 GB/s'}</span>
                </div>
            </div>

            <div className="mt-auto bg-blue-900/20 p-4 rounded border border-blue-500/30 text-xs text-blue-200">
                <div className="flex items-center space-x-2 mb-2 font-bold">
                    <Zap size={14} />
                    <span>AI Optimization Tip</span>
                </div>
                Increasing cluster count beyond 8 requires shifting to NoC (Network on Chip) to maintain bandwidth efficiency.
            </div>
        </div>
    );
};

export default MetricsPanel;
