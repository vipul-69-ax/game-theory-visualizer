"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface PlayerChoicesProps {
  result: {
    player1Choices: string[]
    player2Choices: string[]
  }
}

export default function PlayerChoices({ result }: PlayerChoicesProps) {
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null)

  const toggleExpand = (player: number) => {
    setExpandedPlayer(expandedPlayer === player ? null : player)
  }

  const choiceVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  const renderPlayerChoices = (choices: string[], player: number) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Player {player} Choices
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleExpand(player)}
          aria-label={expandedPlayer === player ? "Collapse" : "Expand"}
        >
          {expandedPlayer === player ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {expandedPlayer === player && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScrollArea className="h-40 w-full rounded-md border">
                <div className="p-4">
                  {choices.map((choice, index) => (
                    <motion.div
                      key={index}
                      variants={choiceVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      className="inline-block m-1"
                    >
                      <Badge
                        variant={choice === "cooperate" ? "secondary" : "destructive"}
                      >
                        {choice === "cooperate" ? "C" : "S"}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {renderPlayerChoices(result.player1Choices, 1)}
      {renderPlayerChoices(result.player2Choices, 2)}
    </div>
  )
}