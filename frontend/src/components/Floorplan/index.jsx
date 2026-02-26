import React, { useState, useEffect } from 'react';
import { calculateLayout } from './LayoutCalculator';
import FloorplanCanvas from './FloorplanCanvas';
import MetricsPanel from './MetricsPanel';
import InspectorPanel from './InspectorPanel';
import LayerControl from './LayerControl';

const Floorplan = ({ spec }) => {
    const [layout, setLayout] = useState(null);
    const [previousStats, setPreviousStats] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [layers, setLayers] = useState({
        grid: true,
        routes: true,
        compute: true,
        memory: true,
        io: true
    });

    useEffect(() => {
        if (spec) {
            const newLayout = calculateLayout(spec);
            // Only update previous if we're changing something major (like partitioning)
            // or if it's the first real transition
            if (layout && layout.stats) {
                setPreviousStats(layout.stats);
            }
            setLayout(newLayout);
            setSelectedBlock(null);
        }
    }, [spec]);

    const handleLayerToggle = (layer) => {
        setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    };

    return (
        <div className="flex h-full w-full bg-gray-950 overflow-hidden relative">
            {/* Main Canvas Area */}
            <div className="flex-1 relative h-full">
                <FloorplanCanvas
                    layout={layout}
                    selectedBlock={selectedBlock}
                    onBlockClick={setSelectedBlock}
                    layers={layers}
                />

                {/* Floating Controls */}
                <LayerControl layers={layers} onToggle={handleLayerToggle} />
                <InspectorPanel block={selectedBlock} onClose={() => setSelectedBlock(null)} />
            </div>

            {/* Side Metrics Panel (Optional: Toggleable or fixed? Keeping fixed for now as per MVP) */}
            {/* User wanted a cleaner interface. Let's keep Metrics panel but maybe styling needs check. */}
            <div className="w-80 h-full border-l border-gray-800 bg-gray-900 z-10 shadow-xl hidden lg:block">
                <MetricsPanel stats={layout?.stats} previousStats={previousStats} spec={spec} />
            </div>

            {/* Overlay */}
            {!layout && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 backdrop-blur-sm">
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 shadow-xl">
                        Generate architecture to view floorplan
                    </div>
                </div>
            )}
        </div>
    );
};

export default Floorplan;
