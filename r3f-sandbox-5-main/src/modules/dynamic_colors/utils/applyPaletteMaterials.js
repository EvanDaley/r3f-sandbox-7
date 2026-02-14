export function applyPaletteMaterials(scene, materials) {
    if (!scene) throw new Error("applyPaletteMaterials: scene is required")
    if (!materials) throw new Error("applyPaletteMaterials: materials object is required")

    scene.traverse((child) => {
        if (!child.isMesh || !child.material) return
        const name = child.material.name?.toLowerCase()
        if (!name) return
        if (materials[name]) {
            child.material = materials[name]
        }
    })
}
