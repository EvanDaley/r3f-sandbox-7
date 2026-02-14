import create from 'zustand';

/**
 * Grid Scene Store
 * 
 * Manages the state of objects placed on a grid-based scene.
 * Objects are stored with their grid coordinates (gridX, gridZ) and can be serialized to JSON.
 */

// Grid cell size in world units (1 unit = 1 grid cell)
export const GRID_CELL_SIZE = 1;

/**
 * Convert grid coordinates to world position
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridZ - Grid Z coordinate
 * @returns {{x: number, y: number, z: number}} World position
 */
export function gridToWorld(gridX, gridZ) {
  return {
    x: gridX * GRID_CELL_SIZE,
    y: 0,
    z: gridZ * GRID_CELL_SIZE,
  };
}

/**
 * Convert world position to grid coordinates
 * @param {number} worldX - World X coordinate
 * @param {number} worldZ - World Z coordinate
 * @returns {{gridX: number, gridZ: number}} Grid coordinates
 */
export function worldToGrid(worldX, worldZ) {
  return {
    gridX: Math.round(worldX / GRID_CELL_SIZE),
    gridZ: Math.round(worldZ / GRID_CELL_SIZE),
  };
}

export const useGridSceneStore = create((set, get) => ({
  // Objects stored as: { id: { type, gridX, gridZ, rotation? } }
  objects: {},

  // Currently selected object type for placement ('desk' | 'wall' | null)
  selectedObjectType: null,

  // Delete mode - when true, clicking will delete objects instead of placing
  deleteMode: false,

  // Rotation mode - when true, clicking will rotate objects by 90 degrees
  rotationMode: false,

  // Preview rotation - rotation for the preview/ghost object (in radians)
  previewRotation: 0,

  // Overwrite mode - when true, placing on occupied squares replaces the existing object
  overwrite: true,

  // Selection system
  selectedObjectIds: [], // Array of selected object IDs
  selectionMode: false, // When true, selection tool is active
  moveMode: false, // When true, selected objects are being moved
  moveOffset: { gridX: 0, gridZ: 0 }, // Offset for moving selected objects

  // Copy/Paste system
  copiedObjects: null, // Array of { type, relativeX, relativeZ, rotation } objects to paste
  pasteMode: false, // When true, we're in paste mode and can place copied objects
  pasteAnchor: { gridX: 0, gridZ: 0 }, // Anchor point for pasting (where mouse is)
  previousSelectionMode: false, // Store selection mode state before entering paste mode

  // Undo/Redo system
  undoStack: [], // History of previous states (max 20)
  redoStack: [], // History of undone states
  MAX_HISTORY: 20,

  /**
   * Save current state to history
   */
  saveToHistory: () => {
    set((state) => {
      const historyEntry = JSON.parse(JSON.stringify(state.objects)); // Deep copy
      const newUndoStack = [...state.undoStack, historyEntry];
      
      // Limit to MAX_HISTORY entries
      const limitedStack = newUndoStack.slice(-state.MAX_HISTORY);
      
      return {
        undoStack: limitedStack,
        redoStack: [], // Clear redo stack when new action is performed
      };
    });
  },

  /**
   * Add an object to the grid (internal, doesn't save history)
   * @param {string} type - Object type ('desk' | 'wall')
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridZ - Grid Z coordinate
   * @param {number} rotation - Rotation in radians (default: 0)
   * @param {boolean} saveHistory - Whether to save to history (default: true)
   * @returns {string} The ID of the created object
   */
  _addObjectInternal: (type, gridX, gridZ, rotation = 0) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      objects: {
        ...state.objects,
        [id]: {
          type,
          gridX,
          gridZ,
          rotation,
        },
      },
    }));
    return id;
  },

  /**
   * Add an object to the grid
   * @param {string} type - Object type ('desk' | 'wall')
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridZ - Grid Z coordinate
   * @param {number} rotation - Rotation in radians (default: 0)
   * @returns {string} The ID of the created object
   */
  addObject: (type, gridX, gridZ, rotation = 0) => {
    const state = get();
    state.saveToHistory(); // Save state before change
    return state._addObjectInternal(type, gridX, gridZ, rotation);
  },

  /**
   * Remove an object from the grid (internal, doesn't save history)
   * @param {string} id - Object ID
   */
  _removeObjectInternal: (id) => {
    set((state) => {
      const next = { ...state.objects };
      delete next[id];
      return { objects: next };
    });
  },

  /**
   * Remove an object from the grid
   * @param {string} id - Object ID
   */
  removeObject: (id) => {
    const state = get();
    state.saveToHistory(); // Save state before change
    state._removeObjectInternal(id);
  },

  /**
   * Update an object's position
   * @param {string} id - Object ID
   * @param {number} gridX - New grid X coordinate
   * @param {number} gridZ - New grid Z coordinate
   */
  updateObjectPosition: (id, gridX, gridZ) => {
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      return {
        objects: {
          ...state.objects,
          [id]: {
            ...object,
            gridX,
            gridZ,
          },
        },
      };
    });
  },

  /**
   * Update an object's rotation
   * @param {string} id - Object ID
   * @param {number} rotation - Rotation in radians
   */
  updateObjectRotation: (id, rotation) => {
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      return {
        objects: {
          ...state.objects,
          [id]: {
            ...object,
            rotation,
          },
        },
      };
    });
  },

  /**
   * Set the selected object type for placement
   * @param {string|null} type - Object type ('desk' | 'wall' | null)
   */
  setSelectedObjectType: (type) => {
    set({ 
      selectedObjectType: type, 
      deleteMode: false, 
      rotationMode: false, 
      previewRotation: 0,
      selectionMode: false, // Disable selection mode when placing objects
    });
  },

  /**
   * Rotate the preview by 90 degrees (π/2 radians)
   */
  rotatePreview: () => {
    set((state) => ({
      previewRotation: (state.previewRotation + Math.PI / 2) % (Math.PI * 2),
    }));
  },

  /**
   * Toggle overwrite mode
   */
  setOverwrite: (enabled) => {
    set({ overwrite: enabled });
  },

  /**
   * Selection system methods
   */
  setSelectionMode: (enabled) => {
    set({ 
      selectionMode: enabled, 
      selectedObjectType: enabled ? null : undefined, // Clear placement tool when selecting
      deleteMode: false, // Disable delete mode when selection is enabled
      rotationMode: false, // Disable rotation mode when selection is enabled
    });
  },

  selectObject: (id) => {
    set((state) => {
      if (state.selectedObjectIds.includes(id)) {
        // Deselect if already selected
        return { selectedObjectIds: state.selectedObjectIds.filter((i) => i !== id) };
      } else {
        // Add to selection
        return { selectedObjectIds: [...state.selectedObjectIds, id] };
      }
    });
  },

  selectObjects: (ids) => {
    set({ selectedObjectIds: ids });
  },

  clearSelection: () => {
    set({ selectedObjectIds: [] });
  },

  setMoveMode: (enabled) => {
    set({ moveMode: enabled });
  },

  setMoveOffset: (gridX, gridZ) => {
    set({ moveOffset: { gridX, gridZ } });
  },

  applyMove: () => {
    set((state) => {
      if (state.selectedObjectIds.length === 0 || !state.moveMode) return state;

      // Save state before move
      const historyEntry = JSON.parse(JSON.stringify(state.objects));
      const newUndoStack = [...state.undoStack, historyEntry].slice(-state.MAX_HISTORY);

      const newObjects = { ...state.objects };
      const { gridX: offsetX, gridZ: offsetZ } = state.moveOffset;

      // Move all selected objects
      state.selectedObjectIds.forEach((id) => {
        const obj = newObjects[id];
        if (obj) {
          newObjects[id] = {
            ...obj,
            gridX: obj.gridX + offsetX,
            gridZ: obj.gridZ + offsetZ,
          };
        }
      });

      return {
        objects: newObjects,
        moveMode: false,
        moveOffset: { gridX: 0, gridZ: 0 },
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new action is performed
      };
    });
  },

  /**
   * Set delete mode
   * @param {boolean} enabled - Whether delete mode is enabled
   */
  setDeleteMode: (enabled) => {
    set({ 
      deleteMode: enabled, 
      selectedObjectType: null, 
      rotationMode: false,
      selectionMode: false, // Disable selection mode when delete is enabled
    });
  },

  /**
   * Set rotation mode
   * @param {boolean} enabled - Whether rotation mode is enabled
   */
  setRotationMode: (enabled) => {
    set({ 
      rotationMode: enabled, 
      selectedObjectType: null, 
      deleteMode: false,
      selectionMode: false, // Disable selection mode when rotation is enabled
    });
  },

  /**
   * Rotate an object by 90 degrees (π/2 radians)
   * @param {string} id - Object ID
   */
  rotateObject: (id) => {
    const state = get();
    state.saveToHistory(); // Save state before change
    
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      const newRotation = (object.rotation || 0) + Math.PI / 2;
      return {
        objects: {
          ...state.objects,
          [id]: {
            ...object,
            rotation: newRotation,
          },
        },
      };
    });
  },

  /**
   * Clear all objects
   */
  clearAll: () => {
    const state = get();
    state.saveToHistory(); // Save state before change
    
    set({ objects: {} });
  },

  /**
   * Undo the last action
   */
  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;

      // Save current state to redo stack
      const currentState = JSON.parse(JSON.stringify(state.objects));
      const newRedoStack = [...state.redoStack, currentState].slice(-state.MAX_HISTORY);

      // Restore previous state
      const previousState = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);

      return {
        objects: previousState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    });
  },

  /**
   * Redo the last undone action
   */
  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;

      // Save current state to undo stack
      const currentState = JSON.parse(JSON.stringify(state.objects));
      const newUndoStack = [...state.undoStack, currentState].slice(-state.MAX_HISTORY);

      // Restore next state from redo stack
      const nextState = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);

      return {
        objects: nextState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    });
  },

  /**
   * Serialize the scene to JSON
   * @returns {string} JSON string representation of the scene
   */
  serialize: () => {
    const state = get();
    return JSON.stringify({
      version: '1.0',
      objects: state.objects,
    }, null, 2);
  },

  /**
   * Deserialize and load a scene from JSON
   * @param {string} jsonString - JSON string representation of the scene
   */
  deserialize: (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.objects && typeof data.objects === 'object') {
        set({ objects: data.objects });
      } else {
        console.warn('Invalid scene format: missing objects');
      }
    } catch (error) {
      console.error('Failed to deserialize scene:', error);
    }
  },

  /**
   * Load scene from a data object (for programmatic loading)
   * @param {Object} data - Scene data object with objects property
   */
  loadScene: (data) => {
    if (data && data.objects && typeof data.objects === 'object') {
      set({ objects: data.objects });
    } else {
      console.warn('Invalid scene format: missing objects');
    }
  },

  /**
   * Copy selected objects for pasting
   * Stores objects with their relative positions from the first selected object
   */
  copySelectedObjects: () => {
    set((state) => {
      if (state.selectedObjectIds.length === 0) return state;

      const selectedObjects = state.selectedObjectIds
        .map((id) => ({ id, ...state.objects[id] }))
        .filter((obj) => obj.type); // Filter out invalid objects

      if (selectedObjects.length === 0) return state;

      // Use the first object as the anchor point
      const anchor = selectedObjects[0];
      const anchorX = anchor.gridX;
      const anchorZ = anchor.gridZ;

      // Calculate relative positions
      const copiedObjects = selectedObjects.map((obj) => ({
        type: obj.type,
        relativeX: obj.gridX - anchorX,
        relativeZ: obj.gridZ - anchorZ,
        rotation: obj.rotation || 0,
      }));

      return {
        copiedObjects,
        pasteMode: true,
        pasteAnchor: { gridX: anchorX, gridZ: anchorZ },
        previousSelectionMode: state.selectionMode, // Store current selection mode
        selectedObjectType: null, // Clear placement tool
        deleteMode: false,
        rotationMode: false,
        selectionMode: false, // Disable selection mode when entering paste mode
      };
    });
  },

  /**
   * Set paste mode
   * @param {boolean} enabled - Whether paste mode is enabled
   */
  setPasteMode: (enabled) => {
    set((state) => {
      if (!enabled) {
        // When disabling paste mode, restore previous selection mode if it was active
        return {
          pasteMode: false,
          copiedObjects: null,
          selectionMode: state.previousSelectionMode || false,
        };
      }
      return { pasteMode: enabled };
    });
  },

  /**
   * Update paste anchor position (where the mouse is)
   * @param {number} gridX - Grid X coordinate
   * @param {number} gridZ - Grid Z coordinate
   */
  setPasteAnchor: (gridX, gridZ) => {
    set({ pasteAnchor: { gridX, gridZ } });
  },

  /**
   * Paste copied objects at the current anchor position
   */
  pasteObjects: () => {
    set((state) => {
      if (!state.copiedObjects || state.copiedObjects.length === 0) return state;

      // Save history before pasting
      const historyEntry = JSON.parse(JSON.stringify(state.objects));
      const newUndoStack = [...state.undoStack, historyEntry].slice(-state.MAX_HISTORY);

      const newObjects = { ...state.objects };
      const { gridX: anchorX, gridZ: anchorZ } = state.pasteAnchor;

      // Place all copied objects maintaining their relative positions
      state.copiedObjects.forEach((copiedObj) => {
        const newGridX = anchorX + copiedObj.relativeX;
        const newGridZ = anchorZ + copiedObj.relativeZ;

        // If overwrite is enabled, remove existing objects at these positions
        if (state.overwrite) {
          Object.keys(newObjects).forEach((id) => {
            const obj = newObjects[id];
            if (obj.gridX === newGridX && obj.gridZ === newGridZ) {
              delete newObjects[id];
            }
          });
        } else {
          // Check if position is occupied
          const isOccupied = Object.values(newObjects).some(
            (obj) => obj.gridX === newGridX && obj.gridZ === newGridZ
          );
          if (isOccupied) {
            return; // Skip this object if position is occupied and overwrite is off
          }
        }

        // Create new object
        const id = `${copiedObj.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        newObjects[id] = {
          type: copiedObj.type,
          gridX: newGridX,
          gridZ: newGridZ,
          rotation: copiedObj.rotation,
        };
      });

      return {
        objects: newObjects,
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new action is performed
        pasteMode: false, // Exit paste mode after pasting
        copiedObjects: null,
        selectionMode: state.previousSelectionMode || false, // Restore selection mode after pasting
      };
    });
  },
}));

