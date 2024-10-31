'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Handshake, Scissors, User, Trophy, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'

type Choice = 'cooperate' | 'steal' | null

interface Player {
  id: string
  name: string
  score: number
  choice: Choice
}

interface Room {
  players: Player[]
  round: number
  gameHistory: { [key: string]: Choice }[]
}

export default function MultiplayerGame() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameStatus, setGameStatus] = useState<'setup' | 'waiting' | 'playing' | 'roundEnd' | 'ended'>('setup')
  const [room, setRoom] = useState<Room | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [localChoice, setLocalChoice] = useState<Choice>(null)
  const [roundResult, setRoundResult] = useState<string>('')
  const [autoProgressTimer, setAutoProgressTimer] = useState<NodeJS.Timeout | null>(null)

  const totalRounds = 10

  useEffect(() => {
    const newSocket = io('https://game-theory-server.onrender.com')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('roomCreated', (createdRoomId: string) => {
      console.log('Room created:', createdRoomId)
      setRoomId(createdRoomId)
      setGameStatus('waiting')
    })

    newSocket.on('createRoomError', (errorMessage: string) => {
      console.error('Create room error:', errorMessage)
      setError(errorMessage)
    })

    newSocket.on('gameStart', (roomData: Room) => {
      console.log('Game started:', roomData)
      setRoom(roomData)
      setGameStatus('playing')
    })

    newSocket.on('roundEnd', (roomData: Room) => {
      console.log('Round ended:', roomData)
      setRoom(roomData)
      setGameStatus('roundEnd')
      const result = calculateRoundResult(roomData)
      setRoundResult(result)
      
      const timer = setTimeout(() => {
        if (roomData.round >= totalRounds) {
          setGameStatus('ended')
          celebrateWinner(roomData)
        } else {
          newSocket.emit('nextRound', roomId)
        }
      }, 5000) // Display result for 5 seconds before auto-progressing
      setAutoProgressTimer(timer)
    })

    newSocket.on('newRound', (roomData: Room) => {
      console.log('New round:', roomData)
      setRoom(roomData)
      setLocalChoice(null)
      setRoundResult('')
      setGameStatus('playing')
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer)
        setAutoProgressTimer(null)
      }
    })

    newSocket.on('playerLeft', (roomData: Room) => {
      console.log('Player left:', roomData)
      setRoom(roomData)
      setGameStatus('ended')
      setError('The other player has left the game.')
    })

    newSocket.on('joinError', (errorMessage: string) => {
      console.error('Join error:', errorMessage)
      setError(errorMessage)
    })

    return () => {
      newSocket.disconnect()
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer)
      }
    }
  }, [])

  const createRoom = () => {
    if (socket && playerName && roomId) {
      console.log('Creating room:', roomId)
      socket.emit('createRoom', { roomId, playerName })
    } else {
      setError('Please enter your name and a room ID')
    }
  }

  const joinRoom = () => {
    if (socket && playerName && roomId) {
      console.log('Joining room:', roomId)
      socket.emit('joinRoom', { roomId, playerName })
    } else {
      setError('Please enter your name and the room ID')
    }
  }

  const handleChoice = (choice: Choice) => {
    if (socket && room && !localChoice) {
      console.log('Making choice:', choice)
      socket.emit('makeChoice', { roomId, choice })
      setLocalChoice(choice)
    }
  }

  const calculateRoundResult = (roomData: Room) => {
    const [player1, player2] = roomData.players
    if (player1.choice === 'cooperate' && player2.choice === 'cooperate') {
      return 'Both players cooperated! Each gains 3 points.'
    } else if (player1.choice === 'steal' && player2.choice === 'steal') {
      return 'Both players attempted to steal! Each gains 1 point.'
    } else if (player1.choice === 'cooperate' && player2.choice === 'steal') {
      return `${player2.name} stole from ${player1.name}! ${player2.name} gains 5 points, ${player1.name} gains 0.`
    } else {
      return `${player1.name} stole from ${player2.name}! ${player1.name} gains 5 points, ${player2.name} gains 0.`
    }
  }

  const nextRound = () => {
    if (socket && room) {
      console.log('Moving to next round')
      socket.emit('nextRound', roomId)
      if (autoProgressTimer) {
        clearTimeout(autoProgressTimer)
        setAutoProgressTimer(null)
      }
    }
  }

  const resetGame = () => {
    setGameStatus('setup')
    setRoom(null)
    setRoomId('')
    setError('')
    setLocalChoice(null)
    setRoundResult('')
    if (autoProgressTimer) {
      clearTimeout(autoProgressTimer)
      setAutoProgressTimer(null)
    }
  }

  const celebrateWinner = (roomData: Room) => {
    const winner = roomData.players.reduce((prev, current) => (prev.score > current.score) ? prev : current)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl text-center">Prisoner's Dilemma: The Game</CardTitle>
        <CardDescription className="text-sm md:text-base text-center">Trust or Betray: What's Your Strategy?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isConnected && (
          <div className="text-center p-4 bg-red-100 dark:bg-red-900 rounded-md">
            <AlertTriangle className="mx-auto mb-2 text-red-500" />
            <p className="text-red-500">Not connected to server. Please check your connection.</p>
          </div>
        )}
        {gameStatus === 'setup' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <Label htmlFor="player-name" className="w-full md:w-20">Your Name:</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-grow"
              />
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <Label htmlFor="room-id" className="w-full md:w-20">Room ID:</Label>
              <Input
                id="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-grow"
              />
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <Button onClick={createRoom} className="w-full md:w-1/2" disabled={!isConnected}>Create Game</Button>
              <Button onClick={joinRoom} className="w-full md:w-1/2" disabled={!isConnected}>Join Game</Button>
            </div>
            {error && <p className="text-red-500 text-sm md:text-base">{error}</p>}
          </motion.div>
        )}

        {gameStatus === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <p className="text-lg md:text-xl">Waiting for another player to join...</p>
            <p className="text-sm md:text-base mt-2">Share this Room ID with your friend: <span className="font-bold">{roomId}</span></p>
          </motion.div>
        )}

        {(gameStatus === 'playing' || gameStatus === 'roundEnd' || gameStatus === 'ended') && room && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">Round: {room.round}/{totalRounds}</p>
                <Progress value={(room.round - 1) / totalRounds * 100} className="w-full md:w-[200px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.players.map(player => (
                <Card key={player.id} className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <User className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                      {player.name}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">Score: {player.score}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChoice('cooperate')}
                        disabled={gameStatus !== 'playing' || player.id !== socket?.id || localChoice !== null}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${
                          (localChoice === 'cooperate' || player.choice === 'cooperate')
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Handshake className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
                        <span className="sr-only">Cooperate</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChoice('steal')}
                        disabled={gameStatus !== 'playing' || player.id !== socket?.id || localChoice !== null}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${
                          (localChoice === 'steal' || player.choice === 'steal')
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Scissors className="w-6 h-6 md:w-8 md:h-8 mx-auto" />
                        <span className="sr-only">Steal</span>
                      </motion.button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {gameStatus === 'roundEnd' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-md"
              >
                <p className="text-lg text-black dark:text-white font-semibold">{roundResult}</p>
                <p className="mt-2 text-sm md:text-base text-black dark:text-white">Next round will start automatically in 5 seconds.</p>
                <Button onClick={nextRound} className="mt-4">Next Round</Button>
              </motion.div>
            )}

        

            {gameStatus === 'ended' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <Trophy className="mx-auto mb-4 text-yellow-500 w-16 h-16" />
                <p className="text-xl font-bold mb-4">
                  Game Over! 
                  {room.players[0].score > room.players[1].score 
                    ? `${room.players[0].name} wins!` 
                    : room.players[0].score < room.players[1].score 
                      ? `${room.players[1].name} wins!` 
                      : "It's a tie!"}
                </p>
                <Button onClick={resetGame}>Play Again</Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}