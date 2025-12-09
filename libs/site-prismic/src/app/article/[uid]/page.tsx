// ./src/app/blog/[uid]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";

import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { PostCard } from "@/components/PostCard";
import { Navigation } from "@/components/Navigation";
import { Article } from "@/components/Article/Article";

type Params = Promise<{ uid: string }>;

/**
 * This page renders a Prismic Document dynamically based on the URL.
 */

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const client = createClient();
  const { uid } = await params;
  const page = await client
    .getByUID("article", uid)
    .catch(() => notFound());

  return {
    title: prismic.asText(page.data.title),
    description: prismic.asText(page.data.short_content),
    openGraph: {
      title: page.data.meta_title || undefined,
      images: [
        {
          url: page.data.meta_image?.url || "",
        },
      ],
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const client = createClient();

  // Fetch the current blog post page being displayed by the UID of the page
  const { uid } = await params;
  const page = await client
    .getByUID("article", uid)
    .catch(() => notFound());

  /**
   * Fetch all of the blog posts in Prismic (max 2), excluding the current one, and ordered by publication date.
   *
   * We use this data to display our "recommended posts" section at the end of the blog post
   */
  const posts = await client.getAllByType("article", {
    predicates: [prismic.filter.not("my.article.uid", uid)],
    orderings: [
      { field: "my.article.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
    limit: 2,
  });

  return (
    <div>
      <Navigation client={client} />

      {/* Display the "hero" section of the blog post */}
      <Article document={page} />
      {/* Display the content of the blog post */}
      {/* <SliceZone slices={slices} components={components} /> */}

      {/* Display the Recommended Posts section using the posts we requested earlier */}
      <h2>Recommended Posts</h2>
      <section>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      <Navigation client={client} />
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();

  /**
   * Query all Documents from the API, except the homepage.
   */
  const pages = await client.getAllByType("article");

  /**
   * Define a path for every Document.
   */
  return pages.map((page) => {
    return { uid: page.uid };
  });
}
