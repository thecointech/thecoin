import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Container, Header, Segment, Button, Loader, Message, Label, Icon } from 'semantic-ui-react';
import { log } from '@thecointech/logging';
import { Prismic } from '../../components/Prismic';
import { Article } from '../Blog/Article';
import type { ArticleDocument } from '@thecointech/site-prismic/types';
import { LanguageProviderReducer } from '@thecointech/redux-intl';

export const PrismicPreview: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [documentUid, setDocumentUid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const api = Prismic.useApi();
  const data = Prismic.useData();
  const { locale } = LanguageProviderReducer.useData();

  useEffect(() => {
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');

    if (!token) {
      setError('No preview token found');
      setIsLoading(false);
      return;
    }

    const documentId = urlParams.get('documentId');
    if (!documentId) {
      setError('No document ID found');
      setIsLoading(false);
      return;
    }
    setDocumentId(documentId);
    setToken(token);
  }, [location.search])

  const handleRefresh = useCallback(async () => {
    if (!token || !documentId) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching document', documentId, token);
      // Add cache-busting parameter to force fresh fetch
      const result = await data.client.getByID(documentId, {
        ref: token,
        fetchOptions: {
          cache: 'no-store'
        }
      });
      if (result) {
        api.setDocument(result as ArticleDocument);
        setDocumentUid(result.uid);
        log.info('Preview refreshed successfully');
      }
      else {
        setError('Document not found');
      }
    } catch (err) {
      log.error(err, 'Failed to refresh preview');
      setError(`Error on refresh preview: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, token]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleExitPreview = () => {
    navigate('/blog');
  };


  if (isLoading) {
    return (
      <Container text style={{ paddingTop: '2rem' }}>
        <Segment textAlign="center">
          <Loader active inline="centered">
            Loading preview...
          </Loader>
        </Segment>
      </Container>
    );
  }

  if (error) {
    return (
      <Container text style={{ paddingTop: '2rem' }}>
        <Header size='medium'>Preview Error</Header>
        <Message negative>
          <Message.Header>Failed to load preview</Message.Header>
          <p>{error}</p>
        </Message>
        <Segment textAlign="center" style={{ marginTop: '2rem' }}>
          <Button primary onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </Segment>
      </Container>
    );
  }

  // Check if article is loaded
  const articleLoaded = documentUid && data[locale].articles.has(documentUid);

  if (documentId && articleLoaded) {
    return (
      <>
        {/* Preview Badge */}
        <Container fluid style={{
          backgroundColor: '#f39c12',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Container>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Label color="orange" size="large">
                  <Icon name="eye" />
                  PREVIEW MODE - Draft Content
                </Label>
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  This content is not published yet
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  icon
                  labelPosition='left'
                  onClick={handleExitPreview}
                  size="small"
                  primary
                >
                  <Icon name="close" />
                  Exit Preview
                </Button>
              </div>
            </div>
          </Container>
        </Container>

        {/* Render Article Component */}
        <Article articleId={documentUid} isPreview={true} />
      </>
    );
  }

  // Should never get here
  return null;
};
