import * as Comlink from "comlink"
import {
  Piece,
  Point,
  Solution,
  WorkerResult,
  WorkerRunningInfo,
  PuzzleWorkerComlink,
} from "../model"
import { all4Rotations, Grid, PieceRotations, sum2Points } from "./puzzle"

const fillGrid = (
  piece: Piece,
  key: number | undefined,
  startPosition: Point
) => (grid: Grid): void => {
  piece.forEach((point) => {
    const position: Point = sum2Points(startPosition, point)
    grid.set(position, key)
  })
}

const canAddPiece = (piece: Piece, startPosition: Point) => (
  grid: Grid
): boolean => {
  return piece.every((point) => {
    const position: Point = sum2Points(startPosition, point)
    return grid.exists(position) && grid.get(position) === undefined
  })
}

const addPiece = (piece: Piece, key: number, startPosition: Point) => (
  grid: Grid
): boolean => {
  const validPosition = canAddPiece(piece, startPosition)(grid)

  if (validPosition) {
    fillGrid(piece, key, startPosition)(grid)
  }

  return validPosition
}

const removePiece = (piece: Piece, startPosition: Point) => (
  grid: Grid
): void => {
  fillGrid(piece, undefined, startPosition)(grid)
}

const getSolution = (grid: Grid) => {
  return grid.cells.map((line) => line.slice())
}

const shuffle = (array: any[]) => {
  return array
    .map((x) => [Math.random(), x])
    .sort(([a], [b]) => a - b)
    .map(([_, x]) => x)
}

function init(
  lines: number,
  columns: number,
  flagPosition: Point,
  pieces: Piece[]
): [Grid, PieceRotations[], Point[], Solution[]] {
  const grid = new Grid(lines, columns)
  grid.set(flagPosition, -1)

  const orderedPieces = [...pieces].sort((a, b) => {
    const diff = b.length - a.length
    if (diff === 0) {
      return Math.random() - 0.5
    }
    return diff
  })

  const allPoints: Point[] = shuffle(
    grid.cells.flatMap((lines, i) => lines.map((_, j): Point => [i, j]))
  )
  const solutions: Solution[] = []

  const pieceRotations = orderedPieces.map((p) => shuffle(all4Rotations(p)))

  return [grid, pieceRotations, allPoints, solutions]
}

function playAllSolutions(
  lines: number,
  columns: number,
  flagPosition: Point,
  pieces: Piece[],
  statusCallback: (status: WorkerRunningInfo) => void,
  resultCallback: (result: WorkerResult) => void
) {
  console.time("PLAY")

  const [grid, pieceRotations, allPoints, solutions] = init(
    lines,
    columns,
    flagPosition,
    pieces
  )

  let numberOfSolutionFound = 0
  let numberOfSolutionTested = 0

  const internalPlay = (pieceRotations: PieceRotations[]) => {
    if (pieceRotations.length === 0) {
      solutions.push(getSolution(grid))
      numberOfSolutionFound++

      statusCallback({
        numberOfSolutionFound: numberOfSolutionFound,
        numberOfSolutionTested: numberOfSolutionTested,
      })
    } else {
      const key = pieceRotations.length
      const currentPieceRotation = pieceRotations[0]
      const otherPieceRotations = pieceRotations.slice(1)
      let pieceAdded = false
      for (const rotation of currentPieceRotation) {
        for (const point of allPoints) {
          if (addPiece(rotation, key, point)(grid)) {
            pieceAdded = true
            internalPlay(otherPieceRotations)
            removePiece(rotation, point)(grid)
          }
        }
      }
      if (!pieceAdded) {
        numberOfSolutionTested++
      }
    }
  }

  internalPlay(pieceRotations)
  console.timeEnd("PLAY")
  resultCallback({ solutions })
}

function play1Solution(
  lines: number,
  columns: number,
  flagPosition: Point,
  pieces: Piece[],
  statusCallback: (status: WorkerRunningInfo) => void,
  resultCallback: (result: WorkerResult) => void
) {
  console.time("PLAY 1 SOLUTION")
  const [grid, pieceRotations, allPoints, solutions] = init(
    lines,
    columns,
    flagPosition,
    pieces
  )

  let numberOfSolutionTested = 0

  const internalPlay = (pieceRotations: PieceRotations[]): boolean => {
    if (pieceRotations.length === 0) {
      solutions.push(getSolution(grid))

      statusCallback({
        numberOfSolutionFound: 1,
        numberOfSolutionTested: numberOfSolutionTested,
      })
      return true
    } else {
      const key = pieceRotations.length
      const currentPieceRotation = pieceRotations[0]
      const otherPieceRotations = pieceRotations.slice(1)
      let pieceAdded = false
      const result = currentPieceRotation.some((rotation) => {
        return allPoints.some((point) => {
          if (addPiece(rotation, key, point)(grid)) {
            pieceAdded = true
            const result = internalPlay(otherPieceRotations)
            removePiece(rotation, point)(grid)
            return result
          } else {
            return false
          }
        })
      })

      if (!pieceAdded) {
        numberOfSolutionTested++
      }

      return result
    }
  }

  internalPlay(pieceRotations)
  console.timeEnd("PLAY 1 SOLUTION")
  resultCallback({ solutions })
}

Comlink.expose({
  playAllSolutions,
  play1Solution,
} as PuzzleWorkerComlink)
