import type { Metadata } from "next";

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
            <body>{children}</body>
        </html>
    );
}
