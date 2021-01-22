import { useCallback, useState } from "react"
import styled from "styled-components"
import { Point } from "../model"

interface FlagSelectorParams {
  lines: number
  columns: number
  onSelectPosition?: (flagPosition: Point) => void
}

const Table = styled("div")`
  display: flex;
  width: 100%;
  max-width: 500px;
  max-height: 500px;
  margin: auto;
  user-select: none;
  flex-direction: column;

  .line {
    flex: 1;
    display: flex;

    &:first-child {
      .cell {
        border-top: 1px solid darkgrey;
      }
    }

    .cell {
      flex: 1;
      border-right: 1px solid darkgrey;
      border-bottom: 1px solid darkgrey;
      position: relative;

      &:first-child {
        border-left: 1px solid darkgrey;
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
        height: 50%;
        width: 50%;
        border-radius: 50%;
        top: 25%;
        left: 25%;
      }

      &:hover {
        cursor: pointer;

        .cellContent {
          display: block;
          background-color: lightgrey;
        }
      }

      &[aria-selected="true"] {
        .cellContent {
          display: block;
          transition: background-color 0.2s;
          background-color: darkgrey;
        }
      }
    }
  }
`

export default function FlagSelector({
  lines,
  columns,
  onSelectPosition,
}: FlagSelectorParams) {
  const [flag, setFlag] = useState<Point>([-1, -1])

  const onClickCell = useCallback(
    (line, column) => {
      setFlag([line, column])
      if (onSelectPosition) {
        onSelectPosition([line, column])
      }
    },
    [setFlag, onSelectPosition]
  )

  const cells = Array(lines)
    .fill(0)
    .map((_, l) => (
      <div className="line" key={l}>
        {Array(columns)
          .fill(0)
          .map((_, c) => (
            <div
              className="cell"
              aria-selected={flag[0] === l && flag[1] === c}
              key={l + "-" + c}
              onClick={() => onClickCell(l, c)}
            >
              <div className="cellContent"></div>
            </div>
          ))}
      </div>
    ))

  return <Table>{cells}</Table>
}
