import { useEffect } from "react";
import { useNetworkingBootstrap } from "../hooks/useNetworkingBootstrap";
import NetworkSplashScreen from "./NetworkSplashScreen";
import { useNetworkingStore } from "../stores/useNetworkingStore";

export default function NetworkingGateway() {
  const { isLocalhost, bootstrapLocalhost, bootstrapHosted } = useNetworkingBootstrap();
  const { hasCompletedHostedNameFlow, status, peerId, role } = useNetworkingStore((state) => ({
    hasCompletedHostedNameFlow: state.hasCompletedHostedNameFlow,
    status: state.status,
    peerId: state.peerId,
    role: state.role,
  }));

  useEffect(() => {
    if (!isLocalhost) return;
    bootstrapLocalhost();
  }, [bootstrapLocalhost, isLocalhost]);

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
