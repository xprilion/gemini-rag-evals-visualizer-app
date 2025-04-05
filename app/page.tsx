import RagEvalDemo from "@/components/rag-eval-demo";
import { ThemeToggle } from "@/components/theme-provider";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">RAG Evals Demo</h1>
          <ThemeToggle />
        </div>
        <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
          This interactive tool demonstrates how Retrieval Augmented Generation
          (RAG) works by visualizing the process of vectorization, similarity
          scoring, and response generation.
        </p>
        <RagEvalDemo />
        <Footer />
      </div>
    </main>
  );
}
