import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface ResponseDetails {
  userQuery: string;
  matchedSentences: string[];
  matchedIndexes: number[];
  finalPrompt: string;
}

interface ResponseDetailsModalProps {
  details: ResponseDetails;
}

export function ResponseDetailsModal({ details }: ResponseDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Response Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">User Query</h3>
            <p className="text-sm text-muted-foreground">{details.userQuery}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Matched Sentences</h3>
            <div className="space-y-2">
              {details.matchedSentences.map((sentence, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  <span className="font-medium">
                    [{details.matchedIndexes[index] + 1}]
                  </span>{" "}
                  {sentence}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Final Prompt</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {details.finalPrompt}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
