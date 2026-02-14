import { create } from "zustand";

const log = (...args) => {
  console.log("[network/store]", ...args);
};

export const NETWORK_ROLE = {
  HOST: "host",
  CLIENT: "client",
};

export const useNetworkingStore = create((set) => ({
  peer: null,
  peerId: "",
  hostId: "",
  role: null,
  status: "idle",
  displayName: "",
  activeConnections: {},
  errors: [],
  hasCompletedHostedNameFlow: false,
  setPeer: (peer) => {
    log("setPeer", { peerId: peer?.id });
    set({ peer });
  },
  setIdentity: ({ peerId, hostId, role, displayName }) => {
    log("setIdentity", { peerId, hostId, role, displayName });
    set({ peerId, hostId, role, displayName });
  },
  setStatus: (status) => {
    log("setStatus", status);
    set({ status });
  },
  setHostedNameFlowComplete: (hasCompletedHostedNameFlow) => {
    log("setHostedNameFlowComplete", hasCompletedHostedNameFlow);
    set({ hasCompletedHostedNameFlow });
  },
  addConnection: (connection) =>
    set((state) => {
      log("addConnection", { peer: connection.peer });
      return {
        activeConnections: {
          ...state.activeConnections,
          [connection.peer]: connection,
        },
      };
    }),
  removeConnection: (peerId) =>
    set((state) => {
      log("removeConnection", { peerId });
      const nextConnections = { ...state.activeConnections };
      delete nextConnections[peerId];
      return { activeConnections: nextConnections };
    }),
  addError: (error) =>
    set((state) => {
      log("addError", error);
      return {
        errors: [...state.errors, error],
      };
    }),
}));
