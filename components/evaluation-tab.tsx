import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GenerateEvalDatasetButton } from "@/components/generate-eval-dataset-button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EvaluationData {
  matched_indexes: number[];
  question: string;
}

interface EvaluationTabProps {
  sentences: string[];
  evaluationData: EvaluationData[];
  onQuestionClick: (question: string) => void;
  onDatasetGenerated: (data: any) => void;
}

export function EvaluationTab({
  sentences,
  evaluationData,
  onQuestionClick,
  onDatasetGenerated,
}: EvaluationTabProps) {
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<
    number | null
  >(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [numQueries, setNumQueries] = useState(4);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.query_pairs)) {
          onDatasetGenerated({ query_pairs: data.query_pairs });
        } else {
          alert(
            "Invalid JSON format. Expected an array of evaluation objects."
          );
        }
      } catch (error) {
        alert("Error parsing JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const data = {
      query_pairs: evaluationData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "evaluation-dataset.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={evaluationData.length === 0}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Dataset
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Number of Questions</label>
              <span className="text-sm text-muted-foreground">
                {numQuestions}
              </span>
            </div>
            <Slider
              value={[numQuestions]}
              min={5}
              max={50}
              step={5}
              onValueChange={([value]) => setNumQuestions(value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Queries per Category
              </label>
              <span className="text-sm text-muted-foreground">
                {numQueries}
              </span>
            </div>
            <Slider
              value={[numQueries]}
              min={1}
              max={10}
              step={1}
              onValueChange={([value]) => setNumQueries(value)}
            />
          </div>

          <GenerateEvalDatasetButton
            sentences={sentences}
            onDatasetGenerated={onDatasetGenerated}
            numQuestions={numQuestions}
            numQueries={numQueries}
          />
        </div>

        {evaluationData.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Dataset Statistics</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Total Questions:</span>{" "}
                    {evaluationData.length}
                  </div>
                  <div>
                    <span className="font-medium">Average Matches:</span>{" "}
                    {(
                      evaluationData.reduce(
                        (acc, curr) => acc + curr.matched_indexes.length,
                        0
                      ) / evaluationData.length
                    ).toFixed(2)}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Index</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Matched Indexes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="w-8 h-8 flex items-center justify-center"
                      >
                        {index}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.question}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {item.matched_indexes.map((idx) => (
                          <Badge key={idx} variant="secondary">
                            {idx}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedResponseIndex(index);
                          onQuestionClick(item.question);
                        }}
                      >
                        Test
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
