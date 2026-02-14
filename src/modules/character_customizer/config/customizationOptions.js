export const customizationOptions = {
  baseModel: [
    {
      id: "personA",
      label: "Person A",
      body: { radiusTop: 0.44, radiusBottom: 0.5, height: 1.5 },
      head: { width: 0.76, height: 0.76, depth: 0.76, y: 1.33 },
      colors: { body: "#2563eb", head: "#f4c095" },
    },
    {
      id: "personB",
      label: "Person B",
      body: { radiusTop: 0.36, radiusBottom: 0.43, height: 1.66 },
      head: { width: 0.68, height: 0.86, depth: 0.7, y: 1.42 },
      colors: { body: "#7c3aed", head: "#e9b384" },
    },
    {
      id: "personC",
      label: "Person C",
      body: { radiusTop: 0.5, radiusBottom: 0.55, height: 1.38 },
      head: { width: 0.84, height: 0.72, depth: 0.78, y: 1.28 },
      colors: { body: "#0f766e", head: "#f1bf92" },
    },
  ],
  headwear: [
    {
      id: "hatA",
      label: "Hat A",
      type: "topHat",
      color: "#1f2937",
      brimScale: [1.15, 0.08, 1.15],
      crownScale: [0.74, 0.5, 0.74],
      yOffset: 0.5,
    },
    {
      id: "hatB",
      label: "Hat B",
      type: "beanie",
      color: "#be123c",
      scale: [1.05, 0.62, 1.05],
      yOffset: 0.37,
    },
    {
      id: "hatC",
      label: "Hat C",
      type: "headphones",
      color: "#111827",
      earScale: [0.23, 0.56, 0.18],
      bandScale: [1.1, 0.2, 0.2],
      yOffset: 0.15,
    },
  ],
  hairStyle: [
    {
      id: "hairA",
      label: "Hair A",
      type: "flatTop",
      color: "#4b2e1f",
      scale: [0.95, 0.34, 0.95],
      yOffset: 0.38,
    },
    {
      id: "hairB",
      label: "Hair B",
      type: "sideSweep",
      color: "#2f2f2f",
      scale: [0.96, 0.25, 0.82],
      yOffset: 0.28,
      xOffset: -0.08,
      zOffset: 0.08,
      rotation: [0.05, 0.24, -0.15],
    },
    {
      id: "hairC",
      label: "Hair C",
      type: "mohawk",
      color: "#3f2a1b",
      scale: [0.26, 0.44, 1.02],
      yOffset: 0.34,
    },
  ],
};

export const customizationCategories = [
  { id: "baseModel", label: "Base Model" },
  { id: "headwear", label: "Headwear" },
  { id: "hairStyle", label: "Hair Style" },
];
