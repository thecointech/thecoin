import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from '@/prismicio';
import type { Metadata } from "next";
import { BrowserWarning } from "@/components/BrowserWarning";

import "../semantic/semantic.css";

export const metadata: Metadata = {
  title: "TheCoin Prismic Content",
  description: "Prismic Slice Machine content library for TheCoin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BrowserWarning />
        <div>
          {children}
          <PrismicPreview repositoryName={repositoryName} />
        </div>
      </body>
    </html>
  );
}
