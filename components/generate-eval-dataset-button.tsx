import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainIcon } from "lucide-react";

interface GenerateEvalDatasetButtonProps {
  sentences: string[];
  onDatasetGenerated: (data: any) => void;
  numQuestions: number;
  numQueries: number;
}

export function GenerateEvalDatasetButton({
  sentences,
  onDatasetGenerated,
  numQuestions,
  numQueries,
}: GenerateEvalDatasetButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    const apiKey = localStorage.getItem("geminiApiKey");
    setHasApiKey(!!apiKey);
  }, []);

  const handleGenerateDataset = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiKey = localStorage.getItem("geminiApiKey");
      if (!apiKey) {
        throw new Error("API key is required");
      }

      const response = await fetch("/api/gemini/generate-eval-dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documents: sentences,
          numQuestions,
          numQueries,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate evaluation dataset");
      }

      const data = await response.json();
      onDatasetGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerateDataset}
        disabled={isLoading || sentences.length === 0 || !hasApiKey}
        className="w-full"
      >
        <BrainIcon className="mr-2 h-4 w-4" />
        {isLoading ? "Generating..." : "Generate Evaluation Dataset"}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!hasApiKey && (
        <Alert>
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please set your Gemini API key before generating the evaluation
            dataset.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
