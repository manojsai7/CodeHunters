import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-background">
      {/* Divider */}
      <div className="h-px w-full bg-border" />

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold font-display text-foreground">
              Code Hunters
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Hunt the Skills. Build the Future. Premium programming courses and
              ready-to-use developer projects.
            </p>
            <div className="flex gap-3">
              <a
                href="mailto:hello@codehunters.dev"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Courses
            </h3>
            <ul className="space-y-2.5">
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
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Projects
            </h3>
            <ul className="space-y-2.5">
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
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Contact
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:hello@codehunters.dev"
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  hello@codehunters.dev
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Code Hunters. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Built for developers, by developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
