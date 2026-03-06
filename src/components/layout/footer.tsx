import Link from "next/link";
import { Code2, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-background">
      {/* Gradient divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

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
              {[
                { icon: Github, label: "GitHub", href: "#" },
                { icon: Twitter, label: "Twitter", href: "#" },
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Mail, label: "Email", href: "mailto:hello@codehunters.dev" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-muted hover:text-white hover:bg-surface-hover hover:shadow-md hover:shadow-primary/20 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
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

        {/* Newsletter */}
        <div className="mt-12 rounded-xl border border-border/50 bg-surface/30 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Stay in the loop</h3>
              <p className="mt-1 text-sm text-muted">Get notified about new courses, projects, and exclusive deals.</p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="h-10 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-white placeholder:text-muted/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 sm:w-64"
              />
              <button className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary-hover">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
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
