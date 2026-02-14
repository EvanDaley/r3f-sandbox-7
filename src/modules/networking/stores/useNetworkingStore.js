import { create } from "zustand";

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
  setPeer: (peer) => set({ peer }),
  setIdentity: ({ peerId, hostId, role, displayName }) => set({ peerId, hostId, role, displayName }),
  setStatus: (status) => set({ status }),
  setHostedNameFlowComplete: (hasCompletedHostedNameFlow) => set({ hasCompletedHostedNameFlow }),
  addConnection: (connection) =>
    set((state) => ({
      activeConnections: {
        ...state.activeConnections,
        [connection.peer]: connection,
      },
    })),
  removeConnection: (peerId) =>
    set((state) => {
      const nextConnections = { ...state.activeConnections };
      delete nextConnections[peerId];
      return { activeConnections: nextConnections };
    }),
  addError: (error) =>
    set((state) => ({
      errors: [...state.errors, error],
    })),
}));
