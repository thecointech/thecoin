import type { Metadata } from "next";

import { About } from "@/components/About/About";
import { createClient } from "@/prismicio";

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const about = await client.getSingle("about");

  return {
    title: about.data.meta_title,
    description: about.data.meta_description,
    openGraph: {
      title: about.data.meta_title || undefined,
      images: about.data.meta_image.url
        ? [{ url: about.data.meta_image.url }]
        : [],
    },
  };
}

export default async function AboutPage() {
  const client = createClient();
  const about = await client.getSingle("about");

  return <About document={about} />;
}
