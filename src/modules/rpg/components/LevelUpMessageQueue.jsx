import { useEffect, useRef, useState } from 'react';
import useRpgProgressionStore from '../stores/useRpgProgressionStore';
import { RPG_SKILLS } from '../config/progressionConfig';

const MESSAGE_DURATION = 6000; // 6 seconds visible
const FADE_OUT_DURATION = 500; // 0.5 seconds fade

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '500px',
    minWidth: '400px',
  },
  message: {
    background: 'rgba(0, 0, 0, 0.75)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    transition: `opacity ${FADE_OUT_DURATION}ms ease-out, transform ${FADE_OUT_DURATION}ms ease-out`,
    transform: 'translateX(0)',
    opacity: 1,
  },
  messageFading: {
    opacity: 0,
    transform: 'translateX(-20px)',
  },
  skillName: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#ffffff',
    margin: '0 0 4px 0',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  },
  levelText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#fef08a',
    margin: 0,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
  },
};

export default function LevelUpMessageQueue() {
  const lastExperienceEvent = useRpgProgressionStore((state) => state.lastExperienceEvent);
  const [messages, setMessages] = useState([]);
  const lastShownEventId = useRef(null);
  const fadeTimers = useRef(new Map());
  const removeTimers = useRef(new Map());

  useEffect(() => {
    if (!lastExperienceEvent || lastExperienceEvent.levelsGained <= 0) {
      return;
    }

    // Don't show the same event twice
    if (lastExperienceEvent.id === lastShownEventId.current) {
      return;
    }

    const skill = RPG_SKILLS.find((s) => s.id === lastExperienceEvent.skillId);
    if (!skill) {
      return;
    }

    // Mark this event as shown
    lastShownEventId.current = lastExperienceEvent.id;

    // Create new message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newMessage = {
      id: messageId,
      skillName: skill.name,
      level: lastExperienceEvent.level,
      color: skill.color,
      createdAt: Date.now(),
      isFading: false,
    };

    // Add message to queue
    setMessages((prev) => [...prev, newMessage]);

    // Set timer to start fade out
    const fadeTimer = setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isFading: true } : msg))
      );
      fadeTimers.current.delete(messageId);
    }, MESSAGE_DURATION);

    // Set timer to remove message after fade
    const removeTimer = setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      removeTimers.current.delete(messageId);
    }, MESSAGE_DURATION + FADE_OUT_DURATION);

    fadeTimers.current.set(messageId, fadeTimer);
    removeTimers.current.set(messageId, removeTimer);
  }, [lastExperienceEvent]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      fadeTimers.current.forEach((timer) => clearTimeout(timer));
      removeTimers.current.forEach((timer) => clearTimeout(timer));
      fadeTimers.current.clear();
      removeTimers.current.clear();
    };
  }, []);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            ...styles.message,
            ...(message.isFading ? styles.messageFading : {}),
            borderColor: `${message.color}80`,
          }}
        >
          <div style={styles.skillName}>{message.skillName}</div>
          <div style={styles.levelText}>Level {message.level}</div>
        </div>
      ))}
    </div>
  );
}
