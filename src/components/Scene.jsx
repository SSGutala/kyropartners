import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import RoomScene from './RoomScene'

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ powerPreference: 'high-performance', antialias: true, alpha: false }}
      camera={{ position: [0, 1.8, 8], fov: 68, near: 0.1, far: 80 }}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0,
      }}
    >
      <color attach="background" args={['#020202']} />

      <Suspense fallback={null}>
        <RoomScene />
      </Suspense>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.4}
          luminanceSmoothing={0.75}
          intensity={1.1}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
