"use client";

import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import React from "react";
import { Button } from "@/components/ui/button";

export default function Web3AuthConnectButton() {
  const { connect, isConnected, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { address } = useAccount();

  const shortAddress = React.useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled>
          {shortAddress || "Connected"}
        </Button>
        <Button onClick={() => disconnect()} disabled={disconnectLoading} variant="outline">
          {disconnectLoading ? "Disconnecting…" : "Logout"}
        </Button>
        {disconnectError ? (
          <span className="text-red-500 text-xs">{disconnectError.message}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => connect()} disabled={connectLoading}>
        {connectLoading ? "Connecting…" : "Connect Wallet"}
      </Button>
      {connectError ? <span className="text-red-500 text-xs">{connectError.message}</span> : null}
    </div>
  );
}


