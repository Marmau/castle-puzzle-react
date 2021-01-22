export type Point = [number, number]
export type Piece = Point[]

export type Solution = Cell[][]
export type Cell = number | undefined

export interface WorkerParams {
  lines: number
  columns: number
  flagPosition: Point
  pieces: Piece[]
}

export interface WorkerRunningInfo {
  numberOfSolutionFound: number
  numberOfSolutionTested: number
}

export interface WorkerResult {
  solutions: Solution[]
}

export type WorkerStatus = WorkerRunningInfo | WorkerResult

export function isWorkerResult(status: WorkerStatus): status is WorkerResult {
  return (status as WorkerResult).solutions !== undefined
}