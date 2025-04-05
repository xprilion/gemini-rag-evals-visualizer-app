import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseDetails {
  userQuery: string;
  matchedSentences: string[];
  matchedIndexes: number[];
  finalPrompt: string;
}

interface EvaluationComparison {
  trueIndexes: number[];
  predictedIndexes: number[];
  intersection: number[];
  precision: number;
  recall: number;
  f1: number;
}

interface ResponseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ResponseDetails;
  evaluationComparison?: EvaluationComparison;
}

export function ResponseDetailsModal({
  isOpen,
  onClose,
  details,
  evaluationComparison,
}: ResponseDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Response Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Query</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{details.userQuery}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Matched Sentences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {details.matchedSentences.map((sentence, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge variant="outline">
                        {details.matchedIndexes[index]}
                      </Badge>
                      <p className="text-sm">{sentence}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {evaluationComparison && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">True Matches</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluationComparison.trueIndexes.map((index) => (
                          <Badge
                            key={index}
                            variant={
                              evaluationComparison.intersection.includes(index)
                                ? "default"
                                : "outline"
                            }
                          >
                            {index}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Predicted Matches</h4>
                      <div className="flex flex-wrap gap-2">
                        {evaluationComparison.predictedIndexes.map((index) => (
                          <Badge
                            key={index}
                            variant={
                              evaluationComparison.intersection.includes(index)
                                ? "default"
                                : "outline"
                            }
                          >
                            {index}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium">Precision</h4>
                        <p className="text-2xl font-bold">
                          {(evaluationComparison.precision * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Recall</h4>
                        <p className="text-2xl font-bold">
                          {(evaluationComparison.recall * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">F1 Score</h4>
                        <p className="text-2xl font-bold">
                          {(evaluationComparison.f1 * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Final Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm whitespace-pre-wrap">
                  {details.finalPrompt}
                </pre>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
