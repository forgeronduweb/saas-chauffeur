import * as React from "react"
import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef(({ className, config, children, ...props }, ref) => {
  const cssVars = React.useMemo(() => {
    const vars = {}
    if (config) {
      Object.entries(config).forEach(([key, value]) => {
        if (value.color) {
          vars[`--color-${key}`] = value.color
        }
      })
    }
    return vars
  }, [config])

  return (
    <div
      ref={ref}
      className={cn("flex aspect-video justify-center text-xs", className)}
      style={cssVars}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = ({ cursor = true, content, ...props }) => {
  return null
}

const ChartTooltipContent = React.forwardRef(({ className, hideLabel, nameKey, indicator, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-md",
        className
      )}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
