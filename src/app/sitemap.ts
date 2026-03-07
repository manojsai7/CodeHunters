import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://codehunters.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/courses`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];
  let projectRoutes: MetadataRoute.Sitemap = [];

  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    courseRoutes = courses.map((c) => ({
      url: `${BASE_URL}/courses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    projectRoutes = projects.map((p) => ({
      url: `${BASE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable — return static routes only
  }

  return [...staticRoutes, ...courseRoutes, ...projectRoutes];
}
