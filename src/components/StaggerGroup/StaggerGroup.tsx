import { Children, type ElementType, type ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import MotionBlock from '../MotionBlock/MotionBlock';

export interface StaggerGroupProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  itemClassName?: string;
  alternate?: boolean;
  distance?: number;
  scale?: number;
  blur?: number;
  stagger?: number;
  cycle?: number;
  start?: string;
}

export default function StaggerGroup({
  children,
  as = 'div',
  className,
  itemClassName,
  alternate = true,
  distance = 60,
  scale = 0.96,
  blur = 6,
  stagger = 0.08,
  cycle = 3,
  start = 'top 88%',
}: StaggerGroupProps) {
  const isMobile = useMediaQuery('(max-width: 760px)');
  const Tag = as;
  const items = Children.toArray(children);

  return (
    <Tag className={className}>
      {items.map((child, i) => {
        const from = !alternate || isMobile ? 'up' : i % 2 === 0 ? 'left' : 'right';
        return (
          <MotionBlock
            key={i}
            as="div"
            className={itemClassName}
            from={from}
            distance={distance}
            scale={scale}
            blur={blur}
            delay={(i % cycle) * stagger}
            start={start}
          >
            {child}
          </MotionBlock>
        );
      })}
    </Tag>
  );
}
