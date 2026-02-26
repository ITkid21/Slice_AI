import React, { useState } from 'react';

const FloorplanView = ({ floorplan, showHeatmap, showCongestion, showRoutes }) => {
    if (!floorplan) return <div className="p-4 text-gray-400">No floorplan generated yet.</div>;

    const { chip_width, chip_height, regions, blocks, routed_edges, power_density_grid, area_utilization } = floorplan;

    // Scaling factor to fit screen
    // Add padding to calculation
    const containerW = 800;
    const containerH = 600;
    const scale = Math.min((containerW - 40) / chip_width, (containerH - 40) / chip_height);

    const getBlockStyle = (type, logic_type) => {
        let baseClass = "border shadow-lg backdrop-blur-sm transition-all duration-300";
        if (logic_type === 'Digital') return `${baseClass} bg-gradient-to-br from-blue-900/80 to-blue-600/40 border-blue-400 text-blue-100 shadow-blue-500/20`;
        if (logic_type === 'Analog' || logic_type === 'Analog/Mixed') return `${baseClass} bg-gradient-to-br from-orange-900/80 to-orange-600/40 border-orange-400 text-orange-100 shadow-orange-500/20`;
        if (logic_type === 'Memory') return `${baseClass} bg-gradient-to-br from-purple-900/80 to-purple-600/40 border-purple-400 text-purple-100 shadow-purple-500/20`;
        return `${baseClass} bg-gradient-to-br from-gray-800 to-gray-600 border-gray-400 text-gray-200`;
    };

    return (
        <div className="relative bg-gray-950 border border-gray-800 rounded-lg overflow-hidden flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black h-full">

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 bg-black/60 p-3 rounded border border-gray-700 backdrop-blur z-20 text-xs text-gray-300 shadow-xl">
                <div className="flex justify-between w-40 mb-1"><span>Utilization:</span> <span className="text-cyan-400 font-mono">{area_utilization}</span></div>
                <div className="flex justify-between w-40 mb-1"><span>Congestion:</span> <span className="text-emerald-400 font-mono">Low</span></div>
                <div className="flex justify-between w-40"><span>Die Size:</span> <span className="text-purple-300 font-mono">{chip_width}x{chip_height} um</span></div>
            </div>

            <div
                style={{
                    width: chip_width * scale,
                    height: chip_height * scale,
                    position: 'relative'
                }}
                className="relative shadow-2xl transition-all duration-500"
            >
                {/* 1. Regions (Substrate) */}
                {regions.map((region, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: region.x * scale,
                            top: region.y * scale,
                            width: region.width * scale,
                            height: region.height * scale,
                            backgroundColor: region.color,
                        }}
                        className="rounded-sm border border-gray-800/50 shadow-inner"
                    >
                        {/* Technical Grid Pattern */}
                        <div className="w-full h-full opacity-20"
                            style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </div>
                ))}

                {/* 2. Routes (SVG Layer) */}
                {showRoutes && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                        <defs>
                            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="glow-red">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {routed_edges.map(edge => {
                            const isBottleneck = floorplan.interconnect_bottlenecks && floorplan.interconnect_bottlenecks.includes(edge.id);
                            // Cyan #06b6d4, Slate #475569
                            const stroke = isBottleneck ? '#ef4444' : (edge.thickness > 2 ? '#22d3ee' : '#64748b');
                            const opacity = isBottleneck ? 1 : 0.8;
                            const filter = edge.thickness > 2 || isBottleneck ? (isBottleneck ? "url(#glow-red)" : "url(#glow-cyan)") : "";

                            // Animate bottlenecks
                            return (
                                <g key={edge.id}>
                                    <path
                                        d={`M ${edge.path.map(p => `${p.x * scale},${p.y * scale}`).join(' L ')}`}
                                        stroke={stroke}
                                        strokeWidth={edge.thickness * 0.8} // Scale down slightly visually
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeDasharray={edge.thickness < 3 ? "2 4" : "none"} // Dashed for low speed
                                        opacity={opacity}
                                        filter={filter}
                                        className={isBottleneck ? "animate-pulse" : ""}
                                    />
                                    {isBottleneck && (
                                        <circle cx={((edge.path[0].x + edge.path[1].x) / 2) * scale} cy={((edge.path[0].y + edge.path[1].y) / 2) * scale} r="4" fill="#f87171" className="animate-ping" />
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                )}

                {/* 3. Blocks */}
                {blocks.map(block => (
                    <div
                        key={block.id}
                        style={{
                            position: 'absolute',
                            left: block.x * scale,
                            top: block.y * scale,
                            width: block.width * scale,
                            height: block.height * scale,
                        }}
                        className={`${getBlockStyle(null, block.logic_type)} group z-20 flex flex-col items-center justify-center overflow-hidden hover:scale-[1.02] hover:shadow-cyan-500/50 hover:border-cyan-400`}
                        title={block.label}
                    >
                        {/* Micro-details inside block */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,#fff_25%,#fff_50%,transparent_50%,transparent_75%,#fff_75%,#fff_100%)] bg-[length:10px_10px]"></div>

                        {/* Label */}
                        <span className="relative z-10 text-[10px] font-mono font-bold uppercase tracking-wider text-center pointer-events-none drop-shadow-md">
                            {block.label.replace("Core", "").replace("Controller", "Ctrl")}
                        </span>

                        {/* Decorative corners */}
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40"></div>
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40"></div>
                    </div>
                ))}

                {/* 4. Heatmap Overlay */}
                {showHeatmap && (
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none z-30 mix-blend-color-dodge">
                        {power_density_grid.map((row, y) =>
                            row.map((val, x) => (
                                <div
                                    key={`${x}-${y}`}
                                    style={{
                                        background: val > 5 ? 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)' :
                                            val > 2 ? 'radial-gradient(circle, rgba(234,179,8,0.4) 0%, transparent 70%)' : 'transparent',
                                    }}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloorplanView;
