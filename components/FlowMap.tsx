"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type OnConnect,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";

function BubbleNode({ data }: { data: { label: string; color: string; purpose?: string } }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative select-none" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Handle id="t" type="target" position={Position.Top} style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid #000" }} />
      <Handle id="l" type="target" position={Position.Left} style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid #000" }} />
      <motion.div
        className="relative rounded-full text-black font-semibold"
        initial={{ scale: 0.9, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.98 }}
        style={{
          backgroundColor: data.color,
          padding: 12,
          boxShadow: "0 0 0 2px #000, 0 0 18px rgba(0,0,0,0.35)",
          minWidth: 48,
          textAlign: "center",
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-[-6px] rounded-full"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ boxShadow: `0 0 24px ${data.color}` }}
        />
        {data.label}
      </motion.div>
      <Handle id="r" type="source" position={Position.Right} style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid #000" }} />
      <Handle id="b" type="source" position={Position.Bottom} style={{ background: "#ffffff", width: 10, height: 10, border: "2px solid #000" }} />
      {hover ? (
        <motion.div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-[140px] w-[220px]"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
        >
          <div className="bg-[#0f1020] text-white ring-2 ring-[#4f46e5] p-3 shadow-[0_0_0_2px_#000]">
            <div className="text-[10px] uppercase tracking-widest text-[#a78bfa]">Agent Card</div>
            <div className="mt-1 text-lg font-black">{data.label}</div>
            {data.purpose ? (
              <div className="mt-2 text-xs text-[#c4b5fd] leading-relaxed">{data.purpose}</div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

const nodeTypes = { bubble: BubbleNode } as const;

export type AgentGraph = {
  agents: { id: string; name: string; purpose?: string }[];
  edges: { source: string; target: string; label?: string }[];
};

export const HARDCODED_TEAM: AgentGraph = {
  agents: [
    { id: "orchestrator", name: "Orchestrator", purpose: "route tasks to specialist agents" },
    { id: "web-search", name: "Web Search", purpose: "search the web for fresh info" },
    { id: "knowledge", name: "Knowledge", purpose: "retrieve known internal/domain facts" },
    { id: "synthesizer", name: "Synthesizer", purpose: "analyze and combine findings" },
    { id: "responder", name: "Responder", purpose: "craft the final answer" },
  ],
  edges: [
    { source: "orchestrator", target: "web-search", label: "need web info" },
    { source: "orchestrator", target: "knowledge", label: "need internal facts" },
    { source: "web-search", target: "synthesizer" },
    { source: "knowledge", target: "synthesizer" },
    { source: "synthesizer", target: "responder" },
  ],
};

export default function FlowMap({ graph, onSelect }: { graph?: AgentGraph | null; onSelect?: (agent: { id: string; name: string }) => void }) {
  const showMiniMap = true;
  const bgVariant = BackgroundVariant.Dots;
  const animateEdges = true;
  const initialNodes = useMemo<Node[]>(() => {
    const palette = ["#00BBF9", "#FEE440", "#9B5DE5", "#F15BB5", "#00F5D4"]; 
    return new Array(16).fill(0).map((_, i) => ({
      id: `n-${i + 1}`,
      type: "bubble",
      position: { x: 120 + (i % 4) * 180, y: 100 + Math.floor(i / 4) * 140 },
      data: { label: `Agent ${i + 1}`, color: palette[i % palette.length] },
    }));
  }, []);

  const initialEdges = useMemo<Edge[]>(() => {
    return [
      { id: "e1-2", source: "n-1", target: "n-2" },
      { id: "e2-5", source: "n-2", target: "n-5" },
      { id: "e3-7", source: "n-3", target: "n-7" },
    ];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback<OnConnect>((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

  useEffect(() => {
    if (!graph || !graph.agents?.length) return;
    const palette = ["#00BBF9", "#FEE440", "#9B5DE5", "#F15BB5", "#00F5D4"];
    const N = graph.agents.length;
    const radius = 220;
    const centerX = 420;
    const centerY = 260;
    const gNodes: Node[] = graph.agents.map((a, i) => {
      const angle = (i / N) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      return {
        id: a.id,
        type: "bubble",
        position: { x, y },
        data: { label: a.name, color: palette[i % palette.length], purpose: a.purpose },
      } as Node;
    });
    const gEdges: Edge[] = graph.edges.map((e, i) => ({ id: `e-${i}`, source: e.source, target: e.target, label: e.label }));
    setNodes(gNodes);
    setEdges(gEdges);
  }, [graph, setNodes, setEdges]);

  const displayedEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        ...e,
        animated: animateEdges,
        style: { stroke: "#00F5D4", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "#00F5D4" },
        label: (e as any).label,
        labelStyle: { fill: "#a78bfa", fontWeight: 700 },
      })),
    [edges, animateEdges]
  );

  return (
    <div className="w-full h-full bg-[#0b0c1a]">
      <ReactFlow
        nodes={nodes}
        edges={displayedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect?.({ id: node.id, name: (node.data as any).label })}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ animated: true, style: { stroke: "#00F5D4" } }}
      >
        {showMiniMap ? (
          <MiniMap
            zoomable
            pannable
            maskColor="#0b0c1a"
            nodeColor={() => "#00F5D4"}
            nodeStrokeColor={() => "#00BBF9"}
            style={{ background: "#0b0c1a" }}
          />
        ) : null}
        <Controls position="bottom-right" />
        <Background variant={bgVariant} gap={22} color="#23254a" />
      </ReactFlow>
    </div>
  );
}
