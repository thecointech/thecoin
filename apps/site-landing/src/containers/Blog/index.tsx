import React from "react";
import { Routes, Route } from "react-router";
import { ArticleList } from "./ArticleList";
import { Article } from "./Article";

export const Blog = () => {
  return (
      <Routes>
        <Route path="/category/:category" element={<ArticleList />} />
        <Route path="/:articleId" element={<Article />} />
        <Route path={""} element={<ArticleList />} />
      </Routes>
  );
}
