import { useEffect } from "react";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { broadcastMessage } from "../../general_connection_tooling/broadcastMessage";
import { useChatStore } from "../stores/chatStore";

export function useChat(group = "chat") {
  const isHost = usePeerStore((s) => s.isHost);
 
  const peerId = usePeerStore((s) => s.peerId);
  const connections = usePeerStore((s) => s.connections);
  const playerName = usePeerStore((s) => s.playerName);
  const addMessage = useChatStore((s) => s.addMessage);
 useEffect(() => {
    if (!peerId) return; // don't run until we know our id

    // --- Subscribe to incoming chat messages
    const unsubscribe = messageBus.subscribe(group, ({ fromPeerId, payload }) => {
      const { text, sender, original_sender, senderName } = payload;
      if (!text) return;

      // Determine sender ID - use sender, original_sender (from broadcast), or fromPeerId (from routed peer message)
      const senderId = sender || original_sender || fromPeerId;
      if (!senderId) {
        console.warn("Received chat message with no sender ID:", payload);
        return;
      }

      // Skip if this is our own message that came back through routing (we already got it from local emit)
      if (senderId === peerId && fromPeerId) {
        return;
      }

      // Host rebroadcasts to everyone except original sender
      if (isHost && senderId !== peerId) {
        Object.values(connections).forEach(({ conn }) => {
          if (conn && conn.open && conn.peer !== senderId) {
            conn.send({
              scene: "bus",
              type: "chatMessage",
              payload: { group, sender: senderId, senderName, text },
            });
          }
        });
      }

      // Add message to local store
      addMessage({
        senderId,
        senderName: senderName || connections[senderId]?.name || `Player ${senderId.slice(0, 6)}`,
        text,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [peerId, isHost, group, connections, addMessage]);

  // Function to send a chat message
  const sendMessage = (text) => {
    if (!text.trim() || !peerId) return;

    const senderName = playerName || `Player ${peerId.slice(0, 6)}`;

    // Broadcast to host (who will rebroadcast to others)
    // messageBus.broadcast emits locally, which triggers our subscribe handler to add the message
    messageBus.broadcast(group, "chatMessage", {
      sender: peerId,
      senderName,
      text: text.trim(),
    });
  };

  return { sendMessage };
}
