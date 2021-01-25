import { Fade } from "@material-ui/core"
import { ReactNode } from "react"
import { useInView } from "react-intersection-observer"

interface DisplayWhenInViewportParams {
  children: ReactNode
  height: number
  width: number
  fade?: boolean
}

export function DisplayWhenInViewport({
  width,
  height,
  fade,
  children,
}: DisplayWhenInViewportParams) {
  const { ref, inView } = useInView({})

  console.log("IN VIEW", inView)
  const style = {
    height: `${height}px`,
    width: `${width}px`,
  }

  return (
    <div ref={ref} style={style}>
      {inView &&  children}
    </div>
  )
}
