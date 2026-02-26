import React, { useState } from 'react';
import { analyzeWithAI, optimizeWithAI } from '../api';
import { Sparkles, AlertTriangle, ArrowRight, Zap, Combine, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Assuming we might want md, but raw text for now is fine too. 
// Actually lets just use simple text rendering for JSON structure for now to avoid dep hell if not installed.

const AiInsightsPanel = ({ spec, onApplyOptimization }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [mode, setMode] = useState('analyze'); // 'analyze' or 'optimize'

    // Reset results when spec changes to avoid stale data
    React.useEffect(() => {
        setResult(null);
        setMode('analyze');
    }, [spec]);

    const handleAnalyze = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await analyzeWithAI(spec);
            setResult(data);
            setMode('analyze');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || "AI Service Unavailable (Check API Key)";
            setResult({ error: msg });
        } finally {
            setLoading(false);
        }
    }, [spec]);

    const handleOptimize = React.useCallback(async (goal) => {
        setLoading(true);
        try {
            const data = await optimizeWithAI(spec, goal);
            setResult(data);
            setMode('optimize');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || err.message || "Optimization failed.";
            setResult({ error: msg });
        } finally {
            setLoading(false);
        }
    }, [spec]);

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800 w-96 font-sans">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-950 flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg">
                    <Sparkles className="text-white w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Silicon Copilot</h2>
                    <div className="text-xs text-purple-300">Powered by Gemini</div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-800">
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !spec}
                    className="col-span-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm flex items-center justify-center space-x-2 transition-all"
                >
                    <Sparkles size={16} />
                    <span>Deep Analysis</span>
                </button>

                <div className="col-span-2 text-xs text-gray-500 uppercase font-bold mt-2 mb-1">Auto-Optimize</div>

                <button
                    onClick={() => handleOptimize('power')}
                    disabled={loading || !spec}
                    className="py-1.5 bg-gray-800 hover:bg-gray-700 text-green-400 border border-green-900/50 rounded text-xs flex items-center justify-center space-x-1"
                >
                    <Zap size={12} />
                    <span>Power</span>
                </button>
                <button
                    onClick={() => handleOptimize('performance')}
                    disabled={loading || !spec}
                    className="py-1.5 bg-gray-800 hover:bg-gray-700 text-purple-400 border border-purple-900/50 rounded text-xs flex items-center justify-center space-x-1"
                >
                    <Cpu size={12} />
                    <span>Perf</span>
                </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 animate-pulse">
                        <Sparkles className="mb-2 text-purple-500" />
                        <span className="text-xs">Analyzing Architecture...</span>
                    </div>
                )}

                {!loading && result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

                        {/* Error State */}
                        {result.error && (
                            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded text-red-200 text-sm flex items-start space-x-2">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                <span>{result.error}</span>
                            </div>
                        )}

                        {/* Analysis View */}
                        {mode === 'analyze' && !result.error && (
                            <>
                                <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-blue-300 text-sm font-bold">Executive Summary</h3>
                                        {spec?.multi_die_partitioning && (
                                            <span className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-400/50 rounded text-[10px] text-blue-400 font-bold uppercase tracking-wider animate-pulse">
                                                AMD Multi-Die Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        {result.summary || "No summary provided."}
                                    </p>
                                </div>

                                {result.bottlenecks?.length > 0 && (
                                    <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg">
                                        <h3 className="text-red-300 text-sm font-bold mb-2 flex items-center">
                                            <AlertTriangle size={14} className="mr-1" /> Bottlenecks
                                        </h3>
                                        <ul className="space-y-1">
                                            {result.bottlenecks.map((b, i) => (
                                                <li key={i} className="text-red-200/80 text-xs flex items-start">
                                                    <span className="mr-2">•</span> {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                    <h3 className="text-purple-300 text-sm font-bold mb-1">Causal Reasoning</h3>
                                    <p className="text-gray-400 text-xs italic">
                                        "{result.reasoning}"
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Optimization View */}
                        {mode === 'optimize' && !result.error && (
                            <>
                                <div className="p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                    <h3 className="text-purple-300 text-sm font-bold mb-2">Suggested Changes</h3>
                                    <div className="space-y-2">
                                        {result.changes?.map((change, i) => (
                                            <div key={i} className="flex flex-col bg-gray-900/50 p-2 rounded border border-gray-700">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-mono text-gray-300 uppercase">{change.parameter}</span>
                                                    <div className="flex items-center text-xs space-x-1">
                                                        <span className="text-gray-500 strike-through">{change.old}</span>
                                                        <ArrowRight size={10} className="text-gray-500" />
                                                        <span className="text-green-400 font-bold">{change.new}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">{change.reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {result.optimized_spec && (
                                        <button
                                            onClick={() => onApplyOptimization(result.optimized_spec)}
                                            className="w-full mt-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                                        >
                                            Apply Optimization
                                        </button>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 p-2">
                                    <span className="font-bold">Trade-offs:</span> {result.trade_offs}
                                </div>
                            </>
                        )}

                    </div>
                )}

                {!loading && !result && (
                    <div className="text-center text-gray-600 mt-10">
                        <Combine size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs">
                            Ready to analyze your silicon.<br />
                            Request a deep analysis or auto-optimization.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AiInsightsPanel;
