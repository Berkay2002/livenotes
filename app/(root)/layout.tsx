import { SidebarProvider } from '@/components/SidebarProvider';
import { currentUser } from '@clerk/nextjs/server';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress || "";

  return (
    <SidebarProvider email={email}>
      {children}
    </SidebarProvider>
  );
} 