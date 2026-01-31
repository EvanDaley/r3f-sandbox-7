// Main entry point - re-export everything from the third person controller module
export { default } from "@/modules/third_person_controller/Ecctrl";
export { EcctrlAnimation } from "@/modules/third_person_controller/EcctrlAnimation";
export { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
export { useFollowCam } from "@/modules/third_person_controller/hooks/useFollowCam";
export { useGame } from "@/modules/third_person_controller/stores/useGame";
export { useJoystickControls } from "@/modules/third_person_controller/stores/useJoystickControls";

// Re-export types
export type {
  CustomEcctrlRigidBody,
  EcctrlProps,
  userDataType,
  camListenerTargetType,
} from "@/modules/third_person_controller/Ecctrl";
export type { EcctrlAnimationProps } from "@/modules/third_person_controller/EcctrlAnimation";
export type { EcctrlJoystickProps } from "@/modules/third_person_controller/EcctrlJoystick";
export type { UseFollowCamProps } from "@/modules/third_person_controller/hooks/useFollowCam";
