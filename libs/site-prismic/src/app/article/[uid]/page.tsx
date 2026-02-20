import { Metadata } from "next";
import { notFound } from "next/navigation";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { Article } from "@/components/Article/Article";
import { BlogContainer } from "@/components/BlogContainer/BlogContainer";
import { getRecommendedArticles } from "@/components/Article/recommendations";
import { Related } from "@/components/Related/Related";
import Link from "next/link";
import styles from "./styles.module.css"
import { Icon } from "semantic-ui-react";

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

  const { uid } = await params;
  const page = await client
    .getByUID("article", uid)
    .catch(() => notFound());

  // Fetch all articles for recommendation selection
  const allArticles = await client.getAllByType("article");

  // Get recommended articles using shared logic
  const recommendedArticles = getRecommendedArticles(page, allArticles, 3);

  return (
    <div>
      <BlogContainer backLink={
        <Link href="/" className={styles.backLink}>
          <Icon name="arrow left" />
          Go Back
        </Link>
      }>
        <Article document={page} />
        <Related
          relatedArticles={recommendedArticles}
          title="Related Articles"
          LinkComponent={LinkComponent}
        />
      </BlogContainer>
    </div>
  );
}

const LinkComponent = ({ articleId, children }: { articleId: string; children: React.ReactNode }) => (
  <Link href={`/article/${articleId}`}>{children}</Link>
);

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
