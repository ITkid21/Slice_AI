
import React from 'react';
import { X, Cpu, Database, Network, Activity } from 'lucide-react';

const InspectorPanel = ({ block, onClose }) => {
    if (!block) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'Compute': return <Cpu size={16} className="text-blue-400" />;
            case 'Memory': return <Database size={16} className="text-green-400" />;
            case 'IO': return <Network size={16} className="text-orange-400" />;
            default: return <Activity size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="absolute top-4 right-4 w-64 bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-2xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-right-4 z-20">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center gap-2">
                    {getIcon(block.type)}
                    <span className="font-bold text-gray-200 text-sm truncate">{block.label}</span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
                    <X size={14} />
                </button>
            </div>

            {/* Properties */}
            <div className="p-4 space-y-4">
                {/* ID & Type */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-gray-500 block">ID</span>
                        <span className="text-gray-300 font-mono">{block.id}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block">Type</span>
                        <span className="text-blue-300">{block.type}</span>
                    </div>
                </div>

                {/* Geometry */}
                <div className="bg-black/30 p-2 rounded border border-gray-800/50">
                    <span className="text-gray-500 text-xs uppercase font-bold mb-1 block">Geometry (µm)</span>
                    <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-400">
                        <span>X: <span className="text-gray-200">{block.x.toFixed(0)}</span></span>
                        <span>Y: <span className="text-gray-200">{block.y.toFixed(0)}</span></span>
                        <span>W: <span className="text-gray-200">{block.width.toFixed(0)}</span></span>
                        <span>H: <span className="text-gray-200">{block.height.toFixed(0)}</span></span>
                    </div>
                </div>

                {/* Stats */}
                {block.stats && (
                    <div className="space-y-1">
                        <span className="text-gray-500 text-xs uppercase font-bold">Performance Metrics</span>
                        {Object.entries(block.stats).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-xs border-b border-gray-800 pb-1 last:border-0">
                                <span className="text-gray-400 capitalize">{key}</span>
                                <span className="text-green-400 font-mono">{val}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer status */}
            <div className="p-2 bg-gray-950/50 border-t border-gray-800 text-[10px] text-gray-600 text-center uppercase tracking-wider">
                Block Inspection Mode
            </div>
        </div>
    );
};

export default InspectorPanel;
