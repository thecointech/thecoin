// ./src/components/PostCard.tsx

import { PrismicNextImage } from "@prismicio/next";
import { PrismicLink, PrismicText } from "@prismicio/react";
import { RichText } from "./RichText";
import { Content } from "@prismicio/client";
import type { JSX } from "react";

export const PostCard = ({
  post,
}: {
  post: Content.ArticleDocument|Content.FaqDocument;
}): JSX.Element => {

  return (
    <PrismicLink document={post}>
      {
        getImage(post) && (
          <PrismicNextImage
            field={getImage(post)}
            sizes="100vw"
          />
        )
      }
      <div>
        <div>
          <p>
            {getDate(post)}
          </p>
          <div>
            <h2>
              <PrismicText field={getTitle(post)} />
            </h2>
          </div>
        </div>
        <RichText field={getDescription(post)} />
      </div>
      <div />
    </PrismicLink>
  );
};

const getDate = (post: Content.ArticleDocument|Content.FaqDocument) => {
  if (post.type === "faq") {
    return "";
  } else {
    return new Date(post.data.publication_date || "").toLocaleDateString();
  }
}

const getTitle = (post: Content.ArticleDocument|Content.FaqDocument) => {
  if (post.type === "faq") {
    return post.data.question;
  } else {
    return post.data.title;
  }
}

const getImage = (post: Content.ArticleDocument|Content.FaqDocument) => {
  if (post.type === "article") {
    return post.data.image_before_title;
  } else {
    return undefined;
  }
};

const getDescription = (post: Content.ArticleDocument|Content.FaqDocument) => {
  if (post.type === "article") {
    return post.data.short_content;
  } else {
    return post.data.answer;
  }
};

