import create from "zustand"
import { createToonPalette } from "../utils/createToonPalette"

export const usePaletteStore = create((set, get) => {
    const palettes = {
        default: createToonPalette({
            p: "#ffffff",
            e: "#ffaaaa",
            s: "#ffaa33",
            t: "#009e9e",
            d: "#4e4848",

            // p: "#f8e3a1",
            // e: "#ff8822",
            // s: "#d27b41",
            // t: "#b4a47a",
            // d: "#4e4848",
        }),
        night: createToonPalette({
            p: "#d1d1d1",
            e: "#ff0055",
            s: "#4455ff",
            t: "#22cccc",
            d: "#4e4848",
        }),
        desert: createToonPalette({
            p: "#f8e3a1",
            e: "#ff8822",
            s: "#d27b41",
            t: "#b4a47a",
            d: "#4e4848",
        }),
        christmas: createToonPalette({
            p: "#555555",
            e: "#ff0000",
            s: "#228b22",
            t: "#ffd700",
            d: "#2d1810",
        }),
        winter: createToonPalette({
            p: "#f0f8ff",
            e: "#00bfff",
            s: "#4682b4",
            t: "#b0c4de",
            d: "#2f4f4f",
        }),
        candyCane: createToonPalette({
            p: "#ffffff",
            e: "#ff0000",
            s: "#ff6b6b",
            t: "#ffcccc",
            d: "#4e4848",
        }),
        festive: createToonPalette({
            p: "#fff8dc",
            e: "#ff4500",
            s: "#ffd700",
            t: "#daa520",
            d: "#3d2817",
        }),
    }

    const activeKey = "default"

    return {
        palettes,
        activeKey,
        activePalette: palettes[activeKey], // ✅ initialize here
        setPalette: (key) => {
            if (!palettes[key]) {
                console.warn(`No palette named '${key}'`)
                return
            }
            set({
                activeKey: key,
                activePalette: palettes[key],
            })
        },
    }
})
