import {
    Cell,
    Piece,
    Point
} from "../model"

export type PieceRotations = Piece[]

export function areSamePoints(p1: Point, p2: Point) {
  return p1[0] === p2[0] && p1[1] === p2[1]
}

export function areSamePieces(p1: Piece, p2: Piece) {
  return p1.every((p1Point) =>
    p2.some((p2Point) => areSamePoints(p1Point, p2Point))
  )
}

export function sum2Points(p1: Point, p2: Point): Point {
  return [p1[0] + p2[0], p1[1] + p2[1]]
}

export function rotate(piece: Piece): Piece {
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

export function all4Rotations(piece: Piece): PieceRotations {
  const firstRotation = rotate(piece)
  const secondRotation = rotate(firstRotation)
  const thirdRotation = rotate(secondRotation)

  if (areSamePieces(piece, secondRotation)) {
    return [piece, firstRotation]
  } else {
    return [piece, firstRotation, secondRotation, thirdRotation]
  }
}

export class Grid {
  private _cells: Cell[][]

  constructor(private lines: number, private columns: number) {
    this._cells = Array(lines)
      .fill(undefined)
      .map(() => Array(columns).fill(undefined))
  }

  get cells() {
    return this._cells
  }

  public exists(point: Point) {
    return this.lines > point[0] && this.columns > point[1]
  }

  public get(point: Point): Cell {
    return this._cells[point[0]][point[1]]
  }

  public set(point: Point, value: Cell): void {
    this._cells[point[0]][point[1]] = value
  }
}