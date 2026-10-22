// prisma/categories.ts
import { prisma } from "@/lib/prisma";

const categories = [
  {
    name: "GEOLOGI",
    slug: "geologi",
    subtitle: "Rahasia Bumi",
    description: "Jelajahi gunung, batuan, dan gempa bumi!",
    topics: ["Gunung", "Gempa", "Batuan"],
    emoji: "🌋",
    sortOrder: 1,
    isPublished: true,
  },
  {
    name: "METEOROLOGI",
    slug: "meteorologi",
    subtitle: "Petualangan Cuaca",
    description: "Cari tahu rahasia hujan, awan, dan badai!",
    topics: ["Hujan", "Awan", "Angin"],
    emoji: "🌦️",
    sortOrder: 2,
    isPublished: true,
  },
  {
    name: "HIDROLOGI",
    slug: "hidrologi",
    subtitle: "Dunia Air",
    description: "Ikuti perjalanan air dari sungai ke awan!",
    topics: ["Sungai", "Laut", "Siklus Air"],
    emoji: "🌊",
    sortOrder: 3,
    isPublished: true,
  },
  {
    name: "ASTRONOMI",
    slug: "astronomi",
    subtitle: "Jelajah Antariksa",
    description: "Terbang menjelajahi planet dan bintang!",
    topics: ["Planet", "Bintang", "Galaksi"],
    emoji: "🪐",
    sortOrder: 4,
    isPublished: true,
  },
];

export async function seedCategories() {
  let createdCount = 0;
  let skippedCount = 0;

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
      select: { id: true },
    });

    if (existing) {
      skippedCount++;
      console.log(`Dilewati: kategori ${category.name} sudah tersedia.`);
      continue;
    }

    await prisma.category.create({
      data: category,
    });

    createdCount++;
    console.log(`Ditambahkan: kategori ${category.name}.`);
  }

  console.log(
    `Seed kategori selesai. Ditambahkan: ${createdCount}, dilewati: ${skippedCount}.`,
  );
}