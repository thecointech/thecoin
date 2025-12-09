import { Metadata } from "next";
import { notFound } from "next/navigation";

import * as prismic from "@prismicio/client";

import { createClient } from "@/prismicio";
import { PostCard } from "@/components/PostCard";
import { RichText } from "@/components/RichText";
import { Navigation } from "@/components/Navigation";
import { Card, CardHeader, CardContent, List, ListItem } from 'semantic-ui-react'

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
    .getByUID("faq", uid)
    .catch(() => notFound());

  return {
    title: prismic.asText(page.data.question),
    description: prismic.asText(page.data.answer),
  };
}

export default async function Page({ params }: { params: Params }) {
  const client = createClient();

  const { uid } = await params;
  const page = await client
    .getByUID("faq", uid)
    .catch(() => notFound());

  const posts = await client.getAllByType("faq", {
    predicates: [prismic.filter.not("my.faq.uid", uid)],
    orderings: [
      { field: "my.faq.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
    limit: 2,
  });

  // Destructure out the content of the current page
  const { question, answer } = page.data;

  return (
    <div>
      <Navigation client={client} />

      <Card fluid>
        <CardHeader>
          <RichText field={question} />
        </CardHeader>
        <CardContent>
          <RichText field={answer} />
        </CardContent>
      </Card>

      <h4>Recommended FAQs</h4>
      <List>
        {posts.map((post) => (
          <ListItem key={post.id}>
            <PostCard post={post} />
          </ListItem>
        ))}
      </List>

      <Navigation client={client} />
    </div>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType("faq");
  return pages.map((page) => {
    return { uid: page.uid };
  });
}
