import React from "react";
import { Switch, Route } from "react-router";
import { ArticleList } from "./ArticleList";
import { Article } from "./Article";

export const Blog = () => {
  return (
      <Switch>
        <Route path="/blog/category/:category" component={ArticleList} />
        <Route path="/blog/:articleId" component={Article} />
        <Route path={""} exact={true} component={ArticleList} />
      </Switch>
  );
}
