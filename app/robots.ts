import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.koruapp.xyz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/chat/",
          "/chats",
          "/notifications",
          "/profile/edit",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
