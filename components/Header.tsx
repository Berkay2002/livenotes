import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import LiveNotesLogo from '@/components/ui/live-notes-logo'

interface HeaderProps {
  children?: React.ReactNode;
  className?: string;
}

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn("header", className)}>
      <Link href='/' className="md:flex-1 flex items-center">
        {/* Full logo (icon + text) for medium screens and above */}
        <LiveNotesLogo 
          variant="full"
          width={240}
          height={72}
          className="hidden md:block max-h-[48px] lg:max-h-[60px] w-auto"
        />
        
        {/* Icon-only for mobile screens */}
        {/* Temporarily commented out
        <LiveNotesLogo
          variant="icon"
          width={36}
          height={36}
          className="md:hidden"
        />
        */}
      </Link>
      {children}
    </div>
  )
}

export default Header