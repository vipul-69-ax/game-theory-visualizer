import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Handshake, Scissors } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

interface AIOpponentProps {
  onGameComplete: (playerScore: number, aiScore: number) => void;
}

type Choice = 'cooperate' | 'steal';

class AdvancedAI {
  private model: tf.LayersModel;
  private gameHistory: number[];

  constructor() {
    this.model = this.createModel();
    this.gameHistory = [];
    this.loadPretrainedWeights();
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [10] }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy' });
    return model;
  }

  public async loadPretrainedWeights() {
    // In a real scenario, you would load pre-trained weights from a file or API
    // For this example, we'll just use some mock weights
    const mockWeights = [
      tf.randomNormal([10, 16]),
      tf.randomNormal([16]),
      tf.randomNormal([16, 8]),
      tf.randomNormal([8]),
      tf.randomNormal([8, 1]),
      tf.randomNormal([1])
    ];
    await this.model.setWeights(mockWeights);
  }

  public async getAction(playerHistory: Choice[]): Promise<Choice> {
    const input = this.prepareInput(playerHistory);
    const prediction = await this.model.predict(input) as tf.Tensor;
    const [probability] = await prediction.data();
    prediction.dispose();
    input.dispose();

    // Biasing towards 'steal'
    return probability > 0.3 ? 'steal' : 'cooperate';
  }

  private prepareInput(playerHistory: Choice[]): tf.Tensor {
    const history = [...this.gameHistory];
    for (let i = 0; i < playerHistory.length; i++) {
      history.push(playerHistory[i] === 'cooperate' ? 0 : 1);
    }
    while (history.length < 10) {
      history.push(0);
    }
    return tf.tensor2d([history.slice(-10)]);
  }

  public updateHistory(playerChoice: Choice, aiChoice: Choice) {
    this.gameHistory.push(playerChoice === 'cooperate' ? 0 : 1);
    this.gameHistory.push(aiChoice === 'cooperate' ? 0 : 1);
    if (this.gameHistory.length > 20) {
      this.gameHistory = this.gameHistory.slice(-20);
    }
  }
}

const AIOpponent: React.FC<AIOpponentProps> = ({ onGameComplete }) => {
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameHistory, setGameHistory] = useState<{ player: Choice, ai: Choice }[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'ended'>('playing');
  const [aiThinking, setAiThinking] = useState(false);
  const aiRef = useRef<AdvancedAI | null>(null);

  const totalRounds = 10;

  useEffect(() => {
    const initAI = async () => {
      aiRef.current = new AdvancedAI();
      await aiRef.current.loadPretrainedWeights();
    };
    initAI();
  }, []);

  const calculateScore = (playerChoice: Choice, aiChoice: Choice): [number, number] => {
    if (playerChoice === 'cooperate' && aiChoice === 'cooperate') return [3, 3];
    if (playerChoice === 'cooperate' && aiChoice === 'steal') return [0, 5];
    if (playerChoice === 'steal' && aiChoice === 'cooperate') return [5, 0];
    return [1, 1];
  };

  const handlePlayerChoice = async (playerChoice: Choice) => {
    if (gameStatus === 'ended' || !aiRef.current) return;

    setAiThinking(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI thinking

    const aiChoice = await aiRef.current.getAction(gameHistory.map(h => h.player));
    setAiThinking(false);

    const [playerPoints, aiPoints] = calculateScore(playerChoice, aiChoice);
    setPlayerScore(prev => prev + playerPoints);
    setAIScore(prev => prev + aiPoints);
    setGameHistory(prev => [...prev, { player: playerChoice, ai: aiChoice }]);
    setRound(prev => prev + 1);

    aiRef.current.updateHistory(playerChoice, aiChoice);

    if (round >= totalRounds) {
      setGameStatus('ended');
      onGameComplete(playerScore + playerPoints, aiScore + aiPoints);
    }
  };

  const resetGame = () => {
    setPlayerScore(0);
    setAIScore(0);
    setRound(1);
    setGameHistory([]);
    setGameStatus('playing');
    if (aiRef.current) {
      aiRef.current = new AdvancedAI();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Play Against Advanced AI</CardTitle>
        <CardDescription>Challenge our sophisticated AI that adapts to your strategy!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold">Round: {round}/{totalRounds}</p>
              <Progress value={(round - 1) / totalRounds * 100} className="w-[200px]" />
            </div>
            <div className="text-right">
              <p className="text-md font-semibold">Your Score: {playerScore}</p>
              <p className="text-md font-semibold">AI Score: {aiScore}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => handlePlayerChoice('cooperate')}
              disabled={gameStatus === 'ended' || aiThinking}
              className="w-32 h-32 rounded-full"
            >
              <Handshake className="w-16 h-16" />
              <span className="sr-only">Cooperate</span>
            </Button>
            <Button
              onClick={() => handlePlayerChoice('steal')}
              disabled={gameStatus === 'ended' || aiThinking}
              className="w-32 h-32 rounded-full"
            >
              <Scissors className="w-16 h-16" />
              <span className="sr-only">Steal</span>
            </Button>
          </div>

          <AnimatePresence>
            {aiThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-lg font-semibold"
              >
                AI is thinking...
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Game History:</h3>
            <div className="space-y-1">
              {gameHistory.map((round, index) => (
                <div key={index} className="flex justify-between items-center">
                  <Badge variant={round.player === 'cooperate' ? 'default' : 'destructive'}>
                    You: {round.player}
                  </Badge>
                  <Badge variant={round.ai === 'cooperate' ? 'default' : 'destructive'}>
                    AI: {round.ai}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {gameStatus === 'ended' && (
            <div className="text-center">
              <p className="text-xl font-bold mb-4">
                Game Over! {playerScore > aiScore ? 'You win!' : playerScore < aiScore ? 'AI wins!' : 'It\'s a tie!'}
              </p>
              <Button onClick={resetGame}>Play Again</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOpponent;