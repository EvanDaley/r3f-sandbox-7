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
  chatMessages: [],
  remoteMediaStreams: {},
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
  addChatMessage: (message) =>
    set((state) => {
      const nextMessages = [...state.chatMessages, message];
      return {
        chatMessages: nextMessages.slice(-200),
      };
    }),
  addRemoteMediaStream: ({ streamId, peerId, source, stream }) =>
    set((state) => ({
      remoteMediaStreams: {
        ...state.remoteMediaStreams,
        [streamId]: {
          streamId,
          peerId,
          source,
          stream,
        },
      },
    })),
  removeRemoteMediaStream: (streamId) =>
    set((state) => {
      const nextStreams = { ...state.remoteMediaStreams };
      delete nextStreams[streamId];
      return { remoteMediaStreams: nextStreams };
    }),
  removeRemoteMediaStreamsByPeer: (peerId) =>
    set((state) => {
      const nextStreams = { ...state.remoteMediaStreams };
      Object.keys(nextStreams).forEach((streamId) => {
        if (nextStreams[streamId]?.peerId === peerId) {
          delete nextStreams[streamId];
        }
      });
      return { remoteMediaStreams: nextStreams };
    }),
}));
