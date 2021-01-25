import { Fade } from "@material-ui/core"
import { ReactNode } from "react"
import { useInView } from "react-intersection-observer"

interface DisplayWhenInViewportParams {
  children: ReactNode
  height: number
  width: number
}

export function DisplayWhenInViewport({
  width,
  height,
  children,
}: DisplayWhenInViewportParams) {
  const { ref, inView } = useInView({
    rootMargin: "100px 0px",
  })

  const style = {
    height: `${height}px`,
    width: `${width}px`,
  }

  return (
    <div ref={ref} style={style}>
      {inView && (
        <Fade in={true} timeout={500}>
          <div>{children}</div>
        </Fade>
      )}
      {!inView && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "darkgrey",
          }}
        ></div>
      )}
    </div>
  )
}
