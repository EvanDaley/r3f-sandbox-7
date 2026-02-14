// components/OfficeImage.js
import React from "react";
import SpriteImage from "./SpriteImage";

const IMAGE_PATH = "/images/sprites/desk1.png";

export default function Desk(props) {
  return <SpriteImage imagePath={IMAGE_PATH} opacity={1} {...props} depthTest={true} depthWrite={true} />;
}
