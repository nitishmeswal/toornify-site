declare module "@/components/LiquidEther" {
  import { CSSProperties } from "react";

  interface LiquidEtherProps {
    mouseForce?: number;
    cursorSize?: number;
    isViscous?: boolean;
    viscous?: number;
    iterationsViscous?: number;
    iterationsPoisson?: number;
    dt?: number;
    BFECC?: boolean;
    resolution?: number;
    isBounce?: boolean;
    colors?: string[];
    style?: CSSProperties;
    className?: string;
    autoDemo?: boolean;
    autoSpeed?: number;
    autoIntensity?: number;
    takeoverDuration?: number;
    autoResumeDelay?: number;
    autoRampDuration?: number;
    color0?: string;
    color1?: string;
    color2?: string;
  }

  export default function LiquidEther(props: LiquidEtherProps): JSX.Element;
}
