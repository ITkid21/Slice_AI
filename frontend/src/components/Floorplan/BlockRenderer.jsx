import React from 'react';
import { motion } from 'framer-motion';

const BlockRenderer = ({ block, isSelected, onClick }) => {
    // Dynamic Styles based on type (Blueprint / Neon Theme)
    const getStyle = (type) => {
        switch (type) {
            case 'Compute': return {
                fill: 'rgba(6, 182, 212, 0.15)', // Cyan
                stroke: '#06b6d4',
                shadow: '0 0 15px rgba(6, 182, 212, 0.4)'
            };
            case 'Memory': return {
                fill: 'rgba(16, 185, 129, 0.15)', // Emerald
                stroke: '#10b981',
                shadow: '0 0 15px rgba(16, 185, 129, 0.4)'
            };
            case 'IO': return {
                fill: 'rgba(168, 85, 247, 0.15)', // Purple
                stroke: '#a855f7',
                shadow: '0 0 15px rgba(168, 85, 247, 0.4)'
            };
            default: return {
                fill: 'rgba(107, 114, 128, 0.15)',
                stroke: '#6b7280',
                shadow: 'none'
            };
        }
    };

    const style = getStyle(block.type);

    return (
        <motion.g
            layoutId={block.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, filter: 'brightness(1.2)' }}
            onClick={(e) => { e.stopPropagation(); onClick(block); }}
            className="cursor-pointer"
            style={{
                filter: isSelected ? `drop-shadow(${style.shadow})` : 'none'
            }}
        >
            {/* The Block Rect */}
            <rect
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                rx={4}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-300"
            />

            {/* Diagonal Hatch Pattern (Visual Texture) */}
            <defs>
                <pattern id={`hatch-${block.id}`} width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" style={{ stroke: style.stroke, strokeOpacity: 0.1, strokeWidth: 1 }} />
                </pattern>
            </defs>
            <rect
                x={block.x}
                y={block.y}
                width={block.width}
                height={block.height}
                fill={`url(#hatch-${block.id})`}
                rx={4}
                className="pointer-events-none"
            />

            {/* Label */}
            <text
                x={block.x + block.width / 2}
                y={block.y + block.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={style.stroke}
                className="text-xs font-mono font-bold pointer-events-none uppercase tracking-widest select-none"
                style={{
                    fontSize: Math.min(block.width / 8, 12),
                    textShadow: '0 0 2px rgba(0,0,0,0.8)'
                }}
            >
                {block.label}
            </text>
        </motion.g>
    );
};

export default BlockRenderer;
