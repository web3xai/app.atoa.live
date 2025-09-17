import React from "react";

export type Agent = {
  id: string;
  name: string;
  role?: string;
  score?: number;
  capabilities?: string[];
};

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="relative bg-[#0f1020] text-white ring-2 ring-[#4f46e5] p-4 shadow-[0_0_0_2px_#000]">
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 80px rgba(79, 70, 229, 0.15)" }} />
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[#a78bfa]">Agent Card</div>
        <div className="text-xs text-[#00F5D4]">Score {agent.score?.toFixed(2) ?? "—"}</div>
      </div>
      <div className="mt-3 text-2xl font-black text-white">{agent.name}</div>
      <div className="mt-1 text-xs text-[#c4b5fd]">{agent.role ?? "Autonomous Service"}</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(agent.capabilities ?? ["route", "settle", "verify", "notify"]).slice(0,4).map((cap) => (
          <div key={cap} className="bg-[#11132a] text-[#a78bfa] ring-1 ring-[#4f46e5] px-2 py-1 text-xs">
            {cap}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button className="bg-[#00BBF9] text-black ring-2 ring-black px-3 py-2 text-sm font-bold">Connect</button>
        <button className="bg-[#FEE440] text-black ring-2 ring-black px-3 py-2 text-sm font-bold">Inspect</button>
      </div>
    </div>
  );
}
