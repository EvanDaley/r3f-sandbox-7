import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export default function ScreamingText() {
 const { gl } = useThree()

  useEffect(() => {
    gl.clearColor(0, 0, 0, 1)  // optional, set clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }, [gl])

  return null;  
}

