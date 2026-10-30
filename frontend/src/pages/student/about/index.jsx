import { BookOpen, GraduationCap, Target } from "lucide-react";

const commitments = [
  {
    title: "Focused preparation",
    description:
      "Find structured resources for IELTS, PTE, Duolingo, and CELPIP preparation.",
    icon: Target,
  },
  {
    title: "Learn at your pace",
    description:
      "Preview available lessons and choose courses that fit your goals and schedule.",
    icon: BookOpen,
  },
  {
    title: "Support for your goals",
    description:
      "Our college learning team helps students prepare for language tests and their next steps.",
    icon: GraduationCap,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-6 py-12 sm:px-10 sm:py-16">
          <p className="text-sm font-semibold text-blue-700">About us</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Helping learners move forward with confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            ADS College brings preparation courses and learning resources
            together to help students build their English skills, prepare for
            language tests, and work toward their education goals.
          </p>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {commitments.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
