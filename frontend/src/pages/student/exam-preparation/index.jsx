import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Headphones,
  Mic,
  PenLine,
  Target,
} from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const examContent = {
  ielts: {
    name: "IELTS",
    fullName: "International English Language Testing System",
    eyebrow: "IELTS preparation",
    title: "Build your confidence for IELTS.",
    introduction:
      "Prepare for the IELTS test with a clear study plan and practical guidance across all four skills. Strengthen your English, understand what each task asks of you, and practise expressing your ideas with confidence.",
    format:
      "IELTS assesses Listening, Reading, Writing, and Speaking. The test is available in Academic and General Training formats, so choose the one that matches your goals.",
    skills: [
      {
        title: "Listening",
        description:
          "Practise following conversations and talks, identifying key details, and keeping up as topics change.",
        icon: Headphones,
      },
      {
        title: "Reading",
        description:
          "Build strategies for locating information, understanding ideas, and managing your time across passages.",
        icon: BookOpen,
      },
      {
        title: "Writing",
        description:
          "Learn to organise responses clearly, support your ideas, and write for the task and audience.",
        icon: PenLine,
      },
      {
        title: "Speaking",
        description:
          "Practise speaking naturally, extending your answers, and explaining your ideas with relevant examples.",
        icon: Mic,
      },
    ],
    steps: [
      "Choose Academic or General Training based on your plans.",
      "Review all four skills and identify where you want to improve.",
      "Practise regularly with timed tasks and review your progress.",
    ],
  },
  pte: {
    name: "PTE",
    fullName: "Pearson Test of English",
    eyebrow: "PTE preparation",
    title: "Get focused and ready for PTE.",
    introduction:
      "Prepare for the PTE test with structured practice and a steady routine. Get familiar with the task types, build confidence using English in different situations, and develop a reliable approach to test day.",
    format:
      "PTE Academic assesses English through integrated tasks across Speaking and Writing, Reading, and Listening. Many tasks combine skills, so focused practice can help you become comfortable switching between them.",
    skills: [
      {
        title: "Speaking & Writing",
        description:
          "Practise clear spoken responses and well-organised writing while developing accuracy and fluency.",
        icon: Mic,
      },
      {
        title: "Reading",
        description:
          "Strengthen comprehension, vocabulary, and your ability to work efficiently with written material.",
        icon: BookOpen,
      },
      {
        title: "Listening",
        description:
          "Develop active listening and practise understanding key information from spoken English.",
        icon: Headphones,
      },
      {
        title: "Integrated tasks",
        description:
          "Get comfortable using more than one English skill within a single test task.",
        icon: PenLine,
      },
    ],
    steps: [
      "Understand the test format and the tasks in each section.",
      "Practise speaking, writing, reading, and listening consistently.",
      "Use timed practice to build familiarity and confidence.",
    ],
  },
};

export default function ExamPreparationPage({ exam }) {
  const content = examContent[exam];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Button
            asChild
            variant="ghost"
            className="mb-8 gap-2 px-0 text-slate-300 hover:bg-transparent hover:text-white"
          >
            <Link to="/">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <p className="text-sm font-medium text-blue-300">{content.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {content.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            {content.introduction}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
              <Target aria-hidden="true" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-white">
                {content.name}
              </span>
              <span className="block text-xs text-slate-300">
                {content.fullName}
              </span>
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-medium text-blue-700">
              What to expect
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Understand your test
            </h2>
            <p className="mt-4 leading-7 text-slate-600">{content.format}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <p className="text-sm font-medium text-blue-800">
              A simple preparation plan
            </p>
            <ol className="mt-4 space-y-4">
              {content.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-700">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-slate-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-blue-700">Skills to practise</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Prepare one step at a time
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.skills.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-3">
            <CheckCircle
              aria-hidden="true"
              className="mt-1 h-5 w-5 shrink-0 text-emerald-600"
            />
            <div>
              <h2 className="font-semibold text-slate-900">
                Make your preparation consistent
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Set a realistic routine, practise each skill regularly, and
                review what you learn along the way.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0 rounded-lg">
            <Link to="/">Explore IELTS &amp; PTE</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

ExamPreparationPage.propTypes = {
  exam: PropTypes.oneOf(["ielts", "pte"]).isRequired,
};
