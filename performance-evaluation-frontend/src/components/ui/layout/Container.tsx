import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const containerVariants = cva(
  'w-full mx-auto',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        '3xl': 'max-w-[1600px]',
        '4xl': 'max-w-[1800px]',
        '5xl': 'max-w-[2000px]',
        full: 'max-w-full',
        none: '',
      },
      padding: {
        none: '',
        sm: 'px-4 sm:px-6',
        md: 'px-4 sm:px-6 lg:px-8',
        lg: 'px-6 sm:px-8 lg:px-12',
        xl: 'px-8 sm:px-12 lg:px-16',
      },
    },
    defaultVariants: {
      size: 'xl',
      padding: 'md',
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

// Grid System Components
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 4, responsive, children, ...props }, ref) => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    };

    const gridGaps = {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      7: 'gap-7',
      8: 'gap-8',
      9: 'gap-9',
      10: 'gap-10',
      11: 'gap-11',
      12: 'gap-12',
    };

    const responsiveClasses = responsive ? Object.entries(responsive).map(([breakpoint, colCount]) => {
      const breakpointPrefix = breakpoint === 'sm' ? 'sm:' : 
                               breakpoint === 'md' ? 'md:' :
                               breakpoint === 'lg' ? 'lg:' :
                               breakpoint === 'xl' ? 'xl:' :
                               breakpoint === '2xl' ? '2xl:' : '';
      return `${breakpointPrefix}${gridCols[colCount as keyof typeof gridCols]}`;
    }).join(' ') : '';

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridCols[cols],
          gridGaps[gap],
          responsiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction = 'row', wrap, justify, align, gap, children, ...props }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    };

    const wrapClasses = {
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
      nowrap: 'flex-nowrap',
    };

    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const alignClasses = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    };

    const gapClasses = gap !== undefined ? {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      7: 'gap-7',
      8: 'gap-8',
      9: 'gap-9',
      10: 'gap-10',
      11: 'gap-11',
      12: 'gap-12',
    }[gap] : '';

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          wrap && wrapClasses[wrap],
          justify && justifyClasses[justify],
          align && alignClasses[align],
          gapClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// Stack component for vertical layouts
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  align?: 'start' | 'end' | 'center' | 'stretch';
  divider?: React.ReactNode;
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 4, align, divider, children, ...props }, ref) => {
    const spacingClasses = {
      0: 'space-y-0',
      1: 'space-y-1',
      2: 'space-y-2',
      3: 'space-y-3',
      4: 'space-y-4',
      5: 'space-y-5',
      6: 'space-y-6',
      7: 'space-y-7',
      8: 'space-y-8',
      9: 'space-y-9',
      10: 'space-y-10',
      11: 'space-y-11',
      12: 'space-y-12',
    };

    const alignClasses = align ? {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      stretch: 'items-stretch',
    }[align] : '';

    if (divider) {
      const childrenArray = React.Children.toArray(children);
      return (
        <div
          ref={ref}
          className={cn('flex flex-col', alignClasses, className)}
          {...props}
        >
          {childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && (
                <div className={spacingClasses[spacing].replace('space-y-', 'my-')}>
                  {divider}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          spacingClasses[spacing],
          alignClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

// Center component
export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  inline?: boolean;
}

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ className, inline = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          inline ? 'inline-flex' : 'flex',
          'items-center justify-center',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

export {
  Container,
  Grid,
  Flex,
  Stack,
  Center,
  containerVariants,
};
