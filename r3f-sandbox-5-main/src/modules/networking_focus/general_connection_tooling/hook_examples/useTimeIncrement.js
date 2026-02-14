// This is a working example of a hook that sends a payload and receives it on all clients through the message bus.
// On scene initialization, it connects itself to the message bus.
// On interval, it publishes and routes a message to itself across every connected client.

// hooks/useTimeIncrement.js
import { useEffect, useRef } from "react";
import { messageBus } from "../messageBus";

export function useTimeIncrement(group = "time") {
  const timeRef = useRef(Date.now());
  const frequency = 5 * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("publishing current time")
      const time = Date.now();
      messageBus.broadcast(group, "timeIncrement", { time });
    }, frequency);

    const unsubscribe = messageBus.subscribe(group, ({ payload }) => {
      timeRef.current = payload.time;
      console.log("received payload", JSON.stringify(payload))
      // console.log(`[${group}] time updated: ${payload.time}`);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [group]);

  return timeRef.current;
}
