'use client';

import { usePathname } from 'next/navigation';

export default function LogoLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
    // Otherwise, let Next.js Link handle it naturally via the <a> tag
  };

  return (
    <a href="/" onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
