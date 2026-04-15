import type { ArticleDocument } from "@thecointech/site-prismic/types";

/**
 * Select recommended articles based on category matching and recency.
 * 
 * Strategy:
 * 1. Prioritize articles from the same category as the current article
 * 2. Fill remaining slots with recent articles from other categories
 * 3. Exclude the current article
 * 
 * @param currentArticle - The article being viewed
 * @param allArticles - All available articles to choose from
 * @param limit - Maximum number of recommendations (default: 3)
 * @returns Array of recommended articles
 */
export function getRecommendedArticles(
  currentArticle: ArticleDocument,
  allArticles: ArticleDocument[],
  limit: number = 3
): ArticleDocument[] {
  // Exclude current article
  const candidates = allArticles.filter(article => article.id !== currentArticle.id);
  
  if (candidates.length === 0) {
    return [];
  }

  // Get primary category of current article
  const primaryCategory = currentArticle.data.categories[0]?.category;
  
  // Split into same-category and other articles
  const sameCategoryArticles: ArticleDocument[] = [];
  const otherArticles: ArticleDocument[] = [];
  
  candidates.forEach(article => {
    const hasMatchingCategory = primaryCategory && 
      article.data.categories.some(cat => cat.category === primaryCategory);
    
    if (hasMatchingCategory) {
      sameCategoryArticles.push(article);
    } else {
      otherArticles.push(article);
    }
  });

  // Sort by publication date (most recent first)
  const sortByDate = (a: ArticleDocument, b: ArticleDocument) => {
    const dateA = a.data.publication_date ? new Date(a.data.publication_date).getTime() : 0;
    const dateB = b.data.publication_date ? new Date(b.data.publication_date).getTime() : 0;
    return dateB - dateA;
  };

  sameCategoryArticles.sort(sortByDate);
  otherArticles.sort(sortByDate);

  // Combine: prioritize same category, then fill with others
  const recommended = [
    ...sameCategoryArticles.slice(0, limit),
    ...otherArticles.slice(0, Math.max(0, limit - sameCategoryArticles.length))
  ];

  return recommended.slice(0, limit);
}
