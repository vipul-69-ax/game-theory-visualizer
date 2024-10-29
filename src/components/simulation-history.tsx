import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SimulationHistoryProps {
  onLoadSimulation: (result: any) => void;
}

export default function SimulationHistoryComponent({ onLoadSimulation }: SimulationHistoryProps) {
  const [savedSimulations, setSavedSimulations] = React.useState<any[]>([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('simulations') || '[]');
    setSavedSimulations(saved);
  }, []);

  const handleLoadSimulation = (simulation: any) => {
    onLoadSimulation(simulation);
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Simulation History</CardTitle>
        <CardDescription>Load previous simulation results</CardDescription>
      </CardHeader>
      <CardContent>
        {savedSimulations.length === 0 ? (
          <p>No saved simulations found.</p>
        ) : (
          <ul className="space-y-2">
            {savedSimulations.map((simulation, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>
                  {simulation.player1} vs {simulation.player2} ({simulation.iterations} iterations)
                </span>
                <Button onClick={() => handleLoadSimulation(simulation)}>Load</Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}