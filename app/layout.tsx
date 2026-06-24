import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Feedback Retriever",
  description: "Analyze high-performing product videos and comment language."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
