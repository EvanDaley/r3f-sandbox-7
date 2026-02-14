import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../stores/chatStore";

export default function ChatPanel() {
  const [inputValue, setInputValue] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [userManuallyClosed, setUserManuallyClosed] = useState(false);
  const messages = useChatStore((s) => s.messages);
  const { sendMessage } = useChat();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const AUTO_EXPAND_THRESHOLD = 3; // Auto-expand for first 3 messages

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-expand for first few messages, but stop if user manually closes
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages.length <= AUTO_EXPAND_THRESHOLD &&
      isCollapsed &&
      !userManuallyClosed
    ) {
      setIsCollapsed(false);
    }
  }, [messages.length, isCollapsed, userManuallyClosed]);

  // Global Enter key handler - opens chat and focuses input
  useEffect(() => {
    const handleGlobalEnter = (e) => {
      // Don't interfere if user is typing in the input
      if (document.activeElement === inputRef.current) {
        return;
      }

      // Don't trigger if user is typing in another input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") {
        return;
      }

      // Only handle Enter (not Shift+Enter)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent any default behavior
        // Open chat if collapsed
        if (isCollapsed) {
          setIsCollapsed(false);
          setUserManuallyClosed(false); // Reset this so chat stays open
          // Focus input after a brief delay to allow DOM update
          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        } else {
          // Chat is already open, just focus the input
          inputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalEnter);
    return () => {
      window.removeEventListener("keydown", handleGlobalEnter);
    };
  }, [isCollapsed]);

  // Focus input when chat is opened (if not already focused)
  useEffect(() => {
    if (!isCollapsed && inputRef.current && document.activeElement !== inputRef.current) {
      // Small delay to ensure input is rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isCollapsed]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    // Only send if input is actually focused (prevent accidental sends)
    if (e.key === "Enter" && !e.shiftKey && document.activeElement === inputRef.current) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    // If user manually closes it, mark it so we don't auto-expand anymore
    if (newCollapsed) {
      setUserManuallyClosed(true);
    }
  };

  return (
    <>
      <style>
        {`
          .chat-messages-container::-webkit-scrollbar {
            width: 4px;
          }
          .chat-messages-container::-webkit-scrollbar-track {
            background: transparent;
          }
          .chat-messages-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          .chat-messages-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .chat-messages-container {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          }
        `}
      </style>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          width: isCollapsed ? "120px" : "240px",
          maxHeight: isCollapsed ? "auto" : "220px",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
          padding: isCollapsed ? "8px" : "10px",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          color: "#fff",
          zIndex: 1000,
          transition: "width 0.2s ease, max-height 0.2s ease",
        }}
      >
        {/* Collapsible Header */}
        <div
          onClick={handleToggleCollapse}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 0",
            cursor: "pointer",
            marginBottom: isCollapsed ? "0" : "8px",
            userSelect: "none",
          }}
        >
          <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)" }}>
            {isCollapsed ? "▶" : "▼"}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "500", color: "#fff" }}>
            Chat
          </span>
        </div>

        {!isCollapsed && (
          <>
            {/* Messages */}
            <div
              className="chat-messages-container"
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "8px",
                maxHeight: "140px",
                minHeight: "40px",
                direction: "rtl",
              }}
            >
              <div style={{ direction: "ltr" }}>
                {messages.length === 0 ? (
                  <div style={{ color: "#aaa", fontStyle: "italic", padding: "6px", fontSize: "11px" }}>
                    No messages yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: "4px",
                        padding: "4px 6px",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: "2px",
                          color: "#4a9eff",
                          fontSize: "11px",
                        }}
                      >
                        {msg.senderName}:
                      </div>
                      <div style={{ fontSize: "11px", wordWrap: "break-word" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ display: "flex", gap: "4px" }}>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type..."
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#fff",
                  fontSize: "11px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: "#4a9eff",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
