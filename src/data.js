import HeroImage from "/assets/hero-img.webp";

const Image = {
  HeroImage,
};

export default Image;

import Tools1 from "/assets/tools/vscode.png";
import Tools2 from "/assets/tools/reactjs.png";
import Tools3 from "/assets/tools/nextjs.png";
import Tools4 from "/assets/tools/tailwind.png";
import Tools5 from "/assets/tools/bootstrap.png";
import Tools6 from "/assets/tools/js.png";
import Tools7 from "/assets/tools/nodejs.png";
import Tools8 from "/assets/tools/github.png";
import Tools9 from "/assets/tools/ai.png";
import Tools10 from "/assets/tools/canva.png";
import Tools11 from "/assets/tools/figma.png";
import Tools12 from "/assets/tools/kotlin.png";
import Tools13 from "/assets/tools/firebase.png";
import Tools14 from "/assets/tools/html.png";
import Tools15 from "/assets/tools/css.png";
import Tools16 from "/assets/tools/ts.png";
import Tools17 from "/assets/tools/php.png";
import Tools18 from "/assets/tools/vite.png";
import Tools19 from "/assets/tools/mysql.png";


export const listTools = [
  {
    id: 1,
    gambar: Tools1, // Reuse vscode img for Web Developer
    nama: "Web Developer",
    ket: "Skill",
    dad: "100",
  },
  {
    id: 2,
    gambar: Tools10, // Reuse Canva img for Turots/Academic
    nama: "Turots",
    ket: "Kajian Kitab Turats",
    dad: "200",
  },
  {
    id: 3,
    gambar: Tools9, // Reuse AI img for Academic Writing
    nama: "Academic Writing",
    ket: "Skill",
    dad: "300",
  },
  {
    id: 4,
    gambar: Tools19, // Reuse DB img for Data Entry
    nama: "Data Entry",
    ket: "Skill",
    dad: "400",
  },
];

import Proyek1 from "/assets/proyek/proyek1.png";

export const listProyek = [
  {
    id: 1,
    image: Proyek1,
    title: "AI Mahasiswa — Ilmi Connect",
    subtitle: "Platform AI yang dikembangkan untuk membantu mahasiswa...",
    fullDescription: "Platform AI yang dikembangkan untuk membantu mahasiswa dalam berbagai kebutuhan akademik. Fitur utamanya meliputi: 1) Journal Search (pencarian jurnal ilmiah untuk referensi penelitian), 2) AI Chat (asisten AI untuk diskusi akademik), 3) Slide AI (pembuatan presentasi otomatis), 4) Generator Karya Ilmiah (pembuatan tulisan akademik secara terstruktur).",
    borderColor: "#3B82F6",
    gradient: "linear-gradient(145deg, #3B82F6, #000)",
    url: "#",
    dad: "100",
  }
];
