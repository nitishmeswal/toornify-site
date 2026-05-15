declare module "@/components/GlitchText" {
  import { ReactNode } from "react";

  interface GlitchTextProps {
    children: ReactNode;
    speed?: number;
    enableShadows?: boolean;
    enableOnHover?: boolean;
    className?: string;
  }

  export default function GlitchText(props: GlitchTextProps): JSX.Element;
}
