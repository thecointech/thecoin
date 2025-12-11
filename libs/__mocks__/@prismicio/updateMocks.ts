import { createClient } from "@thecointech/site-prismic/client";
import { writeFileSync } from "fs";

const client = createClient({}, false);
const articles = await client.getAllByType("article", {lang: `*`})
const faqs = await client.getAllByType("faq", {lang: `*`})

const cleanedArticles = articles.map(article => ({...article, href: undefined}))
const cleanedFaqs = faqs.map(faq => ({...faq, href: undefined}))
writeFileSync("./@prismicio/mock.articles.json", JSON.stringify(cleanedArticles, null, 2))
writeFileSync("./@prismicio/mock.faqs.json", JSON.stringify(cleanedFaqs, null, 2))


