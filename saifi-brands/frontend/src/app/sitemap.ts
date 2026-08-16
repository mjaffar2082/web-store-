import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://saifibrands.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://saifibrands.com/shop", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://saifibrands.com/category/electronics", lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: "https://saifibrands.com/category/clothing", lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: "https://saifibrands.com/category/home-living", lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];
}
