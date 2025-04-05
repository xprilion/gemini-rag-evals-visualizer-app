"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  SendIcon,
  Trash2Icon,
  PlusIcon,
  BarChart2Icon,
  BrainIcon,
  MessageSquareIcon,
  MenuIcon,
} from "lucide-react";
import { ResponseDetailsModal } from "@/components/response-details-modal";
import { ApiKeyConfig } from "@/components/api-key-config";
import { Slider } from "@/components/ui/slider";
import { EvaluationTab } from "@/components/evaluation-tab";
import { useToast } from "@/components/ui/use-toast";
import { SentenceInput } from "@/components/sentence-input";
import { VectorTable } from "@/components/vector-table";
import { SimilarityTable } from "@/components/similarity-table";
import { ChatInterface } from "@/components/chat-interface";
import {
  vectorizeSentences,
  calculateSimilarityScores,
  SentenceVector,
  SimilarityScore,
} from "@/lib/vectors";
import { ThemeToggle } from "@/components/theme-provider";
import { Footer } from "@/components/footer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ResponseDetails {
  userQuery: string;
  matchedSentences: string[];
  matchedIndexes: number[];
  finalPrompt: string;
}

interface EvaluationData {
  matched_indexes: number[];
  question: string;
}

export default function RagEvalDemo() {
  const [sentences, setSentences] = useState<string[]>([
    "Rohan goes to school",
    "Mohan is a banker",
    "Kriti has books",
    "Lata is painting",
  ]);
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [vectorized, setVectorized] = useState<boolean>(false);
  const [sentenceVectors, setSentenceVectors] = useState<SentenceVector[]>([]);
  const [userQuery, setUserQuery] = useState<string>("");
  const [queryVector, setQueryVector] = useState<Record<string, number>>({});
  const [similarityScores, setSimilarityScores] = useState<SimilarityScore[]>(
    []
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("sentences");
  const [responseDetails, setResponseDetails] = useState<ResponseDetails[]>([]);
  const [sentenceCount, setSentenceCount] = useState(2);
  const [evaluationData, setEvaluationData] = useState<EvaluationData[]>([]);
  const [selectedResponseIndex, setSelectedResponseIndex] = useState<
    number | null
  >(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const apiKey = localStorage.getItem("geminiApiKey");
    setHasApiKey(!!apiKey);
  }, []);

  // Handle sentence input changes
  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  // Add a new sentence input field
  const addSentence = () => {
    setSentences([...sentences, ""]);
  };

  // Remove a sentence input field
  const removeSentence = (index: number) => {
    if (sentences.length <= 3) return; // Maintain minimum 3 sentences
    const newSentences = sentences.filter((_, i) => i !== index);
    setSentences(newSentences);
  };

  // Reset all data
  const resetData = () => {
    setSentences(["", "", ""]);
    setDictionary([]);
    setVectorized(false);
    setSentenceVectors([]);
    setUserQuery("");
    setQueryVector({});
    setSimilarityScores([]);
    setMessages([]);
    setActiveTab("sentences");
  };

  const vectorize = () => {
    if (sentences.some((s) => s.trim() === "")) {
      toast({
        title: "Empty sentences",
        description: "Please fill in all sentence fields",
        variant: "destructive",
      });
      return;
    }

    const vectors = vectorizeSentences(sentences);
    setSentenceVectors(vectors);
    setVectorized(true);
    setActiveTab("vectors");
    toast({
      title: "Sentences vectorized",
      description: "Your sentences have been successfully vectorized",
    });
  };

  const getInitialMessage = () => {
    const steps = [
      {
        text: "1. Set your Gemini API key",
        action: (
          <ApiKeyConfig>
            <Button variant="link" className="p-0 h-auto">
              Click here to set your API key
            </Button>
          </ApiKeyConfig>
        ),
        completed: hasApiKey,
      },
      {
        text: "2. Vectorize your sentences",
        action: null,
        completed: vectorized,
      },
    ];

    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div className="text-muted-foreground space-y-4">
          <MessageSquareIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Follow these steps to get started:</p>
          <div className="space-y-2 text-left">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${
                  step.completed ? "text-green-500" : ""
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? "✓" : index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <span>{step.text}</span>
                  {step.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const processQuery = async (message: string) => {
    if (!vectorized) {
      toast({
        title: "Not vectorized",
        description: "Please vectorize your sentences first",
        variant: "destructive",
      });
      return;
    }

    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      toast({
        title: "API key missing",
        description: "Please set your Gemini API key first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      // Create a new vector for the query
      const queryVector = vectorizeSentences([message])[0].vector;

      // Calculate similarity scores
      const scores = calculateSimilarityScores(queryVector, sentenceVectors);

      // Get top 3 matches
      const topMatches = scores.sort((a, b) => b.score - a.score).slice(0, 3);

      const matchedSentences = topMatches.map(
        (score) => sentences[score.index]
      );
      const matchedIndexes = topMatches.map((score) => score.index);

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

      // Update messages
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
      ]);

      // Update response details
      setResponseDetails((prev) => [
        ...prev,
        {
          userQuery: message,
          matchedSentences,
          matchedIndexes,
          finalPrompt,
        },
      ]);

      // Update similarity scores
      setSimilarityScores(scores);

      // Update UI with results
      setActiveTab("similarity");
      toast({
        title: "Query processed",
        description: "Response generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process query",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data["query_pairs"])) {
          setEvaluationData(data["query_pairs"]);
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

  const handleQuestionClick = (question: string) => {
    setUserQuery(question);
    processQuery(question);
  };

  const getEvaluationComparison = (
    query: string,
    predictedIndexes: number[]
  ) => {
    const evaluation = evaluationData.find((e) => e.question === query);
    if (!evaluation) return undefined;

    const trueIndexes = evaluation.matched_indexes;
    const intersection = predictedIndexes.filter((index) =>
      trueIndexes.includes(index + 1)
    );
    const precision = intersection.length / predictedIndexes.length;
    const recall = intersection.length / trueIndexes.length;
    const f1 = (2 * (precision * recall)) / (precision + recall);

    return {
      trueIndexes,
      predictedIndexes,
      intersection,
      precision,
      recall,
      f1,
    };
  };

  const handleDatasetGenerated = (data: any) => {
    if (data.query_pairs) {
      setEvaluationData(data.query_pairs);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden p-2">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">RAG Evaluation Demo</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Testing Panel</SheetTitle>
                </SheetHeader>
                <div className="h-full">
                  <ChatInterface
                    messages={messages}
                    isLoading={isLoading}
                    onSendMessage={processQuery}
                    hasApiKey={hasApiKey}
                    vectorized={vectorized}
                    sentenceVectors={sentenceVectors}
                    sentences={sentences}
                    evaluationData={evaluationData}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left side - Main content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 flex-1 md:pt-0 pt-16">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">RAG Evaluation Demo</h1>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <ApiKeyConfig>
                  <Button variant="outline">
                    {hasApiKey ? "Update API Key" : "Set API Key"}
                  </Button>
                </ApiKeyConfig>
              </div>
            </div>

            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>How to use</AlertTitle>
              <AlertDescription>
                Enter your sentences, vectorize them, and then test the RAG
                system by sending queries.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="sentences">
                  <MessageSquareIcon className="h-4 w-4 mr-2" />
                  Sentences
                </TabsTrigger>
                <TabsTrigger value="vectors" disabled={!vectorized}>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Vectors
                </TabsTrigger>
                <TabsTrigger value="similarity" disabled={!vectorized}>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Similarity
                </TabsTrigger>
                <TabsTrigger value="evaluation">
                  <BarChart2Icon className="h-4 w-4 mr-2" />
                  Evaluation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sentences" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Sentence Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SentenceInput
                      sentences={sentences}
                      onSentencesChange={setSentences}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={vectorize}>Vectorize Sentences</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vectors" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vectorized Sentences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VectorTable sentenceVectors={sentenceVectors} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="similarity" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Similarity Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {similarityScores.length > 0 ? (
                      <SimilarityTable similarityScores={similarityScores} />
                    ) : (
                      <div className="text-center text-muted-foreground p-4">
                        No similarity scores to display. Please process a query
                        first.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluation" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Evaluation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EvaluationTab
                      sentences={sentences}
                      evaluationData={evaluationData}
                      onQuestionClick={handleQuestionClick}
                      onDatasetGenerated={handleDatasetGenerated}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer inside left panel */}
          <Footer />
        </div>

        {/* Right side - Fixed Testing Panel (Desktop only) */}
        <div className="hidden md:block w-[400px] border-l bg-background flex flex-col sticky top-0 h-screen">
          <Card className="h-full rounded-none border-0 flex flex-col">
            <CardHeader>
              <CardTitle>Testing Panel</CardTitle>
              <CardDescription>
                Test your RAG system by entering a query below
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden flex flex-col">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={processQuery}
                hasApiKey={hasApiKey}
                vectorized={vectorized}
                sentenceVectors={sentenceVectors}
                sentences={sentences}
                evaluationData={evaluationData}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedResponseIndex !== null && (
        <ResponseDetailsModal
          isOpen={true}
          details={responseDetails[selectedResponseIndex]}
          onClose={() => setSelectedResponseIndex(null)}
        />
      )}
    </div>
  );
}
