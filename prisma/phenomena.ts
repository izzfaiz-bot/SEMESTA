// prisma/phenomena.ts

import { prisma } from "@/lib/prisma";

const phenomena = [
  {
    categorySlug: "geologi",
    title: "Gempa Bumi",
    slug: "gempa-bumi",
    description: "Pelajari penyebab, proses terjadinya, dan dampak gempa bumi.",
    sortOrder: 1,
  },
  {
    categorySlug: "geologi",
    title: "Gunung Meletus",
    slug: "gunung-meletus",
    description: "Kenali proses aktivitas vulkanik hingga terjadinya letusan gunung api.",
    sortOrder: 2,
  },
  {
    categorySlug: "geologi",
    title: "Tanah Longsor",
    slug: "tanah-longsor",
    description: "Pelajari penyebab, dampak, dan upaya pencegahan tanah longsor.",
    sortOrder: 3,
  },
  {
    categorySlug: "meteorologi",
    title: "Hujan",
    slug: "hujan",
    description: "Pelajari proses terbentuknya hujan dalam siklus air.",
    sortOrder: 1,
  },
  {
    categorySlug: "meteorologi",
    title: "Kekeringan",
    slug: "kekeringan",
    description: "Kenali penyebab, dampak, dan cara menghadapi kekeringan.",
    sortOrder: 2,
  },
  {
    categorySlug: "meteorologi",
    title: "Angin Puting Beliung",
    slug: "angin-puting-beliung",
    description: "Pelajari proses terbentuknya angin berputar yang kuat.",
    sortOrder: 3,
  },
  {
    categorySlug: "meteorologi",
    title: "Pelangi",
    slug: "pelangi",
    description: "Temukan bagaimana cahaya Matahari membentuk pelangi melalui tetesan air.",
    sortOrder: 4,
  },
  {
    categorySlug: "hidrologi",
    title: "Banjir",
    slug: "banjir",
    description: "Pahami penyebab banjir, dampaknya, dan langkah mitigasinya.",
    sortOrder: 1,
  },
  {
    categorySlug: "hidrologi",
    title: "Abrasi",
    slug: "abrasi",
    description: "Pelajari proses pengikisan pantai akibat gelombang dan arus laut.",
    sortOrder: 2,
  },
  {
    categorySlug: "hidrologi",
    title: "Siklus Air",
    slug: "siklus-air",
    description: "Ikuti perjalanan air melalui penguapan, kondensasi, dan presipitasi.",
    sortOrder: 3,
  },
  {
    categorySlug: "astronomi",
    title: "Gerhana Bulan",
    slug: "gerhana-bulan",
    description: "Pelajari bagaimana bayangan Bumi menyebabkan gerhana Bulan.",
    sortOrder: 1,
  },
  {
    categorySlug: "astronomi",
    title: "Gerhana Matahari",
    slug: "gerhana-matahari",
    description: "Kenali fenomena ketika Bulan berada di antara Matahari dan Bumi.",
    sortOrder: 2,
  },
  {
    categorySlug: "astronomi",
    title: "Siang dan Malam",
    slug: "siang-dan-malam",
    description: "Pahami bagaimana rotasi Bumi menyebabkan pergantian siang dan malam.",
    sortOrder: 3,
  },
];

export async function seedPhenomena() {
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of phenomena) {
    const existing = await prisma.phenomenon.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });

    if (existing) {
      skippedCount++;
      console.log(`Dilewati: ${item.title} sudah tersedia.`);
      continue;
    }

    const category = await prisma.category.findUnique({
      where: { slug: item.categorySlug },
      select: { id: true },
    });

    if (!category) {
      throw new Error(
        `Kategori dengan slug "${item.categorySlug}" tidak ditemukan.`,
      );
    }

    await prisma.phenomenon.create({
      data: {
        categoryId: category.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        sortOrder: item.sortOrder,
        isPublished: true,
      },
    });

    createdCount++;
    console.log(`Ditambahkan: ${item.title}.`);
  }

  console.log(
    `Seed fenomena selesai. Ditambahkan: ${createdCount}, dilewati: ${skippedCount}.`,
  );
}
