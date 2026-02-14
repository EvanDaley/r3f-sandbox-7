// chatStore.js
import create from 'zustand';
import { devtools } from 'zustand/middleware';

const storeName = `ChatStore-${Math.random().toString(36).substr(2, 5)}`;

export const useChatStore = create(devtools((set) => ({
  messages: [], // Array of { id, senderId, senderName, text, timestamp }

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now() + Math.random(), // Simple ID generation
      timestamp: Date.now(),
      ...message,
    }],
  })),

  clearMessages: () => set({ messages: [] }),
}), { name: storeName }));
