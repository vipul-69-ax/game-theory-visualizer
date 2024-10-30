import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SimulationResult } from '@/lib/simulation-runner';

interface AllAlgorithmsComparisonProps {
    results: SimulationResult[];
    player1: string;
    algorithmNames: string[];
  }
  
  export default function AllAlgorithmsComparison({ results, player1, algorithmNames }: AllAlgorithmsComparisonProps) {
    const colors = [
      "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", 
      "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))"
    ];
  
    const finalScores = results.map((result, index) => ({
      algorithm: algorithmNames[index],
      score: result.player2Score[result.player2Score.length - 1]
    }));
  
    const sortedScores = [...finalScores].sort((a, b) => b.score - a.score);
    const midPoint = Math.ceil(sortedScores.length / 2);
    const firstHalf = sortedScores.slice(0, midPoint);
    const secondHalf = sortedScores.slice(midPoint);
  
    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>{player1} vs All Algorithms</CardTitle>
          <CardDescription>Comparing performance against all other algorithms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Algorithms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={firstHalf.reduce((acc, item, index) => {
                      acc[item.algorithm] = {
                        label: item.algorithm,
                        color: colors[index % colors.length],
                      };
                      return acc;
                    }, {})}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={firstHalf} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="algorithm" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="score" fill="var(--color-chart-1)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Bottom Performing Algorithms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ChartContainer
                    config={secondHalf.reduce((acc, item, index) => {
                      acc[item.algorithm] = {
                        label: item.algorithm,
                        color: colors[(index + midPoint) % colors.length],
                      };
                      return acc;
                    }, {})}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={secondHalf} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="algorithm" type="category" width={100} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="score" fill="var(--color-chart-2)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
  
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedScores.map((algo, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{algo.algorithm}</TableCell>
                      <TableCell>{algo.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }