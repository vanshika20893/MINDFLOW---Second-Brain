"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { 
  ReactFlow, 
  Controls, 
  Background, 
  BackgroundVariant, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position, 
  MarkerType,
  type Node, 
  type Edge, 
  type NodeProps 
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { 
  Brain, 
  Clock, 
  X, 
  ArrowRight,
  Info
} from "lucide-react";
import type { DumpItem } from "@/types";
import type { NavPage } from "@/types";

// ============================================================================
// CUSTOM NODE COMPONENTS
// ============================================================================

function DeadlineNode({ data }: NodeProps) {
  return (
    <div className="rounded-full px-5 py-2 bg-amber-950/80 border border-amber-500/60 shadow-lg shadow-amber-950/60 text-amber-200 flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase cursor-pointer hover:scale-105 transition-transform backdrop-blur-xl">
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-2 !h-2" />
      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
      <span>{data.label as string}</span>
    </div>
  );
}

function ProjectHubNode({ data }: NodeProps) {
  const isOrange = data.sphere === "academic";
  const isPeach = data.sphere === "personal";
  const isBlue = data.sphere === "work";

  const sphereBorder = isOrange 
    ? "border-[#ff541e]/50 shadow-[#ff541e]/20" 
    : isPeach 
    ? "border-[#f5c7a9]/50 shadow-[#f5c7a9]/15" 
    : isBlue 
    ? "border-blue-500/50 shadow-blue-500/20" 
    : "border-emerald-500/50 shadow-emerald-500/20";

  return (
    <div className={`rounded-3xl p-5 bg-[#121418]/95 border ${sphereBorder} shadow-2xl backdrop-blur-xl w-64 cursor-pointer hover:scale-105 transition-all group`}>
      <Handle type="target" position={Position.Top} className="!bg-[#ff541e] !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#ff541e] !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-[#ff541e] !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-[#ff541e] !w-2.5 !h-2.5" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5c7a9] font-bold">
            {data.sphereTag as string}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#ff541e] animate-ping" />
        </div>

        <div className="text-base font-bold text-white font-display uppercase tracking-wider group-hover:text-[#ff541e] transition-colors line-clamp-1">
          {data.label as string}
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          {data.subtitle as string}
        </div>
      </div>
    </div>
  );
}

function StepNode({ data }: NodeProps) {
  return (
    <div className="rounded-2xl p-3.5 bg-[#16181c]/90 border border-white/[0.08] hover:border-[#ff541e]/50 shadow-lg backdrop-blur-md w-56 cursor-pointer hover:scale-105 transition-all group">
      <Handle type="target" position={Position.Top} className="!bg-zinc-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#ff541e] !w-2 !h-2" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-zinc-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-[#ff541e] !w-2 !h-2" />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#f5c7a9] uppercase tracking-wider font-bold">
            {data.badge as string}
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-[#ff541e] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-2">
          {data.label as string}
        </div>

        <div className="text-[11px] text-zinc-500 font-mono line-clamp-1">
          {data.subtitle as string}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  deadlineNode: DeadlineNode,
  projectHubNode: ProjectHubNode,
  stepNode: StepNode,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ConnectionsViewProps {
  dumps?: DumpItem[];
  onNavigate?: (page: NavPage) => void;
}

export function ConnectionsView({ dumps = [], onNavigate }: ConnectionsViewProps) {
  const [selectedSphere, setSelectedSphere] = useState<string>("all");
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [selectedNodeTitle, setSelectedNodeTitle] = useState<string>("");

  // Dynamically generate nodes & edges based on the user's real thoughts & categories
  const { generatedNodes, generatedEdges, spheres, totalThoughts } = useMemo(() => {
    if (dumps.length === 0) {
      return { generatedNodes: [], generatedEdges: [], spheres: [], totalThoughts: 0 };
    }

    interface ThoughtEntry {
      id: string;
      text: string;
      category: string;
      type: string;
      priority: string;
      timeframe?: string;
      dumpId: string;
      dumpRawText: string;
      dumpDate: string;
    }

    const categoriesMap: Record<string, ThoughtEntry[]> = {};
    const dumpNodeGroups: Record<string, string[]> = {};
    let count = 0;

    dumps.forEach((dump) => {
      const items = dump.extractedTasks && dump.extractedTasks.length > 0
        ? dump.extractedTasks
        : [{ text: dump.rawText, category: dump.category || "General", type: "TODO" as const, priority: dump.priority, timeframe: undefined }];

      items.forEach((rawItem, idx) => {
        count++;
        const item = typeof rawItem === "string"
          ? { text: rawItem, category: dump.category || "General", type: "TODO", priority: dump.priority, timeframe: undefined }
          : rawItem;

        const cat = item.category || dump.category || "General";
        if (!categoriesMap[cat]) categoriesMap[cat] = [];

        const nodeId = `thought-${dump.id}-${idx}`;
        if (!dumpNodeGroups[dump.id]) dumpNodeGroups[dump.id] = [];
        dumpNodeGroups[dump.id].push(nodeId);

        categoriesMap[cat].push({
          id: nodeId,
          text: item.text,
          category: cat,
          type: item.type || "TODO",
          priority: item.priority || dump.priority || "HIGH",
          timeframe: item.timeframe || "Today",
          dumpId: dump.id,
          dumpRawText: dump.rawText,
          dumpDate: dump.createdAt || "Recent",
        });
      });
    });

    const sphereKeys = Object.keys(categoriesMap);
    const nodesList: Node[] = [];
    const edgesList: Edge[] = [];

    const themes = ["work", "personal", "health", "academic"];

    sphereKeys.forEach((catName, sphereIdx) => {
      const thoughtsInCat = categoriesMap[catName];
      const colX = 40 + sphereIdx * 340;
      const sphereTheme = themes[sphereIdx % themes.length];

      // 1. Central Category Hub Node
      const hubId = `hub-${sphereIdx}`;
      nodesList.push({
        id: hubId,
        type: "projectHubNode",
        position: { x: colX, y: 40 },
        data: {
          sphere: sphereTheme,
          sphereTag: catName,
          label: catName,
          subtitle: `${thoughtsInCat.length} thought${thoughtsInCat.length === 1 ? "" : "s"} clustered`,
          whyConnected: `Central synapse cluster uniting thoughts categorized under ${catName}.`,
          relatedThoughts: thoughtsInCat.map((t) => t.text),
          suggestedAction: `Focus on active tasks under ${catName}.`,
        }
      });

      // 2. Individual Thought Nodes under this Category
      thoughtsInCat.forEach((thought, tIdx) => {
        nodesList.push({
          id: thought.id,
          type: "stepNode",
          position: { x: colX, y: 190 + tIdx * 145 },
          data: {
            sphere: sphereTheme,
            sphereTag: catName,
            badge: thought.type === "ROUTINE" ? "🔁 Routine" : thought.type === "PROJECT" ? "🚀 Project" : thought.type === "IDEA" ? "💡 Idea" : "⚡ To-Do",
            label: thought.text,
            subtitle: `${thought.timeframe || "Today"} • ${thought.priority}`,
            whyConnected: `Directly extracted from your brain dump stream.`,
            relatedThoughts: [thought.dumpRawText],
            suggestedAction: thought.text,
          }
        });

        // Directed Edge from Hub to Thought Node
        edgesList.push({
          id: `e-${hubId}-${thought.id}`,
          source: hubId,
          target: thought.id,
          type: "default",
          style: { 
            stroke: sphereTheme === "work" ? "#3b82f6" : sphereTheme === "personal" ? "#f5c7a9" : sphereTheme === "health" ? "#10b981" : "#ff541e", 
            strokeWidth: 2 
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#ff541e" }
        });
      });
    });

    // 3. Subtle Cross-Connections for thoughts that originated from the same brain dump
    Object.entries(dumpNodeGroups).forEach(([dumpId, nodeIds]) => {
      if (nodeIds.length > 1) {
        for (let i = 0; i < nodeIds.length - 1; i++) {
          edgesList.push({
            id: `cross-stream-${dumpId}-${i}`,
            source: nodeIds[i],
            target: nodeIds[i + 1],
            type: "smoothstep",
            animated: true,
            style: { stroke: "rgba(245, 199, 169, 0.4)", strokeDasharray: "4,4", strokeWidth: 1.5 },
          });
        }
      }
    });

    return {
      generatedNodes: nodesList,
      generatedEdges: edgesList,
      spheres: sphereKeys,
      totalThoughts: count
    };
  }, [dumps]);

  // Filter nodes & edges based on active sphere tab
  const filteredNodes = useMemo(() => {
    if (selectedSphere === "all") return generatedNodes;
    return generatedNodes.filter((n) => n.data.sphereTag === selectedSphere);
  }, [selectedSphere, generatedNodes]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    if (selectedSphere === "all") return generatedEdges;
    return generatedEdges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [selectedSphere, generatedEdges, filteredNodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(filteredNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(filteredEdges);

  // Sync state when data changes
  useEffect(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
    setSelectedNodeTitle((node.data.label as string) || "Selected Node");
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Top Banner */}
      <section className="relative rounded-3xl glass-obsidian bg-[#131519]/90 p-6 sm:p-8 border border-white/[0.08] shadow-2xl overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#ff541e]/15 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#f5c7a9]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="badge-peach">✦ NEURAL TOPOLOGY</span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#f5c7a9]/70">Cross-Sphere Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-italic-headline text-white tracking-tight">
              SYNAPSE <span className="text-[#ff541e] text-glow-orange">CONNECTIONS</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-body mt-1">
              Visual clustering of your second brain. Thoughts dynamically connect to their core life engines.
            </p>
          </div>

          {/* Spheres filter strip (only shows if user has captured thoughts) */}
          {spheres.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
              <button
                onClick={() => setSelectedSphere("all")}
                className={`rounded-full px-4 py-1.5 text-xs font-heading uppercase tracking-wider transition-all ${
                  selectedSphere === "all"
                    ? "bg-gradient-to-r from-[#ff541e] to-[#e6420f] text-white shadow-md shadow-[#ff541e]/30"
                    : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]"
                }`}
              >
                All Spheres ({totalThoughts})
              </button>
              {spheres.map((sphere) => (
                <button
                  key={sphere}
                  onClick={() => setSelectedSphere(selectedSphere === sphere ? "all" : sphere)}
                  className={`rounded-full px-4 py-1.5 text-xs font-heading uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedSphere === sphere
                      ? "bg-gradient-to-r from-[#ff541e] to-[#e6420f] text-white shadow-md shadow-[#ff541e]/30"
                      : "bg-white/[0.04] text-zinc-300 hover:text-white border border-white/[0.08]"
                  }`}
                >
                  {sphere}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Graph Area or Clean Slate Message */}
      {dumps.length === 0 ? (
        <div className="rounded-3xl glass-luxury bg-[#131519]/70 border border-white/[0.08] p-12 sm:p-16 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#ff541e]/20 to-[#e6420f]/10 border border-[#ff541e]/40 flex items-center justify-center mx-auto text-[#ff541e] shadow-lg shadow-[#ff541e]/25 animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">
              No Synapse Connections Yet
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-body leading-relaxed">
              This new account is on a clean slate. Once you dump your thoughts in the <strong className="text-white">Dump</strong> tab, our AI engine will automatically group related thoughts, detect dependencies, and render an interactive neural network here!
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("dump")}
              className="btn-pill-kinetic px-6 py-2.5 text-xs font-heading tracking-wider uppercase inline-flex items-center gap-2 mt-2 cursor-pointer"
            >
              <span>Capture Your First Thought →</span>
            </button>
          )}
        </div>
      ) : (
        <section className="relative rounded-3xl glass-obsidian bg-[#0d0e11]/90 border border-white/[0.08] shadow-2xl overflow-hidden h-[600px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="rgba(255, 84, 30, 0.15)" gap={32} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="!bg-[#16181c] !border-white/10 !rounded-2xl !shadow-xl !fill-white [&>button]:!border-white/5 [&>button]:!text-zinc-300" />
          </ReactFlow>

          {/* Slide-over Inspection Drawer */}
          {selectedNodeData && (
            <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 glass-luxury bg-[#131519]/95 border-l border-white/[0.1] p-6 shadow-2xl z-30 animate-in slide-in-from-right duration-300 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5c7a9] font-bold block">
                      {selectedNodeData.sphereTag || "Node Inspector"}
                    </span>
                    <h2 className="text-lg font-bold text-white font-display mt-0.5">
                      {selectedNodeTitle}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedNodeData(null)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Why Connected */}
                {selectedNodeData.whyConnected && (
                  <div className="rounded-2xl bg-white/[0.03] p-4 border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#ff541e]">
                      <Info className="w-3.5 h-3.5 text-[#ff541e]" />
                      <span>WHY IS THIS CONNECTED?</span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-body">
                      {selectedNodeData.whyConnected}
                    </p>
                  </div>
                )}

                {/* Related Thoughts Quotes */}
                {selectedNodeData.relatedThoughts && selectedNodeData.relatedThoughts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Related Thoughts ({selectedNodeData.relatedThoughts.length})
                    </span>
                    <div className="space-y-2">
                      {selectedNodeData.relatedThoughts.map((t: string, idx: number) => (
                        <div
                          key={idx}
                          className="text-xs text-zinc-300 bg-white/[0.02] rounded-xl p-3 border border-white/[0.06] italic leading-relaxed font-body"
                        >
                          &ldquo;{t}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Callout */}
                {selectedNodeData.suggestedAction && (
                  <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-[#f5c7a9] uppercase tracking-wider block">
                      Suggested Next Action
                    </span>
                    <p className="text-xs text-zinc-200 font-medium font-body">
                      {selectedNodeData.suggestedAction}
                    </p>
                  </div>
                )}

                {onNavigate && (
                  <button
                    onClick={() => onNavigate("plan")}
                    className="w-full btn-pill-kinetic py-2.5 px-4 text-xs font-heading tracking-wider uppercase flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-lg shadow-[#ff541e]/20"
                  >
                    <span>View in Action Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
