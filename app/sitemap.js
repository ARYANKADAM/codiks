import { siteConfig } from "@/config/site";

export default function sitemap() {
  return [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/sign-up`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteConfig.url}/sign-in`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}