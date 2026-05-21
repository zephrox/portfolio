import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Md. Anjir Jaman | AI/ML Engineer & Researcher",
  description:
    "Portfolio of Md. Anjir Jaman — AI/ML Engineer, Computer Vision Researcher, and Robotics enthusiast with multiple IEEE publications. NEDAAS Lab Research Intern at AIUB.",
  openGraph: {
    title: "Md. Anjir Jaman | AI/ML Engineer & Researcher",
    description: "Computer Vision · Deep Learning · Robotics · IEEE Author",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          <PageTransition>{children}</PageTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
