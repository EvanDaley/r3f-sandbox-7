import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { defaultTerrainAlgorithm } from "./terrainAlgorithms.js"

console.log("🔹 generateLevel.js loaded")

export function generateLevel({
                                size = 20,
                                seed = 0,
                                algorithm = defaultTerrainAlgorithm, // dependency injection
                                outputFile = "../data/level1.json",
                              } = {}) {
  console.log(`🚀 Generating level (size=${size}, seed=${seed}) using ${algorithm.name}...`)

  const data = algorithm({ size, seed })

  // Handle file structure separately
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const outputPath = path.resolve(__dirname, outputFile)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`✅ Generated ${outputPath} with ${data.length} tiles.`)

  return data
}

// Allow running directly via CLI
if (process.argv[1] && process.argv[1].endsWith("generateLevel.js")) {
  const size = Number(process.argv[2]) || 20
  const seed = Number(process.argv[3]) || Math.random() * 1000
  generateLevel({ size, seed })
}
