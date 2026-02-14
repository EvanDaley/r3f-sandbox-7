import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function useEnableShadows() {
  const { scene } = useThree()

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
      }
    })
  }, [scene])
}
