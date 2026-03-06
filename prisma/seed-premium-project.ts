import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.project.findUnique({
    where: { slug: "premium-developers-kit" },
  });

  if (existing) {
    console.log("Premium Developers Kit project already exists, updating...");
    await prisma.project.update({
      where: { slug: "premium-developers-kit" },
      data: projectData,
    });
    console.log("Updated successfully!");
  } else {
    await prisma.project.create({ data: projectData });
    console.log("Premium Developers Kit project created successfully!");
  }
}

const projectData = {
  slug: "premium-developers-kit",
  title: "Premium Developer's Kit — 700+ Projects Bundle",
  description: `The ultimate developer's toolkit with 700+ ready-to-use projects across all major programming languages and frameworks.

## What's Included

### Core Projects
- **300+ Python Projects** — From automation scripts to advanced AI applications
- **150+ Front-end Projects** — HTML, CSS, JavaScript projects with modern UI designs
- **50+ C/C++ Projects** — System-level programming, data structures, and algorithms
- **30+ Java Projects** — Enterprise applications, Android starters, and OOP patterns
- **30+ Django & Flask Projects** — Full-stack Python web applications with REST APIs
- **30+ PHP Projects** — Dynamic web applications and CMS templates
- **15+ React Projects** — Modern component-based SPAs with hooks and state management

### AI & Machine Learning
- **200+ ChatGPT Prompts** — Curated prompt templates for developers
- **150+ Machine Learning Projects** — Regression, classification, clustering, and more
- **100+ Deep Learning Projects** — Neural networks, CNNs, RNNs, transformers
- **50+ Natural Language Processing** — Text analysis, chatbots, sentiment analysis

### Career & Interview Prep
- **200+ Interview Questions & Answers** — DSA, system design, and behavioral
- **100+ Editable Resume Templates** — ATS-friendly professional templates
- **100+ LinkedIn Cold Email Scripts** — Networking and outreach templates

### Developer Tools & Resources
- **100+ Programming Tools** — Curated list of essential developer tools
- **100+ VS Code Keyboard Shortcuts** — Boost your productivity
- **Career Roadmap** — Step-by-step guide from beginner to senior developer
- **Lifetime Validity & Updates** — Get all future additions at no extra cost

## Why This Bundle?
- Covers 10+ programming languages
- Beginner to advanced difficulty levels
- Real-world, production-ready code
- Source code included for all projects
- Regular updates with new projects
- 100% Money Back Guarantee`,
  shortDesc:
    "700+ ready-to-use projects across Python, JavaScript, React, Java, ML, AI & more. Includes career resources, interview prep, and lifetime updates.",
  price: 459,
  mrp: 2999,
  zipUrl: "",
  thumbnail: "/images/projects/Developers-Kit-1943x2048-1-972x1024.png",
  previewImages: [
    "/images/projects/300-Python-Projects-915x1024.png",
    "/images/projects/150-Front-end-Projects-915x1024.png",
    "/images/projects/150-Machine-Learnig-1-919x1024.png",
    "/images/projects/C-915x1024.png",
    "/images/projects/Java-915x1024.png",
    "/images/projects/Django-915x1024.png",
    "/images/projects/PHP-915x1024.png",
    "/images/projects/react-915x1024.png",
    "/images/projects/50-Natural-Language-Processing-919x1024.png",
    "/images/projects/100-Editable-Resume-Templates-922x1024.jpg",
    "/images/projects/100-Programming-Tools-927x1024.jpg",
    "/images/projects/100-VS-Code-Keyboard-Shortcuts-927x1024.jpg",
    "/images/projects/softare-919x1024.png",
    "/images/projects/Roadmap-927x1024.jpg",
    "/images/projects/Lifetime-Validity-Updates-927x1024.jpg",
  ],
  techTags: [
    "Python",
    "JavaScript",
    "React",
    "Java",
    "C",
    "C++",
    "Django",
    "Flask",
    "PHP",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "HTML",
    "CSS",
  ],
  category: "fullstack",
  difficulty: "beginner",
  isPublished: true,
  isBestseller: true,
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
