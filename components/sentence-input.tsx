import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface SentenceInputProps {
  sentences: string[];
  onSentencesChange: (sentences: string[]) => void;
}

export function SentenceInput({
  sentences,
  onSentencesChange,
}: SentenceInputProps) {
  const { toast } = useToast();

  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    onSentencesChange(newSentences);
  };

  const addSentence = () => {
    onSentencesChange([...sentences, ""]);
    toast({
      title: "New sentence added",
      description: "You can now enter text for the new sentence",
    });
  };

  const removeSentence = (index: number) => {
    if (sentences.length <= 3) {
      toast({
        title: "Cannot remove sentence",
        description: "You must maintain at least 3 sentences",
        variant: "destructive",
      });
      return;
    }
    const newSentences = sentences.filter((_, i) => i !== index);
    onSentencesChange(newSentences);
    toast({
      title: "Sentence removed",
      description: "The sentence has been removed from the list",
    });
  };

  return (
    <div className="space-y-4">
      {sentences.map((sentence, index) => (
        <div key={index} className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="w-8 h-8 flex items-center justify-center shrink-0"
          >
            {index}
          </Badge>
          <Input
            value={sentence}
            onChange={(e) => handleSentenceChange(index, e.target.value)}
            placeholder={`Enter sentence ${index + 1}`}
            className="flex-1"
          />
          {sentences.length > 3 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSentence(index)}
              className="shrink-0"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button variant="outline" onClick={addSentence} className="w-full">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Sentence
      </Button>
    </div>
  );
}
