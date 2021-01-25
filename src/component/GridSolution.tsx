import { CSSProperties } from "@material-ui/core/styles/withStyles"
import { useCallback } from "react"
import styled from "styled-components"
import { Cell, Solution } from "../model"

function pickColor(seed: number) {
  return (
    "#" +
    Math.floor(Math.abs(Math.sin(seed) * 16777215) % 16777215).toString(16)
  )
}

interface GridSolutionParams {
  solution: Solution
}

const Table = styled("div")`
  display: flex;
  width: 100%;
  height: 100%;
  margin: auto;
  user-select: none;
  flex-direction: column;

  .line {
    flex: 1;
    display: flex;

    &:first-child {
      .cell {
        border-top: 1px solid black;
      }
    }

    .cell {
      flex: 1;
      border-right: 1px solid black;
      border-bottom: 1px solid black;
      position: relative;

      &:first-child {
        border-left: 1px solid black;
      }

      &:before {
        content: "";
        display: block;
        padding-top: 100%;
      }

      .cellContent {
        display: none;
        position: absolute;
        color: transparent;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
      }

      &.cell--1 {
        background-color: black;

        .cellContent {
          height: 50%;
          width: 50%;
          border-radius: 50%;
          top: 25%;
          left: 25%;
          display: block;
          background-color: white;
        }
      }
    }
  }
`

export default function GridSolution({ solution }: GridSolutionParams) {
  const getStyle = useCallback(
    (line: number, column: number): CSSProperties => {
      const cellValue = solution[line][column]!

      if (cellValue === -1) return {}
      
      const isSamePieceAtRight = solution[line][column + 1] === cellValue
      const isSamePieceAtBottom = solution[line + 1] && solution[line + 1][column] === cellValue

      return {
        backgroundColor: pickColor(cellValue),
        borderRight: isSamePieceAtRight ? "1px solid transparent" : undefined,
        borderBottom: isSamePieceAtBottom ? "1px solid transparent" : undefined
      }
    }, [solution]
  )

  const getClassName = useCallback((value: Cell) => {
    return `cell cell-${value}`
  }, [])

  const cells = solution.map((lines, l) => (
    <div className="line" key={l}>
      {lines.map((value, c) => (
        <div className={getClassName(value)} style={getStyle(l, c)} key={l + "-" + c}>
          <div className="cellContent">{value}</div>
        </div>
      ))}
    </div>
  ))

  return <Table>{cells}</Table>
}
