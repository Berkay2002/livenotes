import { SignedIn, UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header'
import Notifications from '@/components/Notifications';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { Suspense } from 'react';
import { Bell, Lock, Settings, Shield } from 'lucide-react';
import { PushNotificationManager } from '@/components/PushNotificationManager';

const SettingsPage = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const email = clerkUser.emailAddresses[0].emailAddress;

  return (
    <main className="min-h-screen bg-dark-100 w-screen overflow-hidden">
      {/* Responsive Header with balanced layout */}
      <Header className="sticky left-0 top-0 z-10 border-b border-dark-400 py-2 md:py-4 px-2 md:px-6 bg-dark-200 shadow-sm" showSidebarToggle={true}>
        {/* Left section content */}
        <div className="md:hidden flex items-center ml-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
        
        {/* Center section content */}
        <div className="w-full flex items-center justify-center">
          {/* Desktop search bar */}
          <div className="hidden md:flex w-full max-w-2xl justify-center">
            <SearchBar 
              email={email} 
              placeholder="Search documents"
              className="py-2 w-full text-base"
            />
          </div>
          
          {/* Mobile search bar */}
          <div className="md:hidden flex w-full justify-center">
            <SearchBar 
              email={email} 
              placeholder="Search" 
              className="w-full" 
            />
          </div>
        </div>
        
        {/* Right section content */}
        <div className="flex items-center justify-end gap-3 pr-0 md:pr-2">
          {/* Notifications - shown on both mobile and desktop */}
          <Notifications className="h-6 md:h-7 w-6 md:w-7" />
          
          {/* Desktop only: User avatar button */}
          <div className="hidden md:block">
            <div className="transform scale-125">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </Header>
      
      <div className="container mx-auto px-4 py-8">
        {/* Page title with icon */}
        <div className="mb-8 flex items-center">
          <div className="hidden md:flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary text-white">
              <Settings size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <div className="md:hidden w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary text-white">
                <Settings size={16} />
              </div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>
          </div>
        </div>
        
        {/* Settings sections */}
        <div className="space-y-8">
          {/* Notification settings */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent-primary" />
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-5">
              <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-md bg-dark-300"></div>}>
                <PushNotificationManager />
              </Suspense>
            </div>
          </section>
          
          {/* Privacy settings */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-accent-primary" />
              <h2 className="text-lg font-semibold text-white">Privacy</h2>
            </div>
            
            <div className="rounded-lg border border-dark-400 bg-dark-200 p-5">
              <p className="text-sm text-gray-400">
                Your privacy is important to us. LiveNotes only collects the minimum information needed to provide you with a great collaborative note-taking experience.
              </p>
            </div>
          </section>
          
          {/* Security settings */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent-primary" />
              <h2 className="text-lg font-semibold text-white">Security</h2>
            </div>
            
            <div className="rounded-lg border border-dark-400 bg-dark-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <Link 
                  href="https://dashboard.clerk.com/user/security" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded text-sm bg-accent-primary text-white hover:bg-accent-primary/90"
                >
                  Manage
                </Link>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-white">Manage Devices</h3>
                  <p className="text-sm text-gray-400">View and manage devices logged into your account</p>
                </div>
                <Link 
                  href="https://dashboard.clerk.com/user/sessions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded text-sm bg-transparent border border-dark-400 text-white hover:bg-dark-400"
                >
                  View Devices
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage; 