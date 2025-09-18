"use client";
import FlowMap, { type AgentGraph, HARDCODED_TEAM } from "@/components/FlowMap";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Web3AuthConnectButton from "@/components/Web3AuthConnectButton";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);
  const [graph, setGraph] = useState<AgentGraph | null>(HARDCODED_TEAM);
  const [credits, setCredits] = useState<number>(100);

  React.useEffect(() => {
    function onConsume(e: Event) {
      const amt = (e as CustomEvent<{ amount?: number }>).detail?.amount ?? 1;
      setCredits((c) => Math.max(0, c - amt));
    }
    window.addEventListener("atoa:consume-credit", onConsume);
    return () => window.removeEventListener("atoa:consume-credit", onConsume);
  }, []);
  return (
    <div className={`w-screen h-screen min-h-0 overflow-hidden grid ${sidebarOpen ? "grid-cols-[1fr_360px] md:grid-cols-[1fr_420px]" : "grid-cols-[1fr_0px]"}`}>
      <div className="relative">
        <div className="absolute top-3 left-3 right-3 z-20">
          <div className="flex items-center justify-between bg-[#0f1020]/80 backdrop-blur ring-1 ring-white/10 px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="text-sm font-black tracking-wider">ATOA</div>
              <div className="px-2 py-1 bg-black/60 text-white ring-1 ring-white/10 text-xs">Credits: {credits}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/agents/new">Create Agent</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="https://zealous-rook-259.notion.site/2729062b846880b4ba4bc9aa84e09353?pvs=73" target="_blank" rel="noopener noreferrer">Whitepaper</a>
              </Button>
              <Web3AuthConnectButton />
            </div>
          </div>
        </div>
        <FlowMap graph={graph ?? undefined} onSelect={(a) => setSelected(a)} />
        <button
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-10 bg-[#141532] text-white ring-1 ring-white/20 w-8 h-16 flex items-center justify-center"
          onClick={() => setSidebarOpen((s) => !s)}
          aria-label={sidebarOpen ? "Hide panel" : "Show panel"}
        >
          {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <div className="relative h-full min-h-0">
        <Sidebar
          selectedAgent={selected ? { id: selected.id, name: selected.name, score: Math.random() * 1 } : null}
          onCollapse={() => setSidebarOpen(false)}
          graph={graph}
          onGraphUpdate={(g) => setGraph(g)}
        />
      </div>
    </div>
  );
}
