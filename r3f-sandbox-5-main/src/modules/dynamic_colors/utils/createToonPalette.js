import * as THREE from "three"

export function createToonPalette({ p, e, s, t, d }) {
    const texture = new THREE.TextureLoader().load(
      window.location.href + "/images/textures/simple1_rotated_64.png"
    )

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.flipY = false
    texture.needsUpdate = true

    return {
        p: new THREE.MeshStandardMaterial({ color: p }),
        e: new THREE.MeshStandardMaterial({
            color: e,
            emissive: e,
            emissiveIntensity: 13.9,
        }),
        s: new THREE.MeshStandardMaterial({ color: s }),
        t: new THREE.MeshStandardMaterial({ color: t }),
        d: new THREE.MeshStandardMaterial({ color: d }),

        p1: new THREE.MeshStandardMaterial({
            color: p,
            map: texture,
            // combine: THREE.MultiplyOperation,
        }),

        // Transparent material for distance-based transparency
        transparent: new THREE.MeshStandardMaterial({
            color: d,
            transparent: true,
            opacity: 0.1,
            depthWrite: false,
        }),

    }
}
