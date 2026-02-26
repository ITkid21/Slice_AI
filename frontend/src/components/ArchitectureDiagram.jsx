import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';


const ArchitectureDiagram = ({ graphData }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (graphData && graphData.nodes) {
            // Transform backend nodes to ReactFlow nodes
            const rfNodes = graphData.nodes.map(node => {
                let borderColor = '#9ca3af'; // default grey
                const lType = node.data.logic_type;

                if (lType === 'Digital') borderColor = '#3b82f6'; // Blue
                else if (lType === 'Analog' || lType === 'Analog/Mixed') borderColor = '#f59e0b'; // Orange
                else if (lType === 'Memory') borderColor = '#8b5cf6'; // Purple

                return {
                    id: node.id,
                    type: node.type, // 'input', 'output', 'default' are built-in
                    data: { label: node.data.label, logic_type: node.data.logic_type },
                    position: node.position,
                    style: {
                        border: `2px solid ${borderColor}`,
                        background: '#1f2937',
                        color: 'white',
                        width: 150,
                        fontSize: '0.8rem',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }
                };
            });

            const rfEdges = graphData.edges.map(edge => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                animated: true,
                style: { stroke: '#9ca3af' }
            }));

            setNodes(rfNodes);
            setEdges(rfEdges);
        }
    }, [graphData, setNodes, setEdges]);

    // Auto-layout not needed for MVP as backend provides positions? 
    // Wait, backend provides simple hardcoded positions. ReactFlow handles rendering.

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div className="h-full w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="#374151" gap={16} />
                <Controls className="bg-gray-800 text-white border-gray-700" />
            </ReactFlow>
        </div>
    );
};

export default ArchitectureDiagram;
