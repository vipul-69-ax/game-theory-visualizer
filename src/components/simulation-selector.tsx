import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { algorithms } from '@/lib/algorithms'

interface SimulationSelectorProps {
  onRunSimulation: (player1: string, player2: string, iterations: number) => void;
}

export default function SimulationSelector({ onRunSimulation }: SimulationSelectorProps) {
  const [player1, setPlayer1] = React.useState<string>("Random");
  const [player2, setPlayer2] = React.useState<string>("Random");
  const [iterations, setIterations] = React.useState<number>(200);

  const handleRunSimulation = () => {
    onRunSimulation(player1, player2, iterations);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Select onValueChange={setPlayer1} value={player1}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Player 1 Algorithm" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(algorithms).map((algo) => (
              <SelectItem key={algo} value={algo}>
                {algo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setPlayer2} value={player2}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Player 2 Algorithm" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(algorithms).map((algo) => (
              <SelectItem key={algo} value={algo}>
                {algo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="number"
        value={iterations}
        onChange={(e) => setIterations(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
        min={1}
        max={1000}
        placeholder="Number of iterations (max 1000)"
      />
      <Button onClick={handleRunSimulation}>Run Simulation</Button>
    </div>
  );
}