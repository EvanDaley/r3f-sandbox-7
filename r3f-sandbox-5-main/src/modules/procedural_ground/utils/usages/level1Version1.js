import { generateLevel } from "../generateLevel.js"
import {perlinLikeAlgorithm, randomAlgorithm, smoothTerrainAlgorithm} from "../terrainAlgorithms.js"

generateLevel({
  size: 55,
  seed: 1,
  algorithm: perlinLikeAlgorithm,
  outputFile: "../data/level1.json",
})
