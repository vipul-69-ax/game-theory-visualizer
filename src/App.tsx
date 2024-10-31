"use client"

import { useState, useRef } from "react"
import "jspdf-autotable"
import {
  Youtube,
  BookOpen,
  BarChart2,
  History,
  Menu,
  Cpu,
  Box,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import SimulationSelector from "@/components/simulation-selector"
import SimulationVisualizer from "@/components/simulation-visualizer"
import SimulationHistory from "@/components/simulation-history"
import AllAlgorithmsComparison from "@/components/all-algorithms-comparison"
import AIOpponent from "@/components/ai/Opponent"
import { runSimulation, SimulationResult } from "@/lib/simulation-runner"
import { algorithms } from "@/lib/algorithms"
import { ModeToggle } from "./components/mode-toggle"
import Joyride, { Step } from "react-joyride"
import { useTheme } from "./components/ui/theme-provider"
import MultiplayerGame from "./components/multiplayer"

export default function Component() {
  const [currentSimulation, setCurrentSimulation] =
    useState<SimulationResult | null>(null)
  const [allSimulations, setAllSimulations] = useState<{
    player1: string
    results: SimulationResult[]
    algorithmNames: string[]
  } | null>(null)
  const [activeSection, setActiveSection] = useState<string>("selector")
  const [runTutorial, setRunTutorial] = useState(false)
  const [tutorialSeen, setTutorialSeen] = useState(false)
  const { theme } = useTheme()
  const [aiGameResults, setAIGameResults] = useState<{
    playerScores: number[]
    aiScores: number[]
  }>({ playerScores: [], aiScores: [] })

  const steps: Step[] = [
    {
      target: "#selector",
      content:
        "Welcome to the Game Theory Simulator! Start by selecting your algorithms here.",
      disableBeacon: true,
    },
    {
      target: "#visualizer",
      content:
        "Your simulation results will appear here. You can analyze the performance of different strategies.",
    },
    {
      target: "#ai-opponent",
      content:
        "Challenge our AI opponent and test your strategy against a learning algorithm.",
    },
    {
      target: "#history",
      content: "View and load your previous simulations from this section.",
    },
  ]

  const handleRunSimulation = (
    player1: string,
    player2: string,
    iterations: number
  ) => {
    const result = runSimulation(
      algorithms[player1],
      algorithms[player2],
      iterations
    )
    setCurrentSimulation(result)
    setAllSimulations(null)
    setActiveSection("visualizer")

    // Save to local storage
    const savedSimulations = JSON.parse(
      localStorage.getItem("simulations") || "[]"
    )
    savedSimulations.push({ player1, player2, iterations, result })
    localStorage.setItem(
      "simulations",
      JSON.stringify(savedSimulations.slice(-5))
    ) // Keep last 5 simulations
  }

  const handleRunAgainstAll = (player1: string, iterations: number) => {
    const results: SimulationResult[] = []
    const algorithmNames: string[] = []
    Object.keys(algorithms).forEach((player2) => {
      if (player1 !== player2) {
        const result = runSimulation(
          algorithms[player1],
          algorithms[player2],
          iterations
        )
        results.push(result)
        algorithmNames.push(player2)
      }
    })
    setAllSimulations({ player1, results, algorithmNames })
    setCurrentSimulation(null)
    setActiveSection("visualizer")

    // Save to local storage
    const savedSimulations = JSON.parse(
      localStorage.getItem("simulations") || "[]"
    )
    savedSimulations.push({
      player1,
      player2: "All",
      iterations,
      results,
      algorithmNames,
    })
    localStorage.setItem(
      "simulations",
      JSON.stringify(savedSimulations.slice(-5))
    ) // Keep last 5 simulations
  }

  const handleLoadSimulation = (simulation: any) => {
    if (Array.isArray(simulation.result)) {
      setAllSimulations({
        player1: simulation.player1,
        results: simulation.result,
        algorithmNames:
          simulation.algorithmNames ||
          simulation.result.map((_: any, i: number) => `Algorithm ${i + 1}`),
      })
      setCurrentSimulation(null)
    } else {
      setCurrentSimulation(simulation.result)
      setAllSimulations(null)
    }
    setActiveSection("visualizer")
  }

  const scrollToSection = (section: string) => {
    setActiveSection(section)
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleAIGameComplete = (playerScore: number, aiScore: number) => {
    setAIGameResults((prev) => ({
      playerScores: [...prev.playerScores, playerScore],
      aiScores: [...prev.aiScores, aiScore],
    }))
  }

  const NavItems = () => (
    <>
      <Button
        variant="ghost"
        onClick={() => scrollToSection("selector")}
        className={activeSection === "selector" ? "bg-accent" : ""}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">Simulate</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => scrollToSection("visualizer")}
        className={activeSection === "visualizer" ? "bg-accent" : ""}
      >
        <BarChart2 className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">Results</span>
      </Button>
      <Button
        variant="ghost"
        onClick={() => scrollToSection("ai-opponent")}
        className={activeSection === "ai-opponent" ? "bg-accent" : ""}
      >
        <Cpu className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">AI Opponent</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => scrollToSection("history")}
        className={activeSection === "history" ? "bg-accent" : ""}
      >
        <History className="mr-2 h-4 w-4" />
        <span className="hidden md:inline">History</span>
      </Button>
    </>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Joyride
        steps={steps}
        run={runTutorial}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            primaryColor: `${theme !== "dark" ? "black" : "white"}`,
            backgroundColor: `white`,
          },
        }}
      />
      <header className="bg-card shadow-md py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-3xl font-bold">
            Game Theory Simulator
          </h1>
          <nav className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex space-x-2">
              <NavItems />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>
                    Choose a section to navigate to
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-8">
        <section id="selector">
          <Card>
            <CardHeader>
              <CardTitle>Set Up Your Simulation</CardTitle>
              <CardDescription>
                Choose your algorithms and run the simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationSelector
                onRunSimulation={handleRunSimulation}
                onRunAgainstAll={handleRunAgainstAll}
              />
            </CardContent>
          </Card>
        </section>

        <section id="visualizer">
          <AnimatePresence mode="wait">
            {currentSimulation && (
              <motion.div
                key="single-simulation"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <SimulationVisualizer result={currentSimulation} />
              </motion.div>
            )}
            {allSimulations && (
              <motion.div
                key="all-simulations"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <AllAlgorithmsComparison
                  results={allSimulations.results}
                  player1={allSimulations.player1}
                  algorithmNames={allSimulations.algorithmNames}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section id="history">
          <SimulationHistory onLoadSimulation={handleLoadSimulation} />
        </section>
        <section id="ai-opponent">
          <AIOpponent onGameComplete={handleAIGameComplete} />
        </section>
        <section id="multiplayer">
          <MultiplayerGame />
        </section>

       
      </main>

      <footer className="bg-card shadow-md py-4 mt-8">
        <div className="container mx-auto px-4 space-y-4">
          <Card className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Inspired by Game Theory
              </CardTitle>
              <CardDescription className="text-gray-100">
                This project was inspired by an enlightening YouTube video on
                Game Theory
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-base md:text-lg text-center md:text-left">
                Watch the video that sparked this simulation
              </p>
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-gray-200 transition-colors w-full md:w-auto"
                onClick={() =>
                  window.open(
                    "https://www.youtube.com/watch?v=mScpHTIi-kM",
                    "_blank"
                  )
                }
              >
                <Youtube className="mr-2 h-4 w-4" />
                Watch Video
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                About the Developer
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  window.open("https://twitter.com/VIPULSHARM91651", "_blank")
                }
                aria-label="Developer's X (Twitter) profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  window.open(
                    "https://linkedin.com/in/vipulsharma2004",
                    "_blank"
                  )
                }
                aria-label="Developer's LinkedIn profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  window.open("https://github.com/vipul-69-ax", "_blank")
                }
                aria-label="Developer's GitHub profile"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Button>
            </CardContent>
          </Card>
        </div>
      </footer>
    </div>
  )
}