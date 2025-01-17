import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "AI Shorts Generator",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={outfit.className}>
          <Provider>{children}</Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
