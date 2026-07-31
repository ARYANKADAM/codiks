import { siteConfig } from "@/config/site";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard", "/battle", "/quiz", "/api"] },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}