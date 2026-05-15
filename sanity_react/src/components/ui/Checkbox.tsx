import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, id, ...props }, ref) => {
        // Generate a random ID if not provided, to link label and input
        const uniqueId = id || React.useId()

        return (
            <div className="flex items-center space-x-2">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id={uniqueId}
                        ref={ref}
                        className={cn(
                            "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-primary checked:text-primary-foreground",
                            className
                        )}
                        {...props}
                    />
                    <Check className="absolute left-0 top-0 h-4 w-4 hidden peer-checked:block text-primary-foreground pointer-events-none" />
                </div>
                {label && (
                    <label
                        htmlFor={uniqueId}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </label>
                )}
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
