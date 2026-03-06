import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed Premium Developer's Kit
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

  // Seed Premium Courses bundle
  const existingCourses = await prisma.project.findUnique({
    where: { slug: "premium-courses" },
  });

  if (existingCourses) {
    console.log("Premium Courses project already exists, updating...");
    await prisma.project.update({
      where: { slug: "premium-courses" },
      data: premiumCoursesData,
    });
    console.log("Updated successfully!");
  } else {
    await prisma.project.create({ data: premiumCoursesData });
    console.log("Premium Courses project created successfully!");
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

const premiumCoursesData = {
  slug: "premium-courses",
  title: "Premium Courses — Complete Developer Mastery Bundle",
  description: `Unlock the complete Code Hunters premium course library — everything you need to go from beginner to professional developer.

## What You Get

### Programming Foundations
- **300+ Python Projects** — Master Python through hands-on projects from scripts to full apps
- **150+ Front-end Projects** — Build stunning websites with HTML, CSS & JavaScript
- **C/C++ Mastery** — System programming, data structures & competitive coding
- **Java Enterprise** — OOP, Spring Boot, Android development & enterprise patterns
- **Django & Flask** — Full-stack Python web development with REST APIs
- **PHP & Laravel** — Dynamic web applications & modern CMS development
- **React Masterclass** — Component architecture, hooks, state management & Next.js

### AI & Machine Learning Track
- **150+ ML Projects** — Supervised, unsupervised learning, ensemble methods
- **100+ Deep Learning Projects** — Neural networks, CNNs, RNNs, GANs, Transformers
- **100+ NLP Projects** — Text analysis, chatbots, sentiment analysis, LLMs
- **200+ ChatGPT Prompt Engineering** — Curated templates to supercharge your workflow

### Career Accelerator Pack
- **200+ Interview Questions** — DSA, system design, behavioral & HR rounds
- **100+ Resume Templates** — ATS-optimized, editable in Word, Google Docs & Figma
- **100+ Cold Email Scripts** — LinkedIn outreach, networking & referral templates
- **Career Roadmap** — Step-by-step path from beginner to senior developer

### Productivity & Tools
- **100+ Programming Tools** — Essential developer tooling, curated & categorized
- **100+ VS Code Shortcuts** — Keyboard shortcuts to 10x your coding speed
- **Software Engineering Best Practices** — Clean code, testing, CI/CD, deployment

### Exclusive Bonuses
- **Lifetime validity** — Buy once, access forever with all future updates included
- **100% Money-back guarantee** — Not satisfied? Get a full refund, no questions asked
- **Priority support** — Get help directly from the Code Hunters team
- **Community access** — Join 500+ developers in our exclusive Discord

## Who Is This For?
- Students looking to build a strong portfolio fast
- Self-taught developers who want structured, high-quality resources
- Working professionals upskilling for better roles
- Anyone who wants production-ready code, not toy examples`,
  shortDesc:
    "The complete Code Hunters premium bundle — 700+ projects, AI/ML courses, career resources, resume templates, interview prep & lifetime updates. One purchase, unlimited growth.",
  price: 459,
  mrp: 2999,
  zipUrl: "",
  thumbnail: "/images/projects/Developers-Kit-1943x2048-1-972x1024.png",
  previewImages: [
    "/images/projects/300-Python-Projects-915x1024.png",
    "/images/projects/150-Front-end-Projects-915x1024.png",
    "/images/projects/150-Machine-Learnig-1-919x1024.png",
    "/images/projects/100-Natural-Language-Processing-918x1024.png",
    "/images/projects/C-915x1024.png",
    "/images/projects/Java-915x1024.png",
    "/images/projects/Django-915x1024.png",
    "/images/projects/PHP-915x1024.png",
    "/images/projects/react-915x1024.png",
    "/images/projects/100-email-919x1024.png",
    "/images/projects/100-Editable-Resume-Templates-922x1024.jpg",
    "/images/projects/100-Programming-Tools-927x1024.jpg",
    "/images/projects/100-VS-Code-Keyboard-Shortcuts-927x1024.jpg",
    "/images/projects/softare-919x1024.png",
    "/images/projects/Roadmap-927x1024.jpg",
    "/images/projects/100-money-back-guarantee4158.jpg",
    "/images/projects/Lifetime-Validity-Updates-927x1024.jpg",
  ],
  techTags: [
    "Python",
    "JavaScript",
    "React",
    "Next.js",
    "Java",
    "C",
    "C++",
    "Django",
    "Flask",
    "PHP",
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "ChatGPT",
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
