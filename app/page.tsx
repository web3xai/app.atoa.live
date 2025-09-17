"use client";
import FlowMap, { type AgentGraph, HARDCODED_TEAM } from "@/components/FlowMap";
import Sidebar from "@/components/Sidebar";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "../components/web3AuthContext";

import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Web3AuthConnectButton from "@/components/Web3AuthConnectButton";

const queryClient = new QueryClient();
export default function Home() {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [selected, setSelected] = useState<{ id: string; name: string } | null>(
		null,
	);
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
		<Web3AuthProvider config={web3AuthContextConfig}>
			{/* // IMP START - Setup Wagmi Provider */}
			<QueryClientProvider client={queryClient}>
				<WagmiProvider>
					<div
						className={`w-screen h-screen grid ${sidebarOpen ? "grid-cols-[1fr_360px] md:grid-cols-[1fr_420px]" : "grid-cols-[1fr_0px]"}`}
					>
						<div className="relative">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                                <div className="px-3 py-1 bg-black/70 text-white ring-2 ring-white/20 text-sm font-bold">
                                    Credits: {credits}
                                </div>
                                <Web3AuthConnectButton />
                            </div>
							<FlowMap
								graph={graph ?? undefined}
								onSelect={(a) => setSelected(a)}
							/>
							<button
								className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-10 bg-[#141532] text-white ring-1 ring-white/20 w-8 h-16 flex items-center justify-center"
								onClick={() => setSidebarOpen((s) => !s)}
								aria-label={sidebarOpen ? "Hide panel" : "Show panel"}
							>
								{sidebarOpen ? (
									<ChevronRight size={18} />
								) : (
									<ChevronLeft size={18} />
								)}
							</button>
						</div>
						<div className="relative">
							<Sidebar
								selectedAgent={
									selected
										? {
												id: selected.id,
												name: selected.name,
												score: Math.random() * 1,
											}
										: null
								}
								onCollapse={() => setSidebarOpen(false)}
								graph={graph}
								onGraphUpdate={(g) => setGraph(g)}
							/>
						</div>
					</div>
				</WagmiProvider>
			</QueryClientProvider>
			{/* // IMP START - Setup Web3Auth Provider */}
		</Web3AuthProvider>
	);
}
