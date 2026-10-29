import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          404 · Page not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          This page isn’t here
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The link may be out of date, or the page may have moved.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link to="/">Back to IELTS &amp; PTE Prep</Link>
        </Button>
      </div>
    </main>
  );
}

export default NotFoundPage;
