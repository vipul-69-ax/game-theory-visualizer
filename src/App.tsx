'use client'

import React from 'react';
import SimulationSelector from '@/components/simulation-selector';
import SimulationVisualizer from '@/components/simulation-visualizer';
import SimulationHistory from '@/components/simulation-history';
import { runSimulation, SimulationResult } from '@/lib/simulation-runner';
import { algorithms } from '@/lib/algorithms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Youtube } from 'lucide-react'

export default function App() {
  const [currentSimulation, setCurrentSimulation] = React.useState<SimulationResult | null>(null);

  const handleRunSimulation = (player1: string, player2: string, iterations: number) => {
    const result = runSimulation(algorithms[player1], algorithms[player2], iterations);
    setCurrentSimulation(result);

    // Save to local storage
    const savedSimulations = JSON.parse(localStorage.getItem('simulations') || '[]');
    savedSimulations.push({ player1, player2, iterations, result });
    localStorage.setItem('simulations', JSON.stringify(savedSimulations.slice(-5))); // Keep last 5 simulations
  };

  const handleLoadSimulation = (simulation: any) => {
    setCurrentSimulation(simulation.result);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Game Theory Simulation</h1>
      <SimulationSelector onRunSimulation={handleRunSimulation} />
      <SimulationVisualizer result={currentSimulation} />
      <SimulationHistory onLoadSimulation={handleLoadSimulation} />
      
      <Card className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white mt-4">
        <CardHeader>
          <CardTitle className="text-2xl">Inspired by Game Theory</CardTitle>
          <CardDescription className="text-gray-100">
            This project was inspired by an enlightening YouTube video on Game Theory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-lg">
            Watch the video that sparked this simulation
          </p>
          <Button 
            variant="secondary" 
            className="bg-white text-black hover:bg-gray-200 transition-colors"
            onClick={() => window.open('https://www.youtube.com/watch?v=mScpHTIi-kM', '_blank')}
          >
            <Youtube className="mr-2 h-4 w-4" />
            Watch Video
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}