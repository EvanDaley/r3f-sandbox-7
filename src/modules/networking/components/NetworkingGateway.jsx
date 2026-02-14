import { useEffect } from "react";
import { useNetworkingBootstrap } from "../hooks/useNetworkingBootstrap";
import NetworkSplashScreen from "./NetworkSplashScreen";
import { useNetworkingStore } from "../stores/useNetworkingStore";

export default function NetworkingGateway() {
  const { isLocalhost, bootstrapLocalhost, bootstrapHosted } = useNetworkingBootstrap();
  const hasCompletedHostedNameFlow = useNetworkingStore((state) => state.hasCompletedHostedNameFlow);
  const status = useNetworkingStore((state) => state.status);
  const peerId = useNetworkingStore((state) => state.peerId);
  const role = useNetworkingStore((state) => state.role);

  useEffect(() => {
    console.log("[network/gateway] mount", { isLocalhost });
    if (!isLocalhost) return;
    bootstrapLocalhost();
  }, [bootstrapLocalhost, isLocalhost]);

  useEffect(() => {
    console.log("[network/gateway] state", { status, peerId, role, hasCompletedHostedNameFlow });
  }, [status, peerId, role, hasCompletedHostedNameFlow]);

  if (!isLocalhost && !hasCompletedHostedNameFlow) {
    return <NetworkSplashScreen onSubmitName={bootstrapHosted} />;
  }

  return (
    <div style={hudStyle}>
      <strong>Network:</strong> {status}
      {peerId ? ` | ${role} | ${peerId}` : ""}
    </div>
  );
}

const hudStyle = {
  position: "fixed",
  top: 12,
  right: 12,
  zIndex: 50,
  padding: "8px 12px",
  borderRadius: 8,
  background: "rgba(0, 0, 0, 0.45)",
  color: "white",
  fontSize: 12,
};
