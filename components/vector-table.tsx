import { SentenceVector } from "@/lib/vectors";
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

interface VectorTableProps {
  sentenceVectors: SentenceVector[];
}

export function VectorTable({ sentenceVectors }: VectorTableProps) {
  if (sentenceVectors.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No vectors to display. Please vectorize your sentences first.
      </div>
    );
  }

  const dictionary = Object.keys(sentenceVectors[0].vector);

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Index</TableHead>
            <TableHead>Sentence</TableHead>
            {dictionary.map((word) => (
              <TableHead key={word} className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-xs">{word}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Word: {word}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sentenceVectors.map((vector) => (
            <TableRow key={vector.index}>
              <TableCell>
                <Badge
                  variant="secondary"
                  className="w-8 h-8 flex items-center justify-center"
                >
                  {vector.index}
                </Badge>
              </TableCell>
              <TableCell>{vector.sentence}</TableCell>
              {dictionary.map((word) => (
                <TableCell key={word} className="text-center">
                  <Badge
                    variant={vector.vector[word] > 0 ? "default" : "outline"}
                    className="w-6 h-6 flex items-center justify-center"
                  >
                    {vector.vector[word]}
                  </Badge>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
