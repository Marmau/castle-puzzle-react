import { Point, Piece, Cell, Solution, WorkerParams } from "../model"

export default function PuzzleWorker() {

  type PieceRotations = Piece[]

  function areSamePoints(p1: Point, p2: Point) {
    return p1[0] === p2[0] && p1[1] === p2[1]
  }

  function areSamePieces(p1: Piece, p2: Piece) {
    return p1.every(p1Point => p2.some(p2Point => areSamePoints(p1Point, p2Point)))
  }

  function sum2Points(p1: Point, p2: Point): Point {
    return [p1[0] + p2[0], p1[1] + p2[1]]
  }

  function rotate(piece: Piece): Piece {
    const numberOfLines = piece.reduce(
      (result, current) => Math.max(result, current[0] + 1),
      0
    )
    return piece.map(
      (point): Point => {
        return [point[1], point[0] * -1 + numberOfLines - 1]
      }
    )
  }

  function all4Rotations(piece: Piece): PieceRotations {
    const firstRotation = rotate(piece)
    const secondRotation = rotate(firstRotation)
    const thirdRotation = rotate(secondRotation)

    if (areSamePieces(piece, secondRotation)) {
      return [piece, firstRotation]
    } else {
      return [piece, firstRotation, secondRotation, thirdRotation]
    }
  }

  class Grid {
    private _cells: Cell[][]

    constructor(private lines: number, private columns: number) {
      this._cells = Array(lines)
        .fill(undefined)
        .map(() => Array(columns).fill(undefined))
    }

    get cells() {
      return this._cells
    }

    public isIn(point: Point) {
      return this.lines > point[0] && this.columns > point[1]
    }

    public get(point: Point): Cell {
      return this._cells[point[0]][point[1]]
    }

    public set(point: Point, value: Cell): void {
      this._cells[point[0]][point[1]] = value
    }
  }

  class PuzzlePlayer {
    private allPoints: Point[] = []
    private numberOfSolutionFound = 0
    private numberOfSolutionTested = 0

    constructor(public grid: Grid) {
      this.allPoints = this.grid.cells.flatMap((lines, i) =>
        lines.map((_, j): Point => [i, j])
      )
    }

    private canAddPiece(piece: Piece, startPosition: Point): boolean {
      return piece.every((point) => {
        const position: Point = sum2Points(startPosition, point)
        return this.grid.isIn(position) && this.grid.get(position) === undefined
      })
    }

    public addPiece(piece: Piece, key: number, startPosition: Point): boolean {
      const canAddPiece = this.canAddPiece(piece, startPosition)

      if (canAddPiece) {
        piece.forEach((point) => {
          const position: Point = sum2Points(startPosition, point)
          this.grid.set(position, key)
        })
      }

      return canAddPiece
    }

    public removeKey(key: number): void {
      this.allPoints.forEach((point) => {
        if (this.grid.get(point) === key) {
          this.grid.set(point, undefined)
        }
      })
    }

    private getSolution() {
      return this.grid.cells.map((line) => line.slice())
    }

    private internalPlay(pieceRotations: PieceRotations[], solutions: Solution[]) {
      if (pieceRotations.length === 0) {
        solutions.push(this.getSolution())
        this.numberOfSolutionFound++

        postMessage({
          numberOfSolutionFound: this.numberOfSolutionFound,
          numberOfSolutionTested: this.numberOfSolutionTested,
        })
      } else {
        const key = pieceRotations.length
        const currentPieceRotation = pieceRotations[0]
        const otherPieceRotations = pieceRotations.slice(1)
        let pieceAdded = false
        for (const rotation of currentPieceRotation) {
          for (const point of this.allPoints) {
            if (this.addPiece(rotation, key, point)) {
              pieceAdded = true
              this.internalPlay(otherPieceRotations, solutions)
              this.removeKey(key)
            }
          }
        }
        if (!pieceAdded) {
          this.numberOfSolutionTested++
        }
      }
    }

    public play(flagPosition: Point, pieces: Piece[]): Solution[] {
      this.numberOfSolutionFound = 0
      this.numberOfSolutionTested = 0
      this.grid.set(flagPosition, -1)

      const pieceRotations = pieces.map(p => all4Rotations(p))

      const solutions: Solution[] = []
      this.internalPlay(pieceRotations, solutions)
      return solutions
    }
  }

  function play(
    lines: number,
    columns: number,
    flagPosition: Point,
    pieces: Piece[]
  ) {
    console.time("PLAY")
    const grid = new Grid(lines, columns)
    const player = new PuzzlePlayer(grid)

    const orderedPieces = [...pieces].sort((a, b) => b.length - a.length)

    const solutions = player.play(flagPosition, orderedPieces)
    postMessage({
      solutions,
    })

    console.timeEnd("PLAY")
  }

  onmessage = (e) => {
    const { lines, columns, flagPosition, pieces }: WorkerParams = e.data
    play(lines, columns, flagPosition, pieces)
  }
}
