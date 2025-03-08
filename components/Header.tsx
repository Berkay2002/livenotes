import { cn } from '@/lib/utils'
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
 * - Equal width containers on both sides for perfectly symmetrical layout
 * - Center section grows to fill available space between side sections
 */
const Header = ({ children, className, showSidebarToggle = false }: HeaderProps) => {
  return (
    <header className={cn("relative grid grid-cols-[auto_1fr_auto] w-full box-border overflow-hidden", className)}>
      {/* Left section with logo and hamburger menu */}
      <div className="flex items-center flex-shrink-0">
        {/* Hamburger menu button - conditionally shown */}
        {showSidebarToggle && <HamburgerButton />}
        
        {/* Logo container - hidden on mobile */}
        <div className="hidden md:flex pl-2">
          <Link href='/' className="flex items-center justify-center">
            <LiveNotesLogo 
              variant="icon"
              width={100}
              height={100}
              className="max-h-[56px] lg:max-h-[56px] w-auto"
            />
          </Link>
        </div>
      </div>
      
      {/* Center content area - flexibly sized based on available space */}
      <div className="flex justify-center items-center px-2 overflow-hidden">
        {children}
      </div>
      
      {/* Right section - will automatically match width with left section */}
      <div className="flex justify-end items-center flex-shrink-0">
        {/* This is intentionally empty - content will be provided by the parent component */}
      </div>
    </header>
  )
}

export default Header