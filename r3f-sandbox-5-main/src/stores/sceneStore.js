import create from 'zustand'
import PaletteSandbox from "../modules/dynamic_colors/PaletteSandbox"
import PaletteSandboxOverlay from "../modules/dynamic_colors/PaletteSandboxOverlay"
import ProceduralGroundOverlay from "../modules/procedural_ground/ProceduralGroundOverlay"
import ProceduralGround from "../modules/procedural_ground/ProceduralGround"
import AbilitiesSandbox1 from "../modules/abilities_sandbox_1/AbilitiesSandbox1";
import AbilitiesSandboxOverlay from "../modules/abilities_sandbox_1/AbilitiesSandboxOverlay";
import ConnectPage from "../modules/networking_focus/connect_page/ConnectPage";
import ConnectPageOverlay from "../modules/networking_focus/connect_page/ConnectPageOverlay";
import LandingArea from "../modules/simple_playable_areas/LandingArea";
import MovementSandbox1 from "../modules/networking_focus/movement_sandbox_1/MovementSandbox1";
import MovementSandboxOverlay from "../modules/networking_focus/movement_sandbox_1/MovementSandboxOverlay";
import MovementSandbox2 from "../modules/networking_focus/movement_sandbox_2/MovementSandbox2";
import MovementSandbox2Overlay from "../modules/networking_focus/movement_sandbox_2/MovementSandbox2Overlay";
import MovementSandbox3 from "../modules/networking_focus/movement_sandbox_3/MovementSandbox3";
import MovementSandbox3Overlay from "../modules/networking_focus/movement_sandbox_3/MovementSandbox3Overlay";
import MovementSandbox4 from "../modules/networking_focus/movement_sandbox_4/MovementSandbox4";
import MovementSandbox4Overlay from "../modules/networking_focus/movement_sandbox_4/MovementSandbox4Overlay";
import ChatV1 from "../modules/networking_focus/chatV1/ChatV1";
import ChatV1Overlay from "../modules/networking_focus/chatV1/ChatV1Overlay";
import OfficePrototype from "../modules/simple_playable_areas/OfficePrototype";
import OfficePrototype2 from "../modules/simple_playable_areas/OfficePrototype2";
import ActivitySandbox from "../modules/networking_focus/activity_sandbox/ActivitySandbox";
import ActivitySandboxOverlay from "../modules/networking_focus/activity_sandbox/ActivitySandboxOverlay";
import GravitySandbox from "../modules/networking_focus/gravity_sandbox/GravitySandbox";
import GravitySandboxOverlay from "../modules/networking_focus/gravity_sandbox/GravitySandboxOverlay";
import BombGame from "../modules/networking_focus/bomb_game/BombGame";
import BombGameOverlay from "../modules/networking_focus/bomb_game/BombGameOverlay";
import ScreamingText from "../modules/screaming_text/ScreamingText";
import ScreamingTextOverlay from "../modules/screaming_text/ScreamingTextOverlay";
import BombGameText from "../modules/bomb_game_text/BombGameText";
import BombGameTextOverlay from "../modules/bomb_game_text/BombGameTextOverlay";
import Forest1 from "../modules/artistic_focus/forest1/Forest1";
import Forest1Overlay from "../modules/artistic_focus/forest1/Forest1Overlay";
import Minimal1 from "../modules/artistic_focus/minimal1/Minimal1";
import Minimal1Overlay from "../modules/artistic_focus/minimal1/Minimal1Overlay";
import AtlantisText from "../modules/artistic_focus/minimal1/AtlantisText";
import AtlantisTextOverlay from "../modules/artistic_focus/minimal1/AtlantisTextOverlay";
import ItemConfigurator1 from "../modules/item_configurator_1/ItemConfigurator1";
import ItemConfigurator1Overlay from "../modules/item_configurator_1/ItemConfigurator1Overlay";
import BullpupConfigurator1 from "../modules/bullpup_configurator_1/BullpupConfigurator1";
import BullpupConfigurator1Overlay from "../modules/bullpup_configurator_1/BullpupConfigurator1Overlay";
import GridScene from "../modules/modular_focus/grid_scene/GridScene";
import GridSceneOverlay from "../modules/modular_focus/grid_scene/GridSceneOverlay";


const scenes = [
  { id: 'connectPage', name: 'Join Game', scene: ConnectPage, overlay: ConnectPageOverlay },
  { id: 'landingArea', name: 'Landing Area', scene: LandingArea },
  { id: 'tileLevel1', name: 'Palette Sandbox', scene: PaletteSandbox, overlay: PaletteSandboxOverlay },
  { id: 'proceduralGround', name: 'Procedural Ground Sandbox', scene: ProceduralGround, overlay: ProceduralGroundOverlay },
  { id: 'abilitiesSandbox1', name: 'Abilities Sandbox', scene: AbilitiesSandbox1, overlay: AbilitiesSandboxOverlay },
  { id: 'movementSandbox1', name: 'Movement Sandbox 1', scene: MovementSandbox1, overlay: MovementSandboxOverlay },
  { id: 'movementSandbox2', name: 'Movement Sandbox 2', scene: MovementSandbox2, overlay: MovementSandbox2Overlay },
  { id: 'movementSandbox3', name: 'Movement Sandbox 3', scene: MovementSandbox3, overlay: MovementSandbox3Overlay },
  { id: 'movementSandbox4', name: 'Movement Sandbox 4', scene: MovementSandbox4, overlay: MovementSandbox4Overlay },
  { id: 'chatV1', name: 'Chat V1', scene: ChatV1, overlay: ChatV1Overlay },
  { id: 'OfficePrototype', name: 'OfficePrototype', scene: OfficePrototype, overlay: MovementSandbox2Overlay },
  { id: 'OfficePrototype2', name: 'OfficePrototype2', scene: OfficePrototype2, overlay: PaletteSandboxOverlay },
  { id: 'activitySandbox', name: 'Activity Sandbox', scene: ActivitySandbox, overlay: ActivitySandboxOverlay },
  { id: 'gravitySandbox', name: 'Gravity Sandbox', scene: GravitySandbox, overlay: GravitySandboxOverlay },
  { id: 'bombGame', name: 'Bomb Game', scene: BombGame, overlay: BombGameOverlay },
  { id: 'screamingText', name: 'Screaming Text', scene: null, overlay: ScreamingTextOverlay },
  { id: 'bombGameText', name: 'Bomb Game Text', scene: null, overlay: BombGameTextOverlay },
  { id: 'forest1', name: 'Forest 1', scene: Forest1, overlay: Forest1Overlay },
  { id: 'minimal1', name: 'Minimal 1', scene: Minimal1, overlay: Minimal1Overlay },
  { id: 'atlantisText', name: 'Atlantis Text', scene: AtlantisText, overlay: AtlantisTextOverlay },
  { id: 'itemConfigurator1', name: 'Item Configurator 1', scene: ItemConfigurator1, overlay: ItemConfigurator1Overlay },
  { id: 'bullpupConfigurator1', name: 'Bullpup Configurator 1', scene: BullpupConfigurator1, overlay: BullpupConfigurator1Overlay },
  { id: 'gridScene', name: 'Grid Scene', scene: GridScene, overlay: GridSceneOverlay },
]

let defaultScene = 'bullpupConfigurator1'

// On the prod version, always default to connectPage. When testing locally,
if (window.location.hostname !== 'localhost') {
  defaultScene = 'connectPage';
}

const useSceneStore = create((set) => ({
  currentSceneId: defaultScene,
  scenes,
  setSceneId: (id) => set({ currentSceneId: id }),
}))

export default useSceneStore
