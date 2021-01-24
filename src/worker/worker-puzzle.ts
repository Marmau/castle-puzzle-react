import * as Comlink from "comlink"
import {
  Piece,
  Point,
  Solution,
  WorkerResult,
  WorkerRunningInfo
} from "../model"
import {
  all4Rotations, Grid,
  PieceRotations, sum2Points
} from "./puzzle"

function play(
  lines: number,
  columns: number,
  flagPosition: Point,
  pieces: Piece[],
  statusCallback: (status: WorkerRunningInfo) => void,
  resultCallback: (result: WorkerResult) => void
) {
  console.time("PLAY")
  const grid = new Grid(lines, columns)
  const orderedPieces = [...pieces].sort((a, b) => b.length - a.length)
  const allPoints: Point[] = grid.cells.flatMap((lines, i) =>
    lines.map((_, j): Point => [i, j])
  )

  let numberOfSolutionFound = 0
  let numberOfSolutionTested = 0

  const solutions: Solution[] = []

  const canAddPiece = (piece: Piece, startPosition: Point): boolean => {
    return piece.every((point) => {
      const position: Point = sum2Points(startPosition, point)
      return grid.isIn(position) && grid.get(position) === undefined
    })
  }

  const addPiece = (
    piece: Piece,
    key: number,
    startPosition: Point
  ): boolean => {
    const validPosition = canAddPiece(piece, startPosition)

    if (validPosition) {
      piece.forEach((point) => {
        const position: Point = sum2Points(startPosition, point)
        grid.set(position, key)
      })
    }

    return validPosition
  }

  const removeKey = (key: number): void => {
    allPoints.forEach((point) => {
      if (grid.get(point) === key) {
        grid.set(point, undefined)
      }
    })
  }

  const getSolution = () => {
    return grid.cells.map((line) => line.slice())
  }

  const internalPlay = (pieceRotations: PieceRotations[]) => {
    if (pieceRotations.length === 0) {
      solutions.push(getSolution())
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
          if (addPiece(rotation, key, point)) {
            pieceAdded = true
            internalPlay(otherPieceRotations)
            removeKey(key)
          }
        }
      }
      if (!pieceAdded) {
        numberOfSolutionTested++
      }
    }
  }

  grid.set(flagPosition, -1)

  const pieceRotations = orderedPieces.map((p) => all4Rotations(p))

  internalPlay(pieceRotations)
  console.timeEnd("PLAY")
  resultCallback({ solutions })
}

Comlink.expose({
  play,
})
