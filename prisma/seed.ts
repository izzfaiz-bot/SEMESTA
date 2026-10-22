// prisma/seed.ts
import { prisma } from "@/lib/prisma";
import { seedCategories } from "./categories";

async function main() {
  console.log("Memulai seed kategori SEMESTA...");

  await seedCategories();

  console.log("Seed kategori SEMESTA berhasil dijalankan.");
}

main()
  .catch((error) => {
    console.error("Gagal menjalankan seed kategori:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });