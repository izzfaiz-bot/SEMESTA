
// prisma/seed-questions.ts
import "dotenv/config";
import { prisma } from "@/lib/prisma";

const phenomenonSlug = "tanah-longsor";

type SeedQuestion = {
  text: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  options: [string, string, string, string];
  correctIndex: number;
};

const questions: SeedQuestion[] = [
  // ==========================================
  // MUDAH — 10 SOAL
  // ==========================================
  {
    text: "Apa yang dimaksud dengan tanah longsor?",
    explanation: "Tanah longsor adalah peristiwa bergeraknya tanah atau batuan menuruni lereng.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Tanah atau batuan bergerak menuruni lereng",
      "Air mengalir dari sungai menuju laut",
      "Awan bergerak mengikuti arah angin",
      "Pasir terbawa ombak menuju pantai",
    ],
    correctIndex: 0,
  },
  {
    text: "Kondisi cuaca apa yang dapat meningkatkan risiko tanah longsor?",
    explanation: "Hujan deras yang berlangsung lama dapat membuat tanah semakin basah dan mengurangi kestabilan lereng.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Cuaca cerah sepanjang hari",
      "Hujan deras yang berlangsung lama",
      "Langit cerah tanpa awan",
      "Udara sejuk pada pagi hari",
    ],
    correctIndex: 1,
  },
  {
    text: "Apa manfaat akar pohon bagi tanah di lereng?",
    explanation: "Akar membantu mengikat partikel tanah sehingga dapat mendukung kestabilan lereng.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Membuat tanah selalu kering",
      "Menghentikan semua hujan",
      "Membantu mengikat tanah",
      "Membuat lereng semakin curam",
    ],
    correctIndex: 2,
  },
  {
    text: "Di tempat seperti apa tanah longsor sering terjadi?",
    explanation: "Tanah longsor sering terjadi di lereng atau daerah berbukit, terutama ketika tanah tidak stabil.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Lapangan datar yang kering",
      "Lantai rumah yang rata",
      "Jalan datar di tengah kota",
      "Lereng bukit yang tidak stabil",
    ],
    correctIndex: 3,
  },
  {
    text: "Manakah yang termasuk tanda peringatan kemungkinan tanah longsor?",
    explanation: "Retakan baru pada tanah atau lereng dapat menjadi tanda pergerakan tanah yang perlu diwaspadai.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Muncul retakan baru pada tanah",
      "Daun berguguran pada musim kemarau",
      "Matahari terbit dari arah timur",
      "Air sungai mengalir seperti biasa",
    ],
    correctIndex: 0,
  },
  {
    text: "Mengapa menebang banyak pohon di lereng dapat meningkatkan risiko longsor?",
    explanation: "Ketika pohon berkurang, tanah kehilangan sebagian dukungan akar yang membantu menahannya.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Pohon membuat tanah selalu bergerak",
      "Tanah kehilangan sebagian penguat dari akar",
      "Akar pohon menghasilkan hujan deras",
      "Pohon membuat semua batuan menjadi lunak",
    ],
    correctIndex: 1,
  },
  {
    text: "Apa yang sebaiknya dilakukan jika hujan deras berlangsung lama di daerah lereng?",
    explanation: "Kita perlu meningkatkan kewaspadaan, mengikuti peringatan petugas, dan menjauhi area yang dinilai berbahaya.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Bermain di dekat tebing",
      "Mengabaikan semua peringatan",
      "Memperhatikan informasi dan peringatan petugas",
      "Berdiri di bawah lereng untuk mengamati tanah",
    ],
    correctIndex: 2,
  },
  {
    text: "Apa yang sebaiknya dilakukan jika melihat tanah mulai bergerak di dekat rumah?",
    explanation: "Segera menjauh ke tempat aman dan beri tahu orang dewasa atau petugas. Jangan mendekati tanah yang bergerak.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Mendekat untuk mengambil foto",
      "Bermain di dekat tanah yang bergerak",
      "Menggali tanah agar bergerak lebih cepat",
      "Menjauh ke tempat aman dan memberi tahu orang dewasa",
    ],
    correctIndex: 3,
  },
  {
    text: "Apa yang dapat terjadi jika tanah longsor menutupi jalan?",
    explanation: "Material longsor dapat menghalangi jalan dan membuat perjalanan menjadi sulit atau berbahaya.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Jalan dapat tertutup tanah dan batuan",
      "Jalan otomatis menjadi lebih lebar",
      "Semua kendaraan menjadi lebih cepat",
      "Hujan langsung berhenti",
    ],
    correctIndex: 0,
  },
  {
    text: "Siapa yang sebaiknya diberi tahu ketika ditemukan tanda bahaya longsor?",
    explanation: "Orang dewasa yang bertanggung jawab dan petugas setempat dapat membantu melaporkan serta menangani potensi bahaya.",
    difficulty: "EASY",
    points: 500,
    options: [
      "Hanya teman yang sedang bermain",
      "Orang dewasa tepercaya atau petugas setempat",
      "Orang yang tidak mengetahui keadaan",
      "Tidak perlu memberi tahu siapa pun",
    ],
    correctIndex: 1,
  },

  // ==========================================
  // SEDANG — 10 SOAL
  // ==========================================
  {
    text: "Mengapa tanah di lereng dapat menjadi lebih mudah longsor setelah hujan deras?",
    explanation: "Air yang meresap dapat menambah berat tanah dan memengaruhi kekuatan tanah untuk tetap berada di lereng.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Tanah kehilangan seluruh beratnya",
      "Gravitasi berhenti bekerja",
      "Tanah menjadi selalu kering",
      "Tanah menjadi lebih berat dan kestabilannya dapat berkurang",
    ],
    correctIndex: 3,
  },
  {
    text: "Dua lereng memiliki kemiringan serupa. Lereng A ditumbuhi banyak pohon, sedangkan lereng B gundul. Apa kesimpulan yang paling tepat?",
    explanation: "Akar pohon dapat membantu mengikat tanah. Karena itu, lereng gundul mungkin memiliki risiko tambahan, tetapi risiko sebenarnya juga dipengaruhi air, jenis tanah, dan faktor lainnya.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Lereng B pasti tidak akan longsor",
      "Kedua lereng pasti memiliki risiko yang sama",
      "Lereng B dapat memiliki risiko tambahan karena kehilangan dukungan akar",
      "Pohon tidak memiliki hubungan dengan kestabilan tanah",
    ],
    correctIndex: 2,
  },
  {
    text: "Mengapa saluran air di dekat lereng perlu dijaga agar tidak tersumbat?",
    explanation: "Saluran yang berfungsi baik membantu mengalirkan air. Penumpukan air yang tidak terkendali dapat memengaruhi kestabilan lereng.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Agar air dapat mengalir dengan baik dan tidak menumpuk secara berlebihan",
      "Agar seluruh air masuk ke dalam tanah",
      "Agar lereng menjadi semakin curam",
      "Agar hujan tidak turun lagi",
    ],
    correctIndex: 0,
  },
  {
    text: "Setelah hujan deras, seorang anak melihat retakan baru di tanah dekat lereng. Apa tindakan paling tepat?",
    explanation: "Retakan baru dapat menjadi tanda ketidakstabilan. Anak tersebut sebaiknya menjauh, memberi tahu orang dewasa, dan tidak memeriksa retakan dari dekat.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Melompat di atas retakan",
      "Menjauh dan melaporkannya kepada orang dewasa",
      "Menggali retakan untuk melihat kedalamannya",
      "Mengajak teman mendekati retakan",
    ],
    correctIndex: 1,
  },
  {
    text: "Bagaimana penanaman pohon dapat membantu menjaga lingkungan di daerah berbukit?",
    explanation: "Vegetasi membantu melindungi permukaan tanah dan akar dapat memperkuat sebagian lapisan tanah. Namun, penanaman pohon bukan jaminan bahwa longsor tidak akan terjadi.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Membuat semua lereng kebal terhadap longsor",
      "Menghentikan seluruh air hujan",
      "Membantu melindungi permukaan dan mengikat sebagian tanah",
      "Menghilangkan gaya gravitasi",
    ],
    correctIndex: 2,
  },
  {
    text: "Sebuah rumah berada dekat lereng yang mulai retak. Mengapa penghuni rumah perlu memperhatikan peringatan petugas?",
    explanation: "Retakan dapat menandakan perubahan kondisi lereng. Petugas dapat membantu menilai bahaya dan menentukan tindakan keselamatan.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Agar penghuni bisa mendekati retakan",
      "Agar rumah dapat dibangun lebih dekat ke tebing",
      "Agar penghuni tidak perlu bersiap",
      "Agar penghuni dapat menjauhi bahaya sesuai arahan",
    ],
    correctIndex: 3,
  },
  {
    text: "Mengapa membuang sampah ke saluran air di daerah berbukit merupakan kebiasaan yang buruk?",
    explanation: "Sampah dapat menyumbat saluran sehingga aliran air terganggu. Pengelolaan sampah yang baik membantu menjaga drainase, meskipun tidak menghilangkan semua risiko longsor.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Sampah dapat menyumbat saluran dan mengganggu aliran air",
      "Sampah membuat tanah selalu kuat",
      "Sampah menghentikan semua hujan",
      "Sampah membuat akar pohon tumbuh lebih dalam",
    ],
    correctIndex: 0,
  },
  {
    text: "Mengapa membangun rumah tepat di bawah lereng yang tidak stabil dapat berbahaya?",
    explanation: "Tanah, batuan, atau material lain yang bergerak menuruni lereng dapat mencapai bangunan di bawahnya.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Karena rumah akan selalu terkena petir",
      "Karena material longsor dapat menimpa bangunan",
      "Karena semua lereng selalu bergerak setiap hari",
      "Karena bangunan membuat hujan berhenti",
    ],
    correctIndex: 1,
  },
  {
    text: "Ketika hujan deras, air dari lereng mengalir deras membawa tanah. Apa yang sebaiknya dilakukan warga?",
    explanation: "Aliran air yang membawa tanah dapat menjadi tanda kondisi berbahaya. Warga perlu menjauh dari area tersebut dan mengikuti arahan petugas.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Bermain di aliran air",
      "Berdiri di bawah lereng untuk mengamati",
      "Menjauh dari area berbahaya dan melapor kepada petugas",
      "Menghalangi aliran dengan berdiri di depannya",
    ],
    correctIndex: 2,
  },
  {
    text: "Manakah kegiatan yang paling membantu mengurangi risiko longsor di lingkungan perbukitan?",
    explanation: "Menjaga vegetasi, merawat saluran air, menghindari pembangunan di tempat berisiko, dan memperhatikan peringatan merupakan upaya yang saling mendukung.",
    difficulty: "MEDIUM",
    points: 1000,
    options: [
      "Menebang semua pohon di lereng",
      "Membuang sampah ke saluran air",
      "Menggali lereng tanpa perencanaan",
      "Menjaga vegetasi dan merawat saluran air",
    ],
    correctIndex: 3,
  },

  // ==========================================
  // SULIT — 10 SOAL
  // Tetap sesuai kemampuan kelas 4–6 SD
  // ==========================================
  {
    text: "Di sebuah bukit, hujan turun berjam-jam. Tanah mulai retak dan air keluar dari sisi lereng yang sebelumnya kering. Apa kesimpulan paling tepat?",
    explanation: "Retakan baru dan perubahan aliran air dapat menjadi tanda ketidakstabilan lereng, terutama setelah hujan lama. Area itu perlu dihindari dan dilaporkan kepada petugas.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Bukit pasti aman karena masih berdiri",
      "Tanah pasti berubah menjadi batu",
      "Lereng mungkin tidak stabil dan perlu diwaspadai",
      "Air yang keluar membuktikan tidak ada bahaya",
    ],
    correctIndex: 2,
  },
  {
    text: "Lereng A memiliki vegetasi yang terjaga dan saluran air yang baik. Lereng B gundul dan salurannya tersumbat. Jika hujan deras turun, apa yang paling masuk akal?",
    explanation: "Lereng B memiliki faktor risiko tambahan karena vegetasinya berkurang dan aliran airnya terganggu. Namun, kondisi itu belum cukup untuk memastikan bahwa longsor pasti terjadi.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Lereng B pasti aman karena tidak memiliki pohon",
      "Lereng B memiliki faktor risiko tambahan yang perlu ditangani",
      "Lereng A pasti tidak mungkin longsor",
      "Kondisi saluran air tidak berpengaruh pada lereng",
    ],
    correctIndex: 1,
  },
  {
    text: "Sebuah desa berada di daerah berbukit. Warga ingin mengurangi risiko longsor sebelum musim hujan. Tindakan mana yang paling tepat?",
    explanation: "Persiapan sebelum musim hujan dapat mencakup pemeriksaan saluran air, penjagaan vegetasi, pemantauan tanda bahaya, dan mengikuti arahan petugas.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Menunggu sampai tanah mulai bergerak",
      "Menebang semua pohon agar lereng terlihat jelas",
      "Membiarkan saluran air tersumbat",
      "Merawat saluran air, menjaga vegetasi, dan mengenali tanda bahaya",
    ],
    correctIndex: 3,
  },
  {
    text: "Mengapa kita tidak boleh menyimpulkan bahwa semua lereng yang ditumbuhi pohon pasti aman dari longsor?",
    explanation: "Pohon dapat membantu kestabilan tanah, tetapi longsor juga dipengaruhi kemiringan, jenis tanah, air, batuan, dan kondisi lain.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Karena risiko longsor dipengaruhi banyak faktor, bukan hanya keberadaan pohon",
      "Karena pohon selalu menyebabkan longsor",
      "Karena tanah di semua lereng memiliki sifat yang sama",
      "Karena hujan tidak memengaruhi kestabilan lereng",
    ],
    correctIndex: 0,
  },
  {
    text: "Setelah hujan deras, seorang warga melihat batu kecil dan tanah mulai berjatuhan dari lereng. Apa tindakan paling aman?",
    explanation: "Jatuhan material dapat menjadi tanda bahaya. Warga perlu menjauhi lereng, memperingatkan orang lain jika aman dilakukan, dan melapor kepada petugas.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Mendekati lereng untuk mengambil batu",
      "Menjauh dari lereng dan memberi tahu petugas",
      "Berdiri tepat di bawah bagian yang runtuh",
      "Mengajak anak-anak bermain di sana",
    ],
    correctIndex: 1,
  },
  {
    text: "Dua daerah mengalami hujan dengan durasi serupa. Daerah pertama memiliki lereng landai, sedangkan daerah kedua memiliki lereng curam dan tanah yang mudah bergerak. Apa yang dapat disimpulkan?",
    explanation: "Kemiringan dan jenis tanah dapat memengaruhi kestabilan lereng. Namun, informasi tersebut saja belum cukup untuk menentukan kepastian atau besarnya risiko tanpa mengetahui kondisi lainnya.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Kedua daerah pasti mengalami longsor",
      "Daerah pertama pasti lebih berbahaya",
      "Daerah kedua memiliki faktor yang dapat meningkatkan risiko longsor",
      "Durasi hujan adalah satu-satunya faktor yang perlu diperhatikan",
    ],
    correctIndex: 2,
  },
  {
    text: "Sebuah saluran air di lereng tersumbat daun dan sampah. Hujan deras diperkirakan akan turun. Mengapa saluran itu perlu ditangani dengan aman sebelum kondisi memburuk?",
    explanation: "Sumbatan dapat mengganggu aliran air dan menyebabkan air menumpuk atau mengalir ke tempat yang tidak semestinya. Penanganan harus dilakukan oleh orang yang mampu dan aman.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Agar air hujan berhenti turun",
      "Agar lereng berubah menjadi datar",
      "Agar semua tanah di lereng mengering seketika",
      "Agar aliran air tidak terganggu oleh sumbatan",
    ],
    correctIndex: 3,
  },
  {
    text: "Seorang anak melihat retakan baru di jalan dekat lereng. Temannya mengajak mereka mendekat untuk melihatnya. Apa pilihan terbaik?",
    explanation: "Retakan baru di dekat lereng bisa berbahaya. Anak-anak sebaiknya tidak mendekat, melainkan menjauh dan melaporkan temuan tersebut kepada orang dewasa.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Menolak mendekat, menjauh, dan memberi tahu orang dewasa",
      "Mendekat agar dapat mengukur retakan",
      "Melompat di sekitar retakan",
      "Mengajak lebih banyak teman untuk memeriksa",
    ],
    correctIndex: 0,
  },
  {
    text: "Warga sudah menanam pohon di lereng, tetapi saluran air tetap tersumbat dan retakan baru muncul. Apa langkah yang paling tepat?",
    explanation: "Penanaman pohon saja tidak cukup untuk memastikan lereng aman. Retakan baru perlu dilaporkan dan area berbahaya dihindari sambil mengikuti arahan petugas.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Menganggap lereng pasti aman karena sudah ditanami",
      "Menghindari area tersebut dan melaporkan tanda bahaya kepada petugas",
      "Menggali retakan tanpa bantuan",
      "Membiarkan saluran tersumbat selamanya",
    ],
    correctIndex: 1,
  },
  {
    text: "Mengapa rencana evakuasi penting bagi warga yang tinggal di daerah rawan longsor?",
    explanation: "Rencana evakuasi membantu warga mengetahui jalur dan tempat aman serta tindakan yang harus dilakukan ketika ada peringatan bahaya.",
    difficulty: "HARD",
    points: 1500,
    options: [
      "Agar warga dapat mendekati lokasi longsor",
      "Agar warga tidak perlu memperhatikan peringatan",
      "Agar warga mengetahui cara menuju tempat aman saat diperlukan",
      "Agar longsor tidak mungkin terjadi",
    ],
    correctIndex: 2,
  },
];

function questionId(index: number) {
  return `a1000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

function optionId(questionIndex: number, optionIndex: number) {
  return `b${String(questionIndex + 1).padStart(7, "0")}-0000-4000-8000-${String(optionIndex + 1).padStart(12, "0")}`;
}

export async function seedQuestions() {
  const phenomenon = await prisma.phenomenon.findUnique({
    where: { slug: phenomenonSlug },
    select: { id: true, title: true },
  });

  if (!phenomenon) {
    throw new Error(
      `Fenomena "${phenomenonSlug}" tidak ditemukan. Jalankan seed fenomena terlebih dahulu.`,
    );
  }

  const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  let created = 0;
  let updated = 0;

  for (const [index, item] of questions.entries()) {
    const id = questionId(index);

    const existing = await prisma.question.findUnique({
      where: { id },
      select: { id: true },
    });

    await prisma.question.upsert({
      where: { id },
      create: {
        id,
        phenomenonId: phenomenon.id,
        source: "WEBSITE",
        text: item.text,
        explanation: item.explanation,
        difficulty: item.difficulty,
        points: item.points,
        isPublished: true,
        isArchived: false,
      },
      update: {
        phenomenonId: phenomenon.id,
        source: "WEBSITE",
        text: item.text,
        explanation: item.explanation,
        difficulty: item.difficulty,
        points: item.points,
        isPublished: true,
        isArchived: false,
      },
    });

    for (const [optionIndex, text] of item.options.entries()) {
      const idOption = optionId(index, optionIndex);

      await prisma.questionOption.upsert({
        where: { id: idOption },
        create: {
          id: idOption,
          questionId: id,
          text,
          isCorrect: optionIndex === item.correctIndex,
          sortOrder: optionIndex,
        },
        update: {
          questionId: id,
          text,
          isCorrect: optionIndex === item.correctIndex,
          sortOrder: optionIndex,
        },
      });
    }

    counts[item.difficulty]++;
    if (existing) updated++;
    else created++;
  }

  console.log(`\nSeed soal ${phenomenon.title} selesai.`);
  console.log(`Soal baru: ${created}`);
  console.log(`Soal diperbarui: ${updated}`);
  console.log(`Mudah: ${counts.EASY}`);
  console.log(`Sedang: ${counts.MEDIUM}`);
  console.log(`Sulit: ${counts.HARD}`);
  console.log(`Total: ${questions.length}`);
}
