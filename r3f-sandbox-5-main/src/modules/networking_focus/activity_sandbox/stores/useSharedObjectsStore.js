// stores/useSharedObjectsStore.js
import create from "zustand";

export const useSharedObjectsStore = create((set, get) => ({
  objects: {}, // { objectId: { position: {x, y, z}, heldBy: [playerId1, playerId2], type: 'box' } }

  setObjectPosition: (objectId, position) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [objectId]: {
          ...state.objects[objectId],
          position: { ...position },
        },
      },
    })),

  addHolder: (objectId, playerId) =>
    set((state) => {
      const object = state.objects[objectId];
      if (!object) return state;
      
      // Don't add if already holding
      if (object.heldBy?.includes(playerId)) return state;
      
      // Don't add if already at max capacity (2 for boxes)
      const maxHolders = object.type === 'box' ? 2 : 1;
      if (object.heldBy?.length >= maxHolders) return state;

      return {
        objects: {
          ...state.objects,
          [objectId]: {
            ...object,
            heldBy: [...(object.heldBy || []), playerId],
          },
        },
      };
    }),

  removeHolder: (objectId, playerId) =>
    set((state) => {
      const object = state.objects[objectId];
      if (!object) return state;

      return {
        objects: {
          ...state.objects,
          [objectId]: {
            ...object,
            heldBy: (object.heldBy || []).filter((id) => id !== playerId),
          },
        },
      };
    }),

  setObject: (objectId, objectData) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [objectId]: { ...objectData },
      },
    })),

  removeObject: (objectId) =>
    set((state) => {
      const next = { ...state.objects };
      delete next[objectId];
      return { objects: next };
    }),

  resetObjects: () => set({ objects: {} }),
}));

