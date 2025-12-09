// ./src/app/page.tsx

import { Metadata } from "next";

import { SliceZone } from "@prismicio/react";
import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { PostCard } from "@/components/PostCard";
import { Navigation } from "@/components/Navigation";

/**
 * This component renders your homepage.
 *
 * Use Next's generateMetadata function to render page metadata.
 *
 * Use the SliceZone to render the content of the page.
 */

export async function generateMetadata(): Promise<Metadata> {
  const client = createClient();
  const home = await client.getByUID("page", "home");

  return {
    title: prismic.asText(home.data.title),
    description: home.data.meta_description,
    openGraph: {
      title: home.data.meta_title || undefined,
      images: [
        {
          url: home.data.meta_image.url || "",
        },
      ],
    },
  };
}

export default async function Index() {
  // The client queries content from the Prismic API
  const client = createClient();

  // Fetch the content of the home page from Prismic
  const home = await client.getByUID("page", "home");

  // Get all of the blog_post documents created on Prismic ordered by publication date
  const articles = await client.getAllByType("article", {
    orderings: [
      { field: "my.article.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
  });

  const faqs = await client.getAllByType("faq", {
    orderings: [
      { field: "document.first_publication_date", direction: "desc" },
    ],
  });

  return (
    <>
      <Navigation client={client} />

      <SliceZone slices={home.data.slices} components={components} />

      {/* Map over each of the blog posts created and display a `PostCard` for it */}
      <section>
        {articles.map((article) => (
          <PostCard key={article.id} post={article} />
        ))}
      </section>
      <section>
        {faqs.map((faq) => (
          <PostCard key={faq.id} post={faq} />
        ))}
      </section>

      <Navigation client={client} />
    </>
  );
}
