// components/OfficeImage.js
import React from "react";
import SpriteImage from "./SpriteImage";

const IMAGE_PATH = "/images/inspo/0_2.png";

export default function OfficeImage(props) {
  return <SpriteImage imagePath={IMAGE_PATH} opacity={1.9} {...props} />;
}
