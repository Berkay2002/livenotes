import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Provider from "./Provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "LiveNotes",
  description: "LiveNotes is a note-taking app that allows you to take notes in real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return ( 
    <ClerkProvider 
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#3371FF",
          fontSize: "16px",
        },
      }}
    > 
      <html lang="en" suppressHydrationWarning>
        <head />
        <body 
          className={cn(
            "min-h-screen font-sans antialiased",
            fontSans.variable 
          )}
        >
          <Provider>
            {children}
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
