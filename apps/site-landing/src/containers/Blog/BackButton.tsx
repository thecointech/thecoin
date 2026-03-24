
import React from "react";
import { FormattedMessage } from "react-intl";
import { Icon } from "semantic-ui-react";
import { defineMessages } from "react-intl";
import { useNavigate } from "react-router";

const translations = defineMessages({
  backLink: {
    defaultMessage: 'Go back',
    description: 'site.blog.backLink: Link to go back from article'
  },
});

export const BackButton = ({ isPreview = false }: { isPreview?: boolean }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (isPreview) {
      navigate('/blog');
    } else {
      navigate(-1);
    }
  };

  return (
    <a href="#" onClick={handleBack}>
      <Icon name="arrow left" />
      <FormattedMessage {...translations.backLink} />
    </a>
  )
}
