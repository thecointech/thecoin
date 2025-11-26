import React from "react";
import type { RouteObject } from "react-router";
import { ArticleList } from "./ArticleList";
import { Article } from "./Article";

export const blogRoutes = [
  { path: 'category/:category', element: <ArticleList /> },
  { path: ':articleId', element: <Article /> },
  { index: true, element: <ArticleList /> },
] satisfies RouteObject[];
