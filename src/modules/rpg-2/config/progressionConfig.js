export const RPG2_SKILLS = Object.freeze([
  { id: 'running', name: 'Running', group: 'movement', color: '#4cc9f0' },
  { id: 'woodcutting', name: 'Woodcutting', group: 'gathering', color: '#8d6e63' },
  { id: 'mining', name: 'Mining', group: 'gathering', color: '#90a4ae' },
  { id: 'crafting', name: 'Crafting', group: 'production', color: '#ffb703' },
  { id: 'combat', name: 'Combat', group: 'combat', color: '#ef476f' },
]);

export const RPG2_TRAINING_STATIONS = Object.freeze([
  { id: 'woodcuttingTree', skillId: 'woodcutting', name: 'Ancient Tree', xp: 22, position: [-5, 0.75, -2], color: '#8d6e63' },
  { id: 'miningRock', skillId: 'mining', name: 'Ore Vein', xp: 20, position: [4, 0.8, -4], color: '#90a4ae' },
  { id: 'craftingBench', skillId: 'crafting', name: 'Crafting Bench', xp: 24, position: [2, 0.7, 4], color: '#ffb703' },
  { id: 'combatDummy', skillId: 'combat', name: 'Training Dummy', xp: 18, position: [-4, 0.9, 3], color: '#ef476f' },
]);

export const RPG2_KEYBOARD_MAP = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'action1', keys: ['1'] },
  { name: 'action2', keys: ['2'] },
  { name: 'action3', keys: ['3'] },
  { name: 'action4', keys: ['KeyF'] },
];
