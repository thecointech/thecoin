import { createClient } from "@thecointech/site-prismic/client";
import { writeFileSync } from "fs";

const client = createClient({}, false);
const articles = await client.getAllByType("article")
const faqs = await client.getAllByType("faq")

writeFileSync("./@prismicio/mock.articles.json", JSON.stringify(articles, null, 2))
writeFileSync("./@prismicio/mock.faqs.json", JSON.stringify(faqs, null, 2))


