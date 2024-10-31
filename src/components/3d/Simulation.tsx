import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GameTheory3DProps {
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

  return (
    <group ref={group}>
      {playerScores.map((score, index) => (
        <Bar key={`player-${index}`} position={[-2 + index * 0.6, score / 2, 0]} height={score} color="blue" />
      ))}
      {aiScores.map((score, index) => (
        <Bar key={`ai-${index}`} position={[-2 + index * 0.6, score / 2, 0.6]} height={score} color="red" />
      ))}
      <Text position={[0, 6, 0]} fontSize={0.5} color="white">
        Game Theory Simulation Results
      </Text>
      <Text position={[-2.5, 0, 0]} fontSize={0.3} color="white" rotation={[0, Math.PI / 2, 0]}>
        Score
      </Text>
      <Text position={[0, -0.5, 1]} fontSize={0.3} color="white">
        Rounds
      </Text>
    </group>
  )
}

export default function GameTheory3D({ playerScores, aiScores }: GameTheory3DProps) {
  const [visualizationType, setVisualizationType] = useState<'bar' | 'line'>('bar')

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>3D Game Theory Visualization</CardTitle>
        <CardDescription>Explore your game results in 3D</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={visualizationType} onValueChange={(value: 'bar' | 'line') => setVisualizationType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select visualization type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Graph</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div style={{ height: '400px' }}>
          <Canvas camera={{ position: [0, 5, 10] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <BarChart playerScores={playerScores} aiScores={aiScores} />
            <OrbitControls />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  )
}