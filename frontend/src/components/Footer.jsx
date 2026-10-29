import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    label: "Facebook",
    href: import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: import.meta.env.VITE_YOUTUBE_URL || "https://www.youtube.com/",
    icon: Youtube,
  },
  {
    label: "LinkedIn",
    href: import.meta.env.VITE_LINKEDIN_URL || "https://www.linkedin.com/",
    icon: Linkedin,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
        <div>
          <Link
            to="/"
            className="font-semibold tracking-tight text-white hover:text-blue-200"
          >
            IELTS &amp; PTE Prep
          </Link>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Practical preparation and focused practice to help you feel
            confident on test day.
          </p>
        </div>

        <div className="flex flex-col gap-5 md:items-end">
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
            <Link to="/" className="text-sm hover:text-white">
              Home
            </Link>
            <Link to="/ielts" className="text-sm hover:text-white">
              IELTS
            </Link>
            <Link to="/pte" className="text-sm hover:text-white">
              PTE
            </Link>
            <Link to="/login" className="text-sm hover:text-white">
              Sign in
            </Link>
          </nav>

          <nav
            aria-label="Social media"
            className="flex flex-wrap items-center gap-2"
          >
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit us on ${label}`}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-blue-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:h-10 sm:w-10"
              >
                <Icon aria-hidden="true" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} IELTS &amp; PTE Prep. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
