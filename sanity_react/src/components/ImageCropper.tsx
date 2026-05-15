import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/Button';
import { X, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
    imageSrc: string;
    isCircular?: boolean;
    onCropComplete: (croppedImage: string) => void;
    onCancel: () => void;
}

export function ImageCropper({ imageSrc, isCircular = false, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropAreaChange = (_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleSaveCrop = async () => {
        if (!croppedAreaPixels) return;

        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            const { x, y, width, height } = croppedAreaPixels;

            // Set canvas size
            if (isCircular) {
                const size = Math.min(width, height);
                canvas.width = size;
                canvas.height = size;

                // Create circular clipping
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.clip();
            } else {
                canvas.width = width;
                canvas.height = height;
            }

            // Draw rotated image
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            ctx.drawImage(
                image,
                x,
                y,
                width,
                height,
                0,
                0,
                width,
                height
            );

            const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
            onCropComplete(croppedImage);
        };
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Crop Image {isCircular ? '(Circular)' : ''}</h3>
                    <button
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative w-full h-96 bg-black/20">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape={isCircular ? 'round' : 'rect'}
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropAreaChange={onCropAreaChange}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                <div className="p-4 space-y-4 border-t">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Zoom</label>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rotation</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="0"
                                max="360"
                                step="1"
                                value={rotation}
                                onChange={(e) => setRotation(Number(e.target.value))}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRotation(0)}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveCrop}
                        >
                            Save Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
