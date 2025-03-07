import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import LiveNotesLogo from '@/components/ui/live-notes-logo'
import dynamic from 'next/dynamic'

// Dynamically import the client component with no SSR
const HamburgerButton = dynamic(
  () => import('@/components/ui/hamburger-button').then(mod => mod.HamburgerButton),
  { ssr: false }
)

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
  showSidebarToggle?: boolean;
}

/**
 * Header component that adapts for both desktop and mobile layouts
 * - Fixed-width containers on both sides for symmetrical layout
 * - Center section for search and other components passed as children
 */
const Header = ({ children, className, showSidebarToggle = false }: HeaderProps) => {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {/* Hamburger menu - desktop only */}
      {showSidebarToggle && <HamburgerButton />}
      
      {/* Logo container - fixed width for layout symmetry - hidden on mobile */}
      <div className="hidden md:flex w-48 pl-2">
        <Link href='/' className="flex items-center justify-center">
          {/* Desktop: Full logo (icon + text) (not anymore with text) */}
          <LiveNotesLogo 
            variant="icon"
            width={100}
            height={100}
            className="max-h-[56px] lg:max-h-[56px] w-auto"
          />
          
          {/* Mobile: Icon-only logo (currently commented out) */}
          {/* Temporarily commented out
          <LiveNotesLogo
            variant="icon"
            width={36}
            height={36}
            className="md:hidden"
          />
          */}
        </Link>
      </div>
      
      {/* Main content area - flexibly sized based on available space */}
      {children}
    </div>
  )
}

export default Header