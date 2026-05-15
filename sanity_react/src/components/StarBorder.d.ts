import { ReactNode, ElementType, CSSProperties } from 'react';

type StarBorderProps<T extends ElementType = 'button'> = {
  as?: T;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children: ReactNode;
  style?: CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className' | 'style'>;

declare function StarBorder<T extends ElementType = 'button'>(props: StarBorderProps<T>): JSX.Element;

export default StarBorder;
