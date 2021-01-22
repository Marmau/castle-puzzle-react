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
  Grow,
  Toolbar,
  Typography,
} from "@material-ui/core"
import FlagIcon from "@material-ui/icons/Flag"
import React, { useCallback, useState } from "react"
import styled from "styled-components"
import "./App.css"
import FlagSelector from "./component/FlagSelector"
import GridSolution from "./component/GridSolution"
import {
  isWorkerResult,
  Piece,
  Point,
  WorkerParams,
  WorkerResult,
  WorkerRunningInfo,
  WorkerStatus,
} from "./model"
import workerCode from "./worker/worker-puzzle"
import ReplayIcon from "@material-ui/icons/Replay"

function buildworker(worker: any) {
  const code = worker.toString()
  const blob = new Blob([`(${code})()`])
  return new Worker(URL.createObjectURL(blob))
}

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

function App() {
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
  }, [setFlagPosition, setWorkerResult, setWorkerRunningInfo])

  const play = useCallback(() => {
    const worker = buildworker(workerCode)
    worker.onmessage = (e) => {
      const workerStatus: WorkerStatus = e.data
      if (isWorkerResult(workerStatus)) {
        setRunning(false)
        setWorkerResult(workerStatus)
      } else {
        setWorkerRunningInfo(workerStatus)
      }
    }

    if (!flagPosition) return

    const params: WorkerParams = {
      lines: 7,
      columns: 7,
      flagPosition,
      pieces: PIECES,
    }

    setRunning(true)
    worker.postMessage(params)
  }, [flagPosition, setRunning])

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
            <Box key={i} m={1}>
              <GridSolution solution={solution}></GridSolution>
            </Box>
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
        <Grow in={workerResult !== undefined}>{resultScreen()}</Grow>
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
