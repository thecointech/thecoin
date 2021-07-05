import { ApplicationRootState } from 'types'

const selectArticles = (state: ApplicationRootState) =>
  state.documents ? state.documents["articles"] : [];

export { selectArticles };
