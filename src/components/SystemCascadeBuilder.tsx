"use client";

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { calculateCascade, CascadeBlock } from '@/lib/cascadeMath';
import { parseTouchstone, ParseResult } from '@/lib/sParameterEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RFBlockNodeData {
  name: string;
  gain: number;
  nf: number;
  oip3: number;
  onChange?: (id: string, field: string, value: number) => void;
  onFileLoad?: (id: string, content: string, fileName: string) => void;
  sParamData?: ParseResult;
  sParamFileName?: string;
  [key: string]: unknown; // For ReactFlow internal usage if needed
}

const COMPONENT_PRESETS: Record<string, Pick<RFBlockNodeData, 'gain' | 'nf' | 'oip3'>> = {
  LNA: { gain: 15, nf: 1.5, oip3: 20 },
  Mixer: { gain: -6, nf: 6, oip3: 15 },
  Filter: { gain: -2, nf: 2, oip3: 100 },
  PA: { gain: 20, nf: 6, oip3: 35 },
  Attenuator: { gain: -6, nf: 6, oip3: 100 },
};

function formatSummaryFrequency(frequency?: number): string {
  if (frequency === undefined) return '';
  if (frequency >= 1e9) return `@ ${(frequency / 1e9).toFixed(3)} GHz`;
  if (frequency >= 1e6) return `@ ${(frequency / 1e6).toFixed(3)} MHz`;
  return `@ ${frequency.toFixed(0)} Hz`;
}

