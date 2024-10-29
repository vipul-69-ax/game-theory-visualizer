import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SimulationResult } from '@/lib/simulation-runner';

interface SimulationVisualizerProps {
  result: SimulationResult | null;
}

export default function SimulationVisualizerComponent({ result }: SimulationVisualizerProps) {
  if (!result) return null;

  const chartData = result.player1Score.map((score, index) => ({
    iteration: index,
    player1: score,
    player2: result.player2Score[index],
  }));

  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
        <CardDescription>Visualizing the performance of two algorithms</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="h-[300px] sm:h-[400px] mb-4">
          <ChartContainer
            config={{
              player1: {
                label: "Player 1",
                color: "hsl(var(--chart-1))",
              },
              player2: {
                label: "Player 2",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="player1" stroke="var(--color-player1)" name="Player 1" />
                <Line type="monotone" dataKey="player2" stroke="var(--color-player2)" name="Player 2" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Player 1 Choices</h3>
            <div className="h-40 overflow-y-auto border rounded p-2">
              {result.player1Choices.map((choice, index) => (
                <span key={index} className={`inline-block m-1 p-1 rounded ${choice === 'cooperate' ? 'bg-green-200' : 'bg-red-200'}`}>
                  {choice === 'cooperate' ? 'C' : 'S'}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Player 2 Choices</h3>
            <div className="h-40 overflow-y-auto border rounded p-2">
              {result.player2Choices.map((choice, index) => (
                <span key={index} className={`inline-block m-1 p-1 rounded ${choice === 'cooperate' ? 'bg-green-200' : 'bg-red-200'}`}>
                  {choice === 'cooperate' ? 'C' : 'S'}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Final Scores:</h3>
          <p>Player 1: {result.player1Score[result.player1Score.length - 1]}</p>
          <p>Player 2: {result.player2Score[result.player2Score.length - 1]}</p>
        </div>
      </CardContent>
    </Card>
  );
}