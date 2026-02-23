import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from '@/prismicio';
import type { Metadata } from "next";
import { BrowserWarning } from "@/components/BrowserWarning";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

import "../semantic/semantic.css";
import styles from "./layout.module.css";

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
        <div className={styles.container}>
          <div className={styles.headerBackground} />
          <div className={styles.header}>
            <Header />
          </div>

          <main className={styles.main}>
            {children}
          </main>

          <div className={styles.footerBackground} />
          <div className={styles.footer}>
            <Footer />
          </div>

          <PrismicPreview repositoryName={repositoryName} />
        </div>
      </body>
    </html>
  );
}
