
 // prisma/learning-materials.ts
import { prisma } from "@/lib/prisma";

const learningMaterials = [
  {
    phenomenonSlug: "gempa-bumi",
    type: "VIDEO" as const,
    title: "Video Pembelajaran Gempa Bumi",
    description: "Video pengenalan fenomena alam untuk pembelajaran geologi.",
    url: "https://www.youtube.com/watch?v=fJC0swqdgXs",
    sortOrder: 1,
  },
  {
    phenomenonSlug: "gempa-bumi",
    type: "PPT" as const,
    title: "Materi Presentasi Gempa Bumi",
    description: "Materi presentasi tentang penyebab dan dampak gempa bumi.",
    url: "https://example.com/materi-gempa-bumi.pptx",
    sortOrder: 2,
  },
  {
    phenomenonSlug: "gunung-meletus",
    type: "VIDEO" as const,
    title: "Video Pembelajaran Gunung Meletus",
    description: "Video contoh untuk mempelajari aktivitas vulkanik.",
    url: "https://www.youtube.com/watch?v=fJC0swqdgXs",
    sortOrder: 1,
  },
  {
    phenomenonSlug: "gunung-meletus",
    type: "PPT" as const,
    title: "Materi Presentasi Gunung Meletus",
    description: "Materi presentasi tentang aktivitas gunung api.",
    url: "https://example.com/materi-gunung-meletus.pptx",
    sortOrder: 2,
  },
  {
    phenomenonSlug: "hujan",
    type: "VIDEO" as const,
    title: "Video Pembelajaran Hujan",
    description: "Video contoh untuk mempelajari fenomena hujan.",
    url: "https://www.youtube.com/watch?v=fJC0swqdgXs",
    sortOrder: 1,
  },
  {
    phenomenonSlug: "hujan",
    type: "PPT" as const,
    title: "Materi Presentasi Hujan",
    description: "Materi presentasi tentang proses terbentuknya hujan.",
    url: "https://example.com/materi-hujan.pptx",
    sortOrder: 2,
  },
  {
    phenomenonSlug: "siklus-air",
    type: "VIDEO" as const,
    title: "Video Pembelajaran Siklus Air",
    description: "Video contoh untuk memahami perjalanan air di Bumi.",
    url: "https://www.youtube.com/watch?v=fJC0swqdgXs",
    sortOrder: 1,
  },
  {
    phenomenonSlug: "siklus-air",
    type: "PPT" as const,
    title: "Materi Presentasi Siklus Air",
    description: "Materi presentasi tentang penguapan, kondensasi, dan presipitasi.",
    url: "https://example.com/materi-siklus-air.pptx",
    sortOrder: 2,
  },
  {
    phenomenonSlug: "gerhana-bulan",
    type: "VIDEO" as const,
    title: "Video Pembelajaran Gerhana Bulan",
    description: "Video contoh untuk mempelajari fenomena astronomi.",
    url: "https://www.youtube.com/watch?v=fJC0swqdgXs",
    sortOrder: 1,
  },
  {
    phenomenonSlug: "gerhana-bulan",
    type: "PPT" as const,
    title: "Materi Presentasi Gerhana Bulan",
    description: "Materi presentasi tentang proses terjadinya gerhana Bulan.",
    url: "https://example.com/materi-gerhana-bulan.pptx",
    sortOrder: 2,
  },
];

export async function seedLearningMaterials() {
  let createdCount = 0;
  let skippedCount = 0;

  for (const item of learningMaterials) {
    const phenomenon = await prisma.phenomenon.findUnique({
      where: { slug: item.phenomenonSlug },
      select: { id: true, title: true },
    });

    if (!phenomenon) {
      skippedCount++;
      console.log(
        `Dilewati: fenomena "${item.phenomenonSlug}" tidak ditemukan.`,
      );
      continue;
    }

    const existing = await prisma.learningMaterial.findFirst({
      where: {
        phenomenonId: phenomenon.id,
        type: item.type,
        url: item.url,
      },
      select: { id: true },
    });

    if (existing) {
      skippedCount++;
      console.log(`Dilewati: materi "${item.title}" sudah tersedia.`);
      continue;
    }

    await prisma.learningMaterial.create({
      data: {
        phenomenonId: phenomenon.id,
        type: item.type,
        title: item.title,
        description: item.description,
        url: item.url,
        sortOrder: item.sortOrder,
        isPublished: true,
      },
    });

    createdCount++;
    console.log(
      `Ditambahkan: ${item.type} "${item.title}" pada ${phenomenon.title}.`,
    );
  }

  console.log(
    `Seed materi selesai. Ditambahkan: ${createdCount}, dilewati: ${skippedCount}.`,
  );
}
