import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface AIGameVisualizerProps {
  playerScores: number[];
  aiScores: number[];
}

function Bar({ position, height, color }: { position: [number, number, number], height: number, color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function BarChart({ playerScores, aiScores }: { playerScores: number[], aiScores: number[] }) {
  const group = useRef<THREE.Group>(null)

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.005
    }
  })

  const maxScore = Math.max(...playerScores, ...aiScores)

  return (
    <group ref={group}>
      {playerScores.map((score, index) => (
        <Bar 
          key={`player-${index}`} 
          position={[-2.5 + index * 0.6, (score / maxScore) * 2.5, 0]} 
          height={(score / maxScore) * 5} 
          color="blue" 
        />
      ))}
      {aiScores.map((score, index) => (
        <Bar 
          key={`ai-${index}`} 
          position={[-2.5 + index * 0.6, (score / maxScore) * 2.5, 0.6]} 
          height={(score / maxScore) * 5} 
          color="red" 
        />
      ))}
      <Text position={[0, 3, 0]} fontSize={0.5} color="white">
        Game Results: You vs AI
      </Text>
      <Text position={[-3, 0, 0]} fontSize={0.3} color="white" rotation={[0, Math.PI / 2, 0]}>
        Score
      </Text>
      <Text position={[0, -0.5, 1]} fontSize={0.3} color="white">
        Rounds
      </Text>
    </group>
  )
}

export default function AIGameVisualizer({ playerScores, aiScores }: AIGameVisualizerProps) {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BarChart playerScores={playerScores} aiScores={aiScores} />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  )
}