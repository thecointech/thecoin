import { createClient } from "@/prismicio";

export default async function Home() {
    // Initialize client (will be used for slice previews)
    createClient();

    // This is a placeholder page - Slice Machine previews will be the main use
    return (
        <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
            <h1>TheCoin Prismic Content Library</h1>
            <p>
                This library provides Slice Machine support for visual content editing.
            </p>
            <p>
                Run <code>yarn slicemachine</code> to launch the Slice Machine UI.
            </p>
            <h2>Available Commands</h2>
            <ul>
                <li><code>yarn dev</code> - Start Next.js dev server (for slice previews)</li>
                <li><code>yarn slicemachine</code> - Launch Slice Machine UI</li>
                <li><code>yarn build</code> - Build for production</li>
            </ul>
        </main>
    );
}
