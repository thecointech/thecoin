import { NotFoundPage } from "@thecointech/shared";
import React from "react";
import { Loader, Container, Header, Segment } from "semantic-ui-react";
import { FormattedMessage, defineMessages } from "react-intl";

const translations = defineMessages({
  loading: {
    defaultMessage: 'Loading article...',
    description: 'site.blog.loading: Message shown while loading a blog article'
  }
});

export const ArticleNotFoundPage = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) {
    return <NotFoundPage />;
  }

  return (
    <Container text style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <Segment basic textAlign="center" padded="very">
        <Loader active inline="centered" size="large">
          <Header size="small" style={{ marginTop: "1rem" }}>
            <FormattedMessage {...translations.loading} />
          </Header>
        </Loader>
      </Segment>
    </Container>
  );
};
