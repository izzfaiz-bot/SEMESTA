// prisma/seed.ts
import { prisma } from "@/lib/prisma";
import { seedCategories } from "./categories";
import { seedPhenomena } from "./phenomena";
import { seedLearningMaterials } from "./learning-materials";
import { seedQuestions } from "./seed-questions";

async function main() {
  console.log("Memulai seed SEMESTA...");

  await seedCategories();
  await seedPhenomena();
  await seedLearningMaterials();
  await seedQuestions();

  console.log("Semua seed SEMESTA berhasil dijalankan.");
}

main()
  .catch((error) => {
    console.error("Gagal menjalankan seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });