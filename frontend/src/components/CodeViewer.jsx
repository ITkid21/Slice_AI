import React, { useState } from 'react';

const CodeViewer = ({ rtl, testbench }) => {
    const [activeTab, setActiveTab] = useState('rtl');
    const [selectedFile, setSelectedFile] = useState('top_chip.v');

    // Parse files if RTL is an object (Upgrade 6)
    const files = typeof rtl === 'object' && rtl !== null ? rtl : { "generated.v": rtl || "// No code" };
    const fileList = Object.keys(files);

    return (
        <div className="h-full flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-700">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'rtl' ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('rtl')}
                >
                    RTL (Verilog)
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'tb' ? 'bg-gray-800 text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setActiveTab('tb')}
                >
                    Testbench
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* File Sidebar (only for RTL tab and if multiple files) */}
                {activeTab === 'rtl' && fileList.length > 1 && (
                    <div className="w-48 border-r border-gray-700 bg-gray-900 overflow-y-auto">
                        <div className="p-2 text-xs font-semibold text-gray-500 uppercase">Files</div>
                        <ul>
                            {fileList.map(filename => (
                                <li
                                    key={filename}
                                    className={`cursor-pointer px-4 py-2 text-sm truncate ${selectedFile === filename ? 'bg-gray-800 text-blue-300' : 'text-gray-400 hover:bg-gray-800'}`}
                                    onClick={() => setSelectedFile(filename)}
                                >
                                    {filename}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Code Area */}
                <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-950 text-gray-300">
                    <pre>
                        {activeTab === 'rtl'
                            ? (files[selectedFile] || files[fileList[0]])
                            : (testbench || "// No Testbench generated yet")
                        }
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default CodeViewer;
