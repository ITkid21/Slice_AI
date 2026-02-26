import React, { useState, useEffect } from 'react';
import SpecForm from './components/SpecForm';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import CodeViewer from './components/CodeViewer';
import Floorplan from './components/Floorplan';
import AiInsightsPanel from './components/AiInsightsPanel';
import LoadingScreen from './components/LoadingScreen';
import { analyzeSpec, generateCode } from './api';
import { Sparkles, PlayCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(true);
  const [spec, setSpec] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [code, setCode] = useState({ rtl: '', testbench: '' });
  const [viewMode, setViewMode] = useState('arch'); // 'arch' or 'floorplan'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Removed localStorage check to restore original "Always Show" behavior
  const handleIntroComplete = () => {
    setLoadingScreenVisible(false);
  };

  const handleReplayIntro = () => {
    setLoadingScreenVisible(true);
  };

  const handleGenerate = React.useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setViewMode('arch');
    try {
      // Step 1: Analyze & Get Architecture
      const analysisRes = await analyzeSpec(formData);
      setAnalysis(analysisRes.feasibility);
      setGraphData(analysisRes.architecture);
      setSpec(formData); // Save spec for code gen

      // Step 2: Generate Code immediately
      const codeRes = await generateCode(formData);
      setCode(codeRes);

    } catch (err) {
      setError("Failed to connect to backend. Make sure the server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyOptimization = React.useCallback((newSpec) => {
    setSpec(newSpec);
    // Re-trigger generation with new spec
    handleGenerate(newSpec);
  }, [handleGenerate]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loadingScreenVisible && (
          <LoadingScreen onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
      {/* Safety: Use a fixed overlay that is definitely removed when loadingScreenVisible is false */}
      {!loadingScreenVisible && (
        <div style={{ display: 'none' }} />
      )}

      <div className="flex h-screen w-full bg-gray-950 text-gray-100 overflow-hidden font-sans">
        {/* Sidebar - Specification Input */}
        <aside className="w-1/4 min-w-[300px] border-r border-gray-800 p-4 bg-gray-900 overflow-y-auto">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
            SiliceAI Architect
          </h1>
          <SpecForm onSubmit={handleGenerate} isLoading={loading} initialSpec={spec} />

          {/* View Toggle / Controls */}
          {spec && (
            <div className="mt-6 flex space-x-2 p-2 bg-gray-800 rounded">
              <button
                onClick={() => setViewMode('arch')}
                className={`flex-1 py-2 rounded text-sm font-bold transition-all ${viewMode === 'arch' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
              >
                Architecture
              </button>
              <button
                onClick={() => setViewMode('floorplan')}
                className={`flex-1 py-2 rounded text-sm font-bold transition-all ${viewMode === 'floorplan' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
              >
                Floorplan
              </button>
            </div>
          )}

          {/* Analysis Results / Warnings */}
          {analysis && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-lg mb-2 text-yellow-500">Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Area Est:</span>
                  <span className="font-mono text-blue-300">{analysis.area_estimate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Power Est:</span>
                  <span className="font-mono text-green-300">{analysis.power_estimate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Freq:</span>
                  <span className="font-mono text-purple-300">{analysis.max_freq_estimate}</span>
                </div>
              </div>
              {analysis.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <h4 className="text-red-400 font-medium mb-1">Warnings</h4>
                  <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                    {analysis.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Footer / Replay Controls */}
          <div className="mt-auto pt-6 border-t border-gray-800">
            <button
              onClick={handleReplayIntro}
              className="flex items-center space-x-2 text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              <PlayCircle size={14} />
              <span>Replay Startup Sequence</span>
            </button>
          </div>
        </aside>

        {/* Main Content - Visualization & Code */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Top Bar for AI Toggle */}
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`p-2 rounded-full shadow-lg transition-all ${showAiPanel ? 'bg-purple-600 text-white' : 'bg-gray-800 text-purple-400 hover:bg-gray-700'}`}
              title="Toggle AI Copilot"
            >
              <Sparkles size={20} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Diagram Area */}
            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
              <section className="flex-1 min-h-[400px] flex flex-col relative border border-gray-800 rounded-lg overflow-hidden bg-gray-900">
                {viewMode === 'arch' ? (
                  <ArchitectureDiagram graphData={graphData} />
                ) : (
                  <Floorplan spec={spec} />
                )}
              </section>

              {/* Bottom Half: Code Viewer */}
              <section className="h-1/3 min-h-[250px]">
                <CodeViewer rtl={code.rtl} testbench={code.testbench} />
              </section>
            </div>

            {/* AI Panel (Right Sidebar) - Animated Slide-In */}
            <div
              className={`transition-all duration-300 ease-in-out border-l border-gray-800 bg-gray-900 ${showAiPanel ? 'w-96 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
            >
              {showAiPanel && <AiInsightsPanel spec={spec} onApplyOptimization={handleApplyOptimization} />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
