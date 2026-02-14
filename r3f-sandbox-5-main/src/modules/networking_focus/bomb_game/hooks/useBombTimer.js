// hooks/useBombTimer.js
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { useSharedObjectsNetwork } from "./useSharedObjectsNetwork";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";

const INITIAL_TIMER = 6; // Seconds

/**
 * Hook to manage bomb timer logic including networking
 * Returns the current timer value and whether to show it
 * 
 * Timer synchronization: Only the host can start the timer to ensure all clients
 * use the same start time. When clients receive the start time, they calculate
 * an offset to account for network latency.
 */
export function useBombTimer(bombId, isCarried) {
  const peerId = usePeerStore((s) => s.peerId);
  const isHost = usePeerStore((s) => s.isHost);
  const { broadcastStartTimer, broadcastExplodeBomb } = useSharedObjectsNetwork();
  const object = useSharedObjectsStore((s) => s.objects[bombId]);
  const wasCarried = useRef(false);
  const localStartTime = useRef(null); // Local clock time when we received/started the timer
  const networkStartTime = useRef(null); // Network timestamp from the host
  const hasExploded = useRef(false); // Track if we've already triggered explosion

  // Handle timer start when bomb is picked up
  useFrame(() => {
    if (!object) return;

    // Sync to timer if it exists but we haven't synced yet
    // This handles the case where we receive the timer start message via network
    if (object.timerStartTime && localStartTime.current === null) {
      // Timer was started (by host) - sync our local clock to it
      localStartTime.current = performance.now();
      networkStartTime.current = object.timerStartTime;
    }

    // Start timer when picked up for the first time
    if (isCarried && !wasCarried.current) {
      // Just picked up - start timer if not already started
      if (!object.timerStartTime) {
        // Only host can start the timer to ensure synchronization
        if (isHost) {
          const startTime = performance.now();
          // Broadcast timer start to all clients
          broadcastStartTimer(bombId, startTime);
          // Update local store immediately
          localStartTime.current = startTime;
          networkStartTime.current = startTime;
          useSharedObjectsStore.getState().setObject(bombId, {
            ...object,
            timerStartTime: startTime,
          });
          useSharedObjectsStore.getState().setTimer(bombId, INITIAL_TIMER);
        }
      }
      wasCarried.current = true;
    } else if (!isCarried && wasCarried.current) {
      // Just dropped - but keep timer running
      wasCarried.current = false;
    }
    
    // Count down timer using synchronized start time
    if (object.timerStartTime && localStartTime.current !== null) {
      // Calculate elapsed time based on our local clock offset
      const localElapsed = (performance.now() - localStartTime.current) / 1000;
      const remaining = Math.max(0, INITIAL_TIMER - localElapsed);
      
      // Update store timer value (for display)
      useSharedObjectsStore.getState().setTimer(bombId, remaining);

      // Trigger explosion when timer reaches zero (only once, only by host)
      if (remaining <= 0 && !hasExploded.current && isHost) {
        hasExploded.current = true;
        broadcastExplodeBomb(bombId);
        useSharedObjectsStore.getState().setExploded(bombId, true);
      }
    }
  });

  // Get timer value from store
  const timerValue = object?.timer;
  const showTimer = timerValue !== null && timerValue !== undefined && timerValue > 0;
  const exploded = object?.exploded || false;

  return { timerValue, showTimer, exploded };
}

