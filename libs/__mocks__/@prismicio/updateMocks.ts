import { createClient as baseCreateClient } from "@prismicio/client";
import { writeFileSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sm = JSON.parse(readFileSync(resolve(__dirname, "../../site-prismic/slicemachine.config.json"), "utf8"));

const client = baseCreateClient(sm.apiEndpoint || sm.repositoryName, {
  fetchOptions: {
    cache: "no-store",
  }
});

const articles = await client.getAllByType("article", {lang: `*`})
const faqs = await client.getAllByType("faq", {lang: `*`})

const cleanedArticles = articles.map(article => ({...article, href: undefined}))
const cleanedFaqs = faqs.map(faq => ({...faq, href: undefined}))
writeFileSync(resolve(__dirname, "./mock.articles.json"), JSON.stringify(cleanedArticles, null, 2))
writeFileSync(resolve(__dirname, "./mock.faqs.json"), JSON.stringify(cleanedFaqs, null, 2))
