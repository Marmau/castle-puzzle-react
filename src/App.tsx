import {
  AppBar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Fab,
  Fade,
  Toolbar,
  Typography
} from "@material-ui/core"
import FlagIcon from "@material-ui/icons/Flag"
import ReplayIcon from "@material-ui/icons/Replay"
import * as Comlink from "comlink"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import styled from "styled-components"
/* eslint-disable import/no-webpack-loader-syntax */
import PuzzleWorker from "worker-loader!./worker/worker-puzzle"
import "./App.css"
import { DisplayWhenInViewport } from "./component/DisplayWhenInViewport"
import FlagSelector from "./component/FlagSelector"
import GridSolution from "./component/GridSolution"
import {
  Piece,
  Point,
  PuzzleWorkerComlink,
  WorkerResult,
  WorkerRunningInfo
} from "./model"

const WorkerBackdrop = styled(Backdrop)`
  z-index: 99;
  color: #fff;
  flex-direction: column;
`

function formatNumber(number: number): string {
  return (
    number
      .toString()
      .split("")
      .reverse()
      .join("")
      .replace(/(.{3})/g, "$1 ")
      .replace(/ $/, "")
      .split("")
      .reverse()
      .join("") + " "
  )
}

const PIECES: Piece[] = [
  // x x
  [
    [0, 0],
    [0, 1],
  ],
  // x x x
  //   x
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  // x x x x x
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ],
  // x x
  //   x x
  //     x
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
    [1, 1],
    [2, 2],
  ],
  // x x x x
  //     x
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
  ],
  // x
  // x x
  // x x x
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  // x x x x
  //   x x
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 1],
    [1, 2],
  ],
  // x x
  // x x x
  // x x
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
  ],
  // x x x
  //   x x x
  //   x x
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 1],
    [2, 2],
  ],
]

function usePuzzleWorker() {
  const [worker, setWorker] = useState<Worker | undefined>(undefined)

  useEffect(() => {
    setWorker(new PuzzleWorker())
  }, [setWorker])

  const remoteWorker = useMemo(() => {
    return Comlink.wrap<PuzzleWorkerComlink>(worker!)
  }, [worker])
  const terminateWorker = useCallback(() => {
    worker!.terminate()
    setWorker(new PuzzleWorker())
  }, [worker, setWorker])

  return {
    remoteWorker,
    terminateWorker,
  }
}

function App() {
  const { remoteWorker, terminateWorker } = usePuzzleWorker()
  const [flagPosition, setFlagPosition] = useState<Point | undefined>(undefined)
  const [running, setRunning] = useState(false)
  const [workerRunningInfo, setWorkerRunningInfo] = useState<WorkerRunningInfo>(
    {
      numberOfSolutionFound: 0,
      numberOfSolutionTested: 0,
    }
  )
  const [workerResult, setWorkerResult] = useState<WorkerResult | undefined>(
    undefined
  )

  const onSelectPosition = useCallback(
    (position: Point) => {
      setFlagPosition(position)
    },
    [setFlagPosition]
  )

  const replay = useCallback(() => {
    setWorkerRunningInfo({
      numberOfSolutionFound: 0,
      numberOfSolutionTested: 0,
    })
    setWorkerResult(undefined)
  }, [setWorkerResult, setWorkerRunningInfo])

  const onNewStatusPuzzleWorker = useCallback(
    (status: WorkerRunningInfo) => {
      setWorkerRunningInfo(status)
    },
    [setWorkerRunningInfo]
  )
  const onSolutionReceievedFromPuzzleWorker = useCallback(
    (result: WorkerResult) => {
      setRunning(false)
      setWorkerResult(result)
      terminateWorker()
    },
    [setWorkerResult, setRunning, terminateWorker]
  )

  const play = useCallback(async () => {
    if (!flagPosition) return

    setRunning(true)
    await remoteWorker.play(
      7,
      7,
      flagPosition,
      PIECES,
      Comlink.proxy(onNewStatusPuzzleWorker),
      Comlink.proxy(onSolutionReceievedFromPuzzleWorker)
    )
  }, [
    flagPosition,
    setRunning,
    onSolutionReceievedFromPuzzleWorker,
    onNewStatusPuzzleWorker,
    remoteWorker,
  ])

  const flagSelectorScreen = useCallback(() => {
    return (
      <Box m={2} textAlign="center">
        <Typography variant="h6">Selectionne la position du drapeau</Typography>

        <Box m={2}>
          <FlagSelector
            lines={7}
            columns={7}
            onSelectPosition={onSelectPosition}
          ></FlagSelector>
        </Box>
        <Box m={2}>
          <Button
            onClick={play}
            variant="contained"
            color="secondary"
            disabled={flagPosition === undefined}
          >
            Trouver les solutions
          </Button>
        </Box>
      </Box>
    )
  }, [flagPosition, onSelectPosition, play])

  const resultScreen = useCallback(() => {
    return (
      <Box m={2} textAlign="center" mb={8}>
        <Typography variant="h4">
          {workerResult?.solutions.length} solutions possibles.
        </Typography>
        <Box m={2} display="flex" flexWrap="wrap" justifyContent="center">
          {workerResult?.solutions.map((solution, i) => (
            <DisplayWhenInViewport key={i} width={216} height={216} fade>
              <Box m={1}>
                <GridSolution solution={solution}></GridSolution>
              </Box>
            </DisplayWhenInViewport>
          ))}
        </Box>

        <Box position="fixed" bottom="0" right="0" m={3}>
          <Fab
            color="primary"
            aria-label="Recommencer"
            variant="extended"
            onClick={replay}
          >
            <ReplayIcon />
            <Box ml={1}>Recommencer</Box>
          </Fab>
        </Box>
      </Box>
    )
  }, [workerResult, replay])

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar variant="dense">
          <FlagIcon />
          <Typography variant="h6">&nbsp;Le casse-tête de Plaisance</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Box display={workerResult === undefined ? "block" : "none"}>
          {flagSelectorScreen()}
        </Box>
        <Fade in={workerResult !== undefined}>{resultScreen()}</Fade>
      </Container>

      <WorkerBackdrop open={running}>
        <div>
          <CircularProgress color="inherit" />
        </div>
        <Typography variant="body2">
          {formatNumber(workerRunningInfo.numberOfSolutionTested)}
          combinaisons testées
        </Typography>
      </WorkerBackdrop>
    </>
  )
}

export default App
