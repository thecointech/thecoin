import React from "react";
import type { RouteObject } from "react-router";
import { ArticleList } from "./ArticleList";
import { Article } from "./Article";
import { ComingSoon } from "./ComingSoon";

export const blogRoutes = [
  { path: 'coming-soon', element: <ComingSoon /> },
  { path: 'category/:category', element: <ArticleList /> },
  { path: ':articleId', element: <Article /> },
  { index: true, element: <ArticleList /> },
] satisfies RouteObject[];
