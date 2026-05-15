import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, FileIcon } from "lucide-react"

export interface FileUploadProps {
    accept?: string
    maxSizeMB?: number
    value?: File | File[] | null
    onChange?: (file: File | File[] | null) => void
    multiple?: boolean
    className?: string
    disabled?: boolean
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
    ({ accept = "image/*", maxSizeMB = 5, value, onChange, multiple = false, className, disabled }, ref) => {
        const [isDragging, setIsDragging] = React.useState(false)
        const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault()
            if (!disabled) setIsDragging(true)
        }

        const handleDragLeave = (e: React.DragEvent) => {
            e.preventDefault()
            if (!disabled) setIsDragging(false)
        }

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            if (disabled) return

            const files = Array.from(e.dataTransfer.files)
            if (files.length > 0) {
                validateAndSetFiles(files)
            }
        }

        const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled || !e.target.files?.length) return
            const files = Array.from(e.target.files)
            validateAndSetFiles(files)
        }

        const validateAndSetFiles = (files: File[]) => {
            const validFiles = files.filter(file => {
                const isSizeValid = file.size <= maxSizeMB * 1024 * 1024
                // Very basic mime check - in production you'd want more robust checking
                const isTypeValid = accept === "*" || accept.split(',').some(type => {
                    const trimType = type.trim()
                    if (trimType.endsWith('/*')) {
                        const mainType = trimType.replace('/*', '')
                        return file.type.startsWith(mainType)
                    }
                    return file.type === trimType
                })
                return isSizeValid && isTypeValid
            })

            if (validFiles.length > 0) {
                if (multiple) {
                    // If supporting multiple, user might need to append. For this simple version, we replace or add to callback.
                    // Assuming onChange handles File[] if multiple is true
                    onChange?.(validFiles)
                } else {
                    onChange?.(validFiles[0])
                }
            }
        }

        const generatePreview = (file: File) => {
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file)
                return url
            }
            return null
        }

        // Effect to cleanup preview URLs
        React.useEffect(() => {
            return () => {
                if (previewUrl) URL.revokeObjectURL(previewUrl)
            }
        }, [previewUrl])

        // Update preview when value changes
        React.useEffect(() => {
            if (!value) {
                setPreviewUrl(null)
                return
            }

            if (value instanceof File && !multiple) {
                const url = generatePreview(value)
                if (url) setPreviewUrl(url)
                else setPreviewUrl(null)
            }
        }, [value, multiple])

        const handleRemove = (e: React.MouseEvent) => {
            e.stopPropagation()
            onChange?.(null)
            setPreviewUrl(null)
        }

        const files = Array.isArray(value) ? value : (value ? [value] : [])
        const hasFiles = files.length > 0
        const primaryFile = files[0]

        return (
            <div
                ref={ref}
                className={cn(
                    "relative group cursor-pointer flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition-all duration-200",
                    isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                    hasFiles ? "p-4" : "py-10 px-6",
                    className
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && document.getElementById(`file-upload-${ref || 'default'}`)?.click()}
            >
                <input
                    id={`file-upload-${ref || 'default'}`}
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileInput}
                    disabled={disabled}
                />

                {hasFiles ? (
                    <div className="flex items-center w-full gap-4">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                        ) : (
                            <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                                <FileIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{primaryFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(primaryFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {!disabled && (
                            <button
                                onClick={handleRemove}
                                className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                            <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {accept === "image/*" ? "SVG, PNG, JPG or GIF" : accept} (max {maxSizeMB}MB)
                        </p>
                    </div>
                )}
            </div>
        )
    }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }
