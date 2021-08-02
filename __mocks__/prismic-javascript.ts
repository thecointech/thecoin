import type ApiSearchResponse from 'prismic-javascript/d.ts/ApiSearchResponse'

class MockClient {
  // TODO: we should return some mocked data at least
  query() : ApiSearchResponse {
    return {
      page: 0,
      results_per_page: 10,
      results_size: 0,
      total_results_size: 0,
      total_pages: 0,
      next_page: '',
      prev_page: '',
      results: [],
    }
   }
}

export default {
  client: () => new MockClient()
}
