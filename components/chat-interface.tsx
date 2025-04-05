import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, MessageSquareIcon, BrainIcon, InfoIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/loading-state";
import { ApiKeyConfig } from "@/components/api-key-config";
import { ResponseDetailsModal } from "@/components/response-details-modal";
import { calculateSimilarityScores } from "@/lib/vectors";
import { vectorizeSentences } from "@/lib/vectors";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EvaluationData {
  matched_indexes: number[];
  question: string;
}

interface ResponseDetails {
  userQuery: string;
  matchedSentences: string[];
  matchedIndexes: number[];
  finalPrompt: string;
  evaluationComparison?: {
    trueIndexes: number[];
    predictedIndexes: number[];
    intersection: number[];
    precision: number;
    recall: number;
    f1: number;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  hasApiKey: boolean;
  vectorized: boolean;
  sentenceVectors: any[];
  sentences: string[];
  evaluationData?: EvaluationData[];
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  hasApiKey,
  vectorized,
  sentenceVectors,
  sentences,
  evaluationData = [],
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<
    number | null
  >(null);
  const [responseDetails, setResponseDetails] = useState<ResponseDetails[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const { toast } = useToast();

  // Sync with parent messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const calculateEvaluationMetrics = (
    query: string,
    predictedIndexes: number[]
  ) => {
    const evaluation = evaluationData.find(
      (e) => e.question.toLowerCase() === query.toLowerCase()
    );
    if (!evaluation) return undefined;

    const trueIndexes = evaluation.matched_indexes;
    const intersection = predictedIndexes.filter((index) =>
      trueIndexes.includes(index)
    );
    const precision = intersection.length / predictedIndexes.length;
    const recall = intersection.length / trueIndexes.length;
    const f1 = (2 * (precision * recall)) / (precision + recall) || 0;

    return {
      trueIndexes,
      predictedIndexes,
      intersection,
      precision,
      recall,
      f1,
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before sending",
        variant: "destructive",
      });
      return;
    }

    try {
      const apiKey = localStorage.getItem("geminiApiKey");
      if (!apiKey) {
        toast({
          title: "API key missing",
          description: "Please set your Gemini API key first",
          variant: "destructive",
        });
        return;
      }

      // Immediately add user message to the chat
      const userMessage: Message = { role: "user", content: message };
      setLocalMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsGenerating(true);

      // Create a new vector for the query
      const queryVector = vectorizeSentences([message])[0].vector;

      // Calculate similarity scores
      const similarityScores = calculateSimilarityScores(
        queryVector,
        sentenceVectors
      );

      // Get top 3 matches
      const topMatches = similarityScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      const matchedSentences = topMatches.map(
        (score) => sentences[score.index]
      );
      const matchedIndexes = topMatches.map((score) => score.index);

      // Calculate evaluation metrics if query matches evaluation data
      const evaluationComparison = calculateEvaluationMetrics(
        message,
        matchedIndexes
      );

      // Prepare context for Gemini
      const context = matchedSentences.join("\n");
      const finalPrompt = `Context: ${context}\n\nUser query: ${message}`;

      // Call Gemini API
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message,
          context,
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Gemini");
      }

      const data = await response.json();

      // Add the assistant's response
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
      };
      setLocalMessages((prev) => [...prev, assistantMessage]);

      // Add the response details
      setResponseDetails((prev) => [
        ...prev,
        {
          userQuery: message,
          matchedSentences,
          matchedIndexes,
          finalPrompt,
          evaluationComparison,
        },
      ]);

      // Notify parent component
      onSendMessage(message);

      setIsGenerating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your query",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const getInitialMessage = () => {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="text-muted-foreground space-y-6">
          <div className="space-y-2">
            <MessageSquareIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">
              Welcome to RAG Evaluation Demo
            </h3>
            <p className="text-sm">Follow these steps to get started:</p>
          </div>

          <div className="space-y-4 text-left">
            <div
              className={`flex items-center gap-3 ${
                hasApiKey ? "text-green-500" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  hasApiKey
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {hasApiKey ? "✓" : "1"}
              </div>
              <div className="flex-1">
                <p className="font-medium">Set your Gemini API key</p>
                <p className="text-sm text-muted-foreground">
                  Required for generating responses
                </p>
                <ApiKeyConfig>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Click here to set your API key
                  </Button>
                </ApiKeyConfig>
              </div>
            </div>

            <div
              className={`flex items-center gap-3 ${
                vectorized ? "text-green-500" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  vectorized
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {vectorized ? "✓" : "2"}
              </div>
              <div className="flex-1">
                <p className="font-medium">Vectorize your sentences</p>
                <p className="text-sm text-muted-foreground">
                  Required for similarity matching
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Start testing</p>
                <p className="text-sm text-muted-foreground">
                  Send queries to test the RAG system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4 space-y-4">
        {localMessages.length === 0
          ? getInitialMessage()
          : localMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 mt-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" &&
                    responseDetails[Math.floor(index / 2)] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          setSelectedResponseIndex(Math.floor(index / 2))
                        }
                      >
                        <InfoIcon className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    )}
                </div>
              </div>
            ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={!hasApiKey || !vectorized || isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || isGenerating || !hasApiKey || !vectorized}
            className="shrink-0"
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
        {(!hasApiKey || !vectorized) && (
          <p className="text-xs text-muted-foreground mt-2">
            {!hasApiKey
              ? "Please set your API key first"
              : "Please vectorize your sentences first"}
          </p>
        )}
      </div>

      {selectedResponseIndex !== null &&
        responseDetails[selectedResponseIndex] && (
          <ResponseDetailsModal
            isOpen={true}
            details={responseDetails[selectedResponseIndex]}
            onClose={() => setSelectedResponseIndex(null)}
          />
        )}
    </div>
  );
}
