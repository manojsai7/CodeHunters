import Link from "next/link";
import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Code<span className="text-primary">Hunters</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Hunt the Skills. Build the Future. Premium programming courses and
              ready-to-use developer projects.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted hover:text-white hover:bg-surface-hover transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted hover:text-white hover:bg-surface-hover transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted hover:text-white hover:bg-surface-hover transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted hover:text-white hover:bg-surface-hover transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Courses
            </h3>
            <ul className="space-y-2">
              {[
                "Web Development",
                "Mobile Development",
                "Data Science",
                "DevOps",
                "Machine Learning",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href={`/courses?category=${encodeURIComponent(item)}`}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Projects
            </h3>
            <ul className="space-y-2">
              {[
                "React Projects",
                "Next.js Templates",
                "Full Stack Apps",
                "API Boilerplates",
                "Mobile Apps",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/projects"
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
                { label: "Refund Policy", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/50 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Code Hunters. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Made with 🧡 for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
