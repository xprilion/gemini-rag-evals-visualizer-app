import { SimilarityScore } from "@/lib/vectors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimilarityTableProps {
  similarityScores: SimilarityScore[];
}

export function SimilarityTable({ similarityScores }: SimilarityTableProps) {
  if (similarityScores.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No similarity scores to display. Please process a query first.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Index</TableHead>
            <TableHead>Sentence</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {similarityScores.map((score) => (
            <TableRow key={score.index}>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {score.rank}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {score.index}
                </Badge>
              </TableCell>
              <TableCell>{score.sentence}</TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant={score.score > 0.5 ? "default" : "outline"}
                        className="w-16 h-6 flex items-center justify-center"
                      >
                        {score.score.toFixed(4)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cosine similarity score</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
