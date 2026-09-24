import type { ElementType, ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}

/** The site's one horizontal container: 1600 px max, fluid gutters. */
export default function Shell({ children, className = '', as: Tag = 'div', id }: ShellProps) {
  return (
    <Tag id={id} className={`mx-auto w-full max-w-[1600px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </Tag>
  );
}
