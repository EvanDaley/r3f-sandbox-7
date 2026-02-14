import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_RPG_BINDINGS,
  createInputSnapshot,
  mergeBindings,
} from "./bindings";

const eventButtonToCode = (button) => `Mouse${button}`;

const isBindingPressed = (binding, snapshot) => {
  if (binding.type === "keyboard") {
    return snapshot.keyboard.has(binding.code);
  }

  if (binding.type === "mouse") {
    return snapshot.mouse.has(eventButtonToCode(binding.button));
  }

  return false;
};

export default function useRpgInputState(bindingOverrides) {
  const bindings = useMemo(
    () => mergeBindings(DEFAULT_RPG_BINDINGS, bindingOverrides),
    [bindingOverrides]
  );

  const [snapshot, setSnapshot] = useState(() => createInputSnapshot());

  useEffect(() => {
    const onKeyDown = (event) => {
      setSnapshot((state) => {
        if (state.keyboard.has(event.code)) {
          return state;
        }
        const keyboard = new Set(state.keyboard);
        keyboard.add(event.code);
        return { ...state, keyboard };
      });
    };

    const onKeyUp = (event) => {
      setSnapshot((state) => {
        if (!state.keyboard.has(event.code)) {
          return state;
        }
        const keyboard = new Set(state.keyboard);
        keyboard.delete(event.code);
        return { ...state, keyboard };
      });
    };

    const onMouseDown = (event) => {
      setSnapshot((state) => {
        const code = eventButtonToCode(event.button);
        if (state.mouse.has(code)) {
          return state;
        }
        const mouse = new Set(state.mouse);
        mouse.add(code);
        return { ...state, mouse };
      });
    };

    const onMouseUp = (event) => {
      setSnapshot((state) => {
        const code = eventButtonToCode(event.button);
        if (!state.mouse.has(code)) {
          return state;
        }
        const mouse = new Set(state.mouse);
        mouse.delete(code);
        return { ...state, mouse };
      });
    };

    const onBlur = () => setSnapshot(createInputSnapshot());

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return useMemo(() => {
    const isPressed = (action) => {
      const actionBindings = bindings[action] ?? [];
      return actionBindings.some((binding) => isBindingPressed(binding, snapshot));
    };

    const moveAxis = {
      x: Number(isPressed("moveRight")) - Number(isPressed("moveLeft")),
      z: Number(isPressed("moveBackward")) - Number(isPressed("moveForward")),
    };

    return {
      bindings,
      isPressed,
      moveAxis,
    };
  }, [bindings, snapshot]);
}
