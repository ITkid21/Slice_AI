
import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';

const LayerControl = ({ layers, onToggle }) => {
    return (
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-xl rounded-lg overflow-hidden z-20 w-48">
            <div className="p-2 border-b border-gray-800 flex items-center gap-2 text-gray-300">
                <Layers size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Layer Control</span>
            </div>
            <div className="p-1">
                {Object.entries(layers).map(([key, visible]) => (
                    <button
                        key={key}
                        onClick={() => onToggle(key)}
                        className={`w-full flex items-center justify-between p-2 text-xs rounded hover:bg-gray-800 transition-colors ${visible ? 'text-gray-200' : 'text-gray-500'}`}
                    >
                        <span className="capitalize">{key}</span>
                        {visible ? <Eye size={14} className="text-blue-400" /> : <EyeOff size={14} />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LayerControl;
