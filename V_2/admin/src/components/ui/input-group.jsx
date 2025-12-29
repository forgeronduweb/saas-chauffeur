import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import { Input } from "./input"

const InputGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex min-w-0 items-center rounded-md border border-gray-200 bg-white text-sm shadow-sm transition-[color,box-shadow] focus-within:border-gray-950 focus-within:ring-[3px] focus-within:ring-gray-950/5 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-[input:is(:disabled)]:cursor-not-allowed has-[input:is(:disabled)]:opacity-50 has-[textarea:is(:disabled)]:cursor-not-allowed has-[textarea:is(:disabled)]:opacity-50",
      className
    )}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupAddon = React.forwardRef(
  ({ className, align = "inline-start", ...props }, ref) => (
    <div
      ref={ref}
      data-align={align}
      className={cn(
        "text-muted-foreground flex shrink-0 items-center justify-center gap-1 px-2.5 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "data-[align=block-end]:self-end data-[align=block-start]:self-start",
        "order-first data-[align=inline-end]:order-last data-[align=block-end]:order-last",
        className
      )}
      {...props}
    />
  )
)
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupText = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
InputGroupText.displayName = "InputGroupText"

const InputGroupButton = React.forwardRef(
  ({ className, size = "xs", variant = "ghost", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
)
InputGroupButton.displayName = "InputGroupButton"

const InputGroupInput = React.forwardRef(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      "min-w-0 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
      className
    )}
    {...props}
  />
))
InputGroupInput.displayName = "InputGroupInput"

const InputGroupTextarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      "min-w-0 flex-1 resize-none border-0 bg-transparent p-3 text-sm shadow-none outline-none placeholder:text-gray-500",
      className
    )}
    {...props}
  />
))
InputGroupTextarea.displayName = "InputGroupTextarea"

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
}
