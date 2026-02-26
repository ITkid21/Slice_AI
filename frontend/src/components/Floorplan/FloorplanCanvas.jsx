import React, { useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, RefreshCw, Grid } from 'lucide-react';
import BlockRenderer from './BlockRenderer';

const FloorplanCanvas = ({ layout, onBlockClick, layers, selectedBlock }) => {
    const [ref, bounds] = useMeasure();
    const [view, setView] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Auto-fit
    useEffect(() => {
        if (bounds.width && layout) {
            const scaleX = (bounds.width - 100) / layout.width;
            const scaleY = (bounds.height - 100) / layout.height;
            const scale = Math.min(scaleX, scaleY, 1.2);

            setView({
                x: (bounds.width - (layout.width * scale)) / 2,
                y: (bounds.height - (layout.height * scale)) / 2,
                k: scale
            });
        }
    }, [layout, bounds.width, bounds.height]);

    // Pan Handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - view.x, y: e.clientY - view.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setView(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
        }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleWheel = (e) => {
        const zoomSensitivity = 0.001;
        const newK = Math.max(0.1, Math.min(view.k - e.deltaY * zoomSensitivity, 5));
        setView(prev => ({ ...prev, k: newK }));
    };

    // --- Filter Blocks based on Layers ---
    const visibleBlocks = layout?.blocks.filter(b => {
        if (b.type === 'Compute' && !layers.compute) return false;
        if (b.type === 'Memory' && !layers.memory) return false;
        if (b.type === 'IO' && !layers.io) return false;
        return true;
    });

    // --- Rulers Generation ---
    const RulerTicksX = () => {
        const ticks = [];
        const width = layout?.width || 1000;
        const step = 200;
        for (let i = 0; i <= width; i += step) {
            ticks.push(
                <g key={i} transform={`translate(${i}, -10)`}>
                    <line y1="0" y2="10" stroke="#4b5563" strokeWidth="1" />
                    <text y="-5" textAnchor="middle" fill="#9ca3af" fontSize="12" className="select-none">{i}</text>
                </g>
            );
        }
        return ticks;
    };

    // Y Ruler ticks... (Simplified for vertical)

    return (
        <div ref={ref} className="relative w-full h-full bg-[#0b0f19] overflow-hidden cursor-grab active:cursor-grabbing">

            {/* Grid Overlay (Fixed to Viewport) */}
            {layers.grid && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(#374151 1px, transparent 1px),
                            linear-gradient(90deg, #374151 1px, transparent 1px)
                        `,
                        backgroundSize: `${40 * view.k}px ${40 * view.k}px`,
                        backgroundPosition: `${view.x}px ${view.y}px`
                    }}
                />
            )}

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <button className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 shadow-lg border border-gray-700" onClick={() => setView(v => ({ ...v, k: v.k * 1.2 }))}><ZoomIn size={16} /></button>
                <button className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 shadow-lg border border-gray-700" onClick={() => setView(v => ({ ...v, k: v.k / 1.2 }))}><ZoomOut size={16} /></button>
                <button className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 shadow-lg border border-gray-700" onClick={() => setView(v => ({ ...v, x: 0, y: 0 }))}><RefreshCw size={16} /></button>
            </div>

            {/* SVG Content */}
            <svg
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                viewBox={`0 0 ${bounds.width || 800} ${bounds.height || 600}`}
                className="w-full h-full"
            >
                <motion.g
                    initial={false}
                    animate={{ x: view.x, y: view.y, scale: view.k }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* Die Substrate/Boundary */}
                    <rect
                        x={-50} y={-50}
                        width={(layout?.width || 100) + 100}
                        height={(layout?.height || 100) + 100}
                        fill="#030712"
                        stroke="none"
                    /> {/* Dark backdrop for die */}

                    <rect
                        x={0} y={0}
                        width={layout?.width || 100}
                        height={layout?.height || 100}
                        fill="#111827"
                        stroke="#374151"
                        strokeWidth="2"
                    />

                    {/* Rulers (Inside Die Coordinate System) */}
                    {layers.grid && <RulerTicksX />}

                    {/* Routes */}
                    {layers.routes && layout?.routes.map((route, i) => (
                        <motion.path
                            key={route.id}
                            d={`M ${route.from.x} ${route.from.y} L ${route.from.x + 20} ${route.from.y} L ${route.to.x} ${route.from.y} L ${route.to.x} ${route.to.y}`}
                            fill="none"
                            stroke={route.color}
                            strokeWidth={route.width}
                            strokeOpacity={0.5}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.05 }}
                            style={{ filter: 'drop-shadow(0 0 2px cyan)' }}
                        />
                    ))}

                    {/* Blocks */}
                    <AnimatePresence>
                        {visibleBlocks?.map(block => (
                            <BlockRenderer
                                key={block.id}
                                block={block}
                                isSelected={selectedBlock?.id === block.id}
                                onClick={() => onBlockClick(block)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.g>
            </svg>
        </div>
    );
};

export default FloorplanCanvas;
