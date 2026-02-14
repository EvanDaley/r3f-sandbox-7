import { generateLevel } from "../generateLevel.js"
import {perlinLikeAlgorithm, randomAlgorithm, smoothTerrainAlgorithm} from "../terrainAlgorithms.js"

generateLevel({
  size: 30,
  seed: 201,
  algorithm: perlinLikeAlgorithm,
  outputFile: "../data/level1.json",
})