// Custom Node for RF Block
const RFBlockNode = ({ data, id }: NodeProps<Node<RFBlockNodeData>>) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-lg p-3 shadow-md min-w-[170px] text-gray-900 dark:text-gray-100 font-sans">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-none" />
      <div className="font-bold text-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">{data.name}</div>
      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex justify-between items-center gap-3">
          <label className="text-gray-600 dark:text-gray-400 font-medium">Gain (dB)</label>
          <input 
            type="number" 
            className="w-16 p-1 border rounded bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
            value={data.gain}
            onChange={(e) => data.onChange?.(id, 'gain', parseFloat(e.target.value) || 0)}
            disabled={!!data.sParamData}
            title={data.sParamData ? "Gain is driven by S-Parameter file" : ""}
          />
        </div>
        <div className="flex justify-between items-center gap-3">
          <label className="text-gray-600 dark:text-gray-400 font-medium">NF (dB)</label>
          <input 
            type="number" 
            className="w-16 p-1 border rounded bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-right focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={data.nf}
            onChange={(e) => data.onChange?.(id, 'nf', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex justify-between items-center gap-3">
          <label className="text-gray-600 dark:text-gray-400 font-medium">OIP3 (dBm)</label>
          <input 
            type="number" 
            className="w-16 p-1 border rounded bg-gray-50 border-gray-300 dark:bg-gray-900 dark:border-gray-600 text-right focus:outline-none focus:ring-2 focus:ring-blue-500" 
            value={data.oip3}
            onChange={(e) => data.onChange?.(id, 'oip3', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="flex flex-col gap-1 mt-1 border-t border-gray-200 dark:border-gray-700 pt-2">
          <label className="text-gray-600 dark:text-gray-400 font-medium text-[10px]">.sNp File (S21 Overrides Gain)</label>
          <input 
            type="file" 
            accept=".s2p,.s3p,.s4p,.s5p,.s6p,.s7p,.s8p,.s9p,.s10p,.s11p,.s12p"
            className="text-[10px] w-full text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (ev.target?.result) {
                    data.onFileLoad?.(id, ev.target.result as string, file.name);
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
          {!!data.sParamFileName && <div className="text-[9px] text-blue-500 truncate mt-1 font-medium" title={data.sParamFileName as string}>Loaded: {data.sParamFileName as string}</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-none" />
    </div>
  );
};

const initialNodes: Node<RFBlockNodeData>[] = [
  { id: '1', type: 'rfBlock', position: { x: 50, y: 150 }, data: { name: 'LNA', gain: 15, nf: 1.5, oip3: 20 } },
  { id: '2', type: 'rfBlock', position: { x: 300, y: 150 }, data: { name: 'Filter', gain: -2, nf: 2, oip3: 100 } },
  { id: '3', type: 'rfBlock', position: { x: 550, y: 150 }, data: { name: 'Mixer', gain: -6, nf: 6, oip3: 15 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function SystemCascadeBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RFBlockNodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeDataChange = useCallback((id: string, field: string, value: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, [field]: value } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onFileLoad = useCallback((id: string, content: string, fileName: string) => {
    // Basic detection of ports from extension (e.g. .s2p -> 2)
    const extMatch = fileName.match(/\.s(\d+)p$/i);
    const numPorts = extMatch ? parseInt(extMatch[1]) : 2;
    if (numPorts < 2) {
      alert("Cascade gain extraction needs at least a 2-port Touchstone file so S21 is available.");
      return;
    }
    
    try {
      const parsed = parseTouchstone(content, numPorts);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            return { 
              ...node, 
              data: { 
                ...node.data, 
                sParamData: parsed,
                sParamFileName: fileName
              } 
            };
          }
          return node;
        })
      );
    } catch (err) {
      console.error("Error parsing S-parameter file:", err);
      alert("Failed to parse Touchstone file. Please ensure it is a valid format.");
    }
  }, [setNodes]);

  const nodeTypes = useMemo(() => {
    const RFBlockNodeWrapper = (props: NodeProps<Node<RFBlockNodeData>>) => {
      return <RFBlockNode {...props} data={{...props.data, onChange: onNodeDataChange, onFileLoad}} />
    };
    return { rfBlock: RFBlockNodeWrapper };
  }, [onNodeDataChange, onFileLoad]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  // Compute cascade path and results
  const cascadeAnalysis = useMemo(() => {
    const warnings: string[] = [];
    if (nodes.length === 0) {
      return { result: null, warnings };
    }

    const incomingEdgeCount: Record<string, number> = {};
    const outgoingEdges: Record<string, string[]> = {};
    
    nodes.forEach(n => {
      incomingEdgeCount[n.id] = 0;
      outgoingEdges[n.id] = [];
    });

    edges.forEach(e => {
      if (incomingEdgeCount[e.target] !== undefined) {
        incomingEdgeCount[e.target]++;
      }
      if (outgoingEdges[e.source]) {
        outgoingEdges[e.source].push(e.target);
      }
    });

    // Find start nodes
    const startNodes = nodes.filter(n => incomingEdgeCount[n.id] === 0);
    
    if (startNodes.length === 0) {
      return { result: null, warnings: ['No valid left-to-right cascade chain found. Check for cycles or missing input blocks.'] };
    }

    if (startNodes.length > 1) {
      warnings.push('Multiple source blocks detected. Results use the first source chain only.');
    }

    // Follow the first valid chain found
    const chain: CascadeBlock[] = [];
    let currentNodeId: string | undefined = startNodes[0].id;
    const visited = new Set<string>();

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      const node = nodes.find(n => n.id === currentNodeId);
      if (node) {
        chain.push({
          id: node.id,
          name: node.data.name,
          gain: node.data.gain,
          nf: node.data.nf,
          oip3: node.data.oip3,
          sParamData: node.data.sParamData,
          sParamFileName: node.data.sParamFileName,
        });
      }
      const nextNodes: string[] = outgoingEdges[currentNodeId] ?? [];
      if (nextNodes.length > 1) {
        warnings.push(`Branching detected after ${node?.data.name ?? currentNodeId}. Results use the first outgoing branch only.`);
      }
      currentNodeId = nextNodes[0];
      if (currentNodeId && visited.has(currentNodeId)) {
        warnings.push('Cycle detected. Results stop before the repeated block.');
      }
    }

    if (chain.length > 0) {
      return { result: calculateCascade(chain), warnings };
    } 
    return { result: null, warnings };
  }, [nodes, edges]);

  const cascadeResult = cascadeAnalysis.result;
  const summaryFrequencyLabel = formatSummaryFrequency(cascadeResult?.summaryFrequency);

  const addBlock = (name: string) => {
    const newNodeId = `node_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const preset = COMPONENT_PRESETS[name] ?? { gain: 0, nf: 0, oip3: 100 };
    const newNode: Node<RFBlockNodeData> = {
      id: newNodeId,
      type: 'rfBlock',
      position: { x: Math.random() * 100 + 100, y: Math.random() * 100 + 100 },
      data: { name, ...preset },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[700px] w-full border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-950 font-sans">
      
      {/* Sidebar Controls */}
      <div className="w-full lg:w-72 bg-gray-50/50 dark:bg-gray-900/50 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 flex flex-col gap-6 overflow-y-auto shrink-0 z-10 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            Components
          </h3>
          <div className="flex flex-col gap-2.5">
            <button onClick={() => addBlock('LNA')} className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition font-medium text-left flex justify-between items-center group">
              <span>Low Noise Amp</span>
              <span className="text-xl leading-none text-gray-400 group-hover:text-blue-500">+</span>
            </button>
            <button onClick={() => addBlock('Mixer')} className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm transition font-medium text-left flex justify-between items-center group">
              <span>Mixer</span>
              <span className="text-xl leading-none text-gray-400 group-hover:text-purple-500">+</span>
            </button>
            <button onClick={() => addBlock('Filter')} className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-400 dark:hover:border-green-500 hover:shadow-sm transition font-medium text-left flex justify-between items-center group">
              <span>Filter</span>
              <span className="text-xl leading-none text-gray-400 group-hover:text-green-500">+</span>
            </button>
            <button onClick={() => addBlock('PA')} className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-400 dark:hover:border-red-500 hover:shadow-sm transition font-medium text-left flex justify-between items-center group">
              <span>Power Amp</span>
              <span className="text-xl leading-none text-gray-400 group-hover:text-red-500">+</span>
            </button>
            <button onClick={() => addBlock('Attenuator')} className="px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transition font-medium text-left flex justify-between items-center group">
              <span>Attenuator</span>
              <span className="text-xl leading-none text-gray-400 group-hover:text-gray-500">+</span>
            </button>
          </div>
          <button onClick={clearCanvas} className="mt-4 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition font-medium text-sm">
            Clear Canvas
          </button>
        </div>

        <div className="mt-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-800 pt-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            System Results
          </h3>
          {cascadeResult ? (
            <div className="flex flex-col gap-3">
              {cascadeAnalysis.warnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 text-xs leading-relaxed">
                  {cascadeAnalysis.warnings[0]}
                </div>
              )}
              {cascadeResult.sweptResults && cascadeResult.sweptResults.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm w-full h-48 mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cascadeResult.sweptResults} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                      <XAxis 
                        dataKey="frequency" 
                        tickFormatter={(val) => (val / 1e9).toFixed(1) + 'G'} 
                        stroke="#9ca3af" 
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', fontSize: '12px', color: '#f3f4f6' }}
                        labelFormatter={(val) => `Freq: ${(Number(val) / 1e9).toFixed(2)} GHz`}
                        formatter={(val) => [`${Number(val).toFixed(2)} dB/dBm`]}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line type="monotone" dataKey="cascadedGain" name="Gain" stroke="#3b82f6" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="cascadedNF" name="NF" stroke="#ef4444" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="cascadedOIP3" name="OIP3" stroke="#22c55e" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Gain {summaryFrequencyLabel}</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{cascadeResult.cascadedGain.toFixed(2)} <span className="text-xs font-normal text-gray-500">dB</span></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">NF {summaryFrequencyLabel}</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{cascadeResult.cascadedNF.toFixed(2)} <span className="text-xs font-normal text-gray-500">dB</span></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">OIP3 {summaryFrequencyLabel}</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {isFinite(cascadeResult.cascadedOIP3) ? cascadeResult.cascadedOIP3.toFixed(2) : '---'} <span className="text-xs font-normal text-gray-500">dBm</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">IIP3 {summaryFrequencyLabel}</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {isFinite(cascadeResult.cascadedIIP3) ? cascadeResult.cascadedIIP3.toFixed(2) : '---'} <span className="text-xs font-normal text-gray-500">dBm</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-center shadow-sm">
              Connect blocks to view analysis
            </div>
          )}
        </div>
      </div>

      {/* Main Flow Area */}
      <div className="flex-grow h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-transparent"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#9ca3af" className="opacity-40" />
          <Controls className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm rounded-md" />
          <Panel position="top-right" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 font-medium shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9c0-2.2 1.8-4 4-4h6c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4H9c-2.2 0-4-1.8-4-4V9z"></path><path d="M9 14h6"></path><path d="M9 10h6"></path></svg>
            Drag & Connect from left to right
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
