import React from "react";

export default function SimpleGroundPlane({
                                              color = "#777",
                                              size = [500, 500],
                                          }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}
