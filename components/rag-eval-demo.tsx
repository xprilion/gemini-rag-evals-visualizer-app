"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { ResponseDetailsModal } from "@/components/response-details-modal";
import { ApiKeyConfig } from "@/components/api-key-config";
import { Slider } from "@/components/ui/slider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SentenceVector {
  index: number;
  sentence: string;
  vector: Record<string, number>;
}

interface SimilarityScore {
  index: number;
  score: number;
  rank: number;
  sentence: string;
}

interface ResponseDetails {
  userQuery: string;
  matchedSentences: string[];
  matchedIndexes: number[];
  finalPrompt: string;
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

  // Create dictionary and vectorize sentences
  const vectorizeSentences = () => {
    // Check if all sentences have content
    if (sentences.some((s) => s.trim() === "")) {
      alert("Please fill in all sentence fields");
      return;
    }

    // Create dictionary of unique words
    const allWords = sentences
      .join(" ")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const uniqueWords = Array.from(new Set(allWords)).sort();
    setDictionary(uniqueWords);

    // Create vectors for each sentence
    const vectors: SentenceVector[] = sentences.map((sentence, index) => {
      const words = sentence
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 0);

      const vector: Record<string, number> = {};

      // Initialize all words with 0 count
      uniqueWords.forEach((word) => {
        vector[word] = 0;
      });

      // Count occurrences of each word
      words.forEach((word) => {
        if (uniqueWords.includes(word)) {
          vector[word] += 1;
        }
      });

      return {
        index,
        sentence,
        vector,
      };
    });

    setSentenceVectors(vectors);
    setVectorized(true);
    setActiveTab("vectors");
  };

  const getInitialMessage = () => {
    const apiKey = localStorage.getItem("geminiApiKey");
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
        completed: !!apiKey,
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

  // Process user query
  const processQuery = async () => {
    if (!userQuery.trim() || !vectorized) return;

    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      alert("Please set your Gemini API key first");
      return;
    }

    // Vectorize the query using the same dictionary
    const queryWords = userQuery
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const vector: Record<string, number> = {};

    // Initialize all words with 0 count
    dictionary.forEach((word) => {
      vector[word] = 0;
    });

    // Count occurrences of each word in query
    queryWords.forEach((word) => {
      if (dictionary.includes(word)) {
        vector[word] += 1;
      }
    });

    setQueryVector(vector);

    // Calculate cosine similarity with each sentence vector
    const scores: SimilarityScore[] = sentenceVectors.map((sv) => {
      const similarity = calculateCosineSimilarity(vector, sv.vector);
      return {
        index: sv.index,
        score: similarity,
        rank: 0, // Will be set after sorting
        sentence: sv.sentence,
      };
    });

    // Sort by similarity score (descending)
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    // Assign ranks
    sortedScores.forEach((score, index) => {
      score.rank = index + 1;
    });

    setSimilarityScores(sortedScores);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userQuery },
    ];
    setMessages(newMessages);

    // Get top N most relevant sentences for context
    const topSentences = sortedScores
      .slice(0, sentenceCount)
      .map((s) => s.sentence);
    const topIndexes = sortedScores.slice(0, sentenceCount).map((s) => s.index);

    // Generate response using Gemini
    setIsLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userQuery,
          context: topSentences.join(" "),
          apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.text }]);

      // Store response details
      setResponseDetails([
        ...responseDetails,
        {
          userQuery,
          matchedSentences: topSentences,
          matchedIndexes: topIndexes,
          finalPrompt: `Context: ${topSentences.join(
            " "
          )}\n\nUser question: ${userQuery}`,
        },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    }
    setIsLoading(false);
    setActiveTab("results");
  };

  // Calculate cosine similarity between two vectors
  const calculateCosineSimilarity = (
    vectorA: Record<string, number>,
    vectorB: Record<string, number>
  ) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Calculate dot product and magnitudes
    Object.keys(vectorA).forEach((key) => {
      dotProduct += vectorA[key] * vectorB[key];
      magnitudeA += vectorA[key] * vectorA[key];
      magnitudeB += vectorB[key] * vectorB[key];
    });

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    // Avoid division by zero
    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left side - Data and Evaluation */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>RAG Data Configuration</span>
              <div className="flex items-center gap-2">
                <ApiKeyConfig />
                <Button variant="outline" size="sm" onClick={resetData}>
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Configure your knowledge base with at least three sentences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="sentences">Sentences</TabsTrigger>
                <TabsTrigger value="vectors" disabled={!vectorized}>
                  Vectors
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  disabled={similarityScores.length === 0}
                >
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sentences" className="space-y-4">
                {sentences.map((sentence, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="shrink-0 w-6 h-6 flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <Input
                      placeholder={`Enter sentence ${index + 1}`}
                      value={sentence}
                      onChange={(e) =>
                        handleSentenceChange(index, e.target.value)
                      }
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

                <div className="flex justify-between">
                  <Button onClick={addSentence} variant="outline">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Sentence
                  </Button>
                  <Button
                    onClick={vectorizeSentences}
                    disabled={sentences.some((s) => s.trim() === "")}
                  >
                    <BarChart2Icon className="h-4 w-4 mr-2" />
                    Vectorize Sentences
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="vectors">
                <div className="space-y-4">
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Dictionary Created</AlertTitle>
                    <AlertDescription>
                      <span className="block mb-2">
                        Unique words found: {dictionary.length}
                      </span>
                      <ScrollArea className="h-20 border rounded-md p-2">
                        <div className="flex flex-wrap gap-1">
                          {dictionary.map((word, i) => (
                            <Badge key={i} variant="secondary">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Sentence Vectors (Count Vectorization)
                    </h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Index</TableHead>
                            <TableHead>Vector</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sentenceVectors.map((sv) => (
                            <TableRow key={sv.index}>
                              <TableCell>{sv.index + 1}</TableCell>
                              <TableCell>
                                {sv.sentence}
                                <ScrollArea className="h-6">
                                  <code className="text-xs bg-muted p-1 rounded block">
                                    {Object.values(sv.vector).join(", ")}
                                  </code>
                                </ScrollArea>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">User Query</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <p>{userQuery}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Query Vector</h3>
                    <div className="p-3 bg-muted rounded-md">
                      <code className="text-xs">
                        {Object.entries(queryVector)
                          .filter(([_, count]) => count > 0)
                          .map(([word, count]) => `${word}:${count}`)
                          .join(", ")}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Similarity Scores
                    </h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Index</TableHead>
                            <TableHead>Sentence</TableHead>
                            <TableHead>Cosine Similarity</TableHead>
                            <TableHead className="w-16">Rank</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {similarityScores.map((score) => (
                            <TableRow key={score.index}>
                              <TableCell>{score.index + 1}</TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {score.sentence}
                              </TableCell>
                              <TableCell>{score.score.toFixed(4)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    score.rank <= 2 ? "default" : "outline"
                                  }
                                >
                                  {score.rank}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Testing Panel */}
      <div>
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Testing Panel</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Top {sentenceCount} sentences</span>
                  <Slider
                    value={[sentenceCount]}
                    min={1}
                    max={sentences.length}
                    step={1}
                    onValueChange={([value]) => setSentenceCount(value)}
                    className="w-24"
                  />
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Test your RAG system by entering a query below
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden flex flex-col">
            <ScrollArea className="flex-grow pr-4 mb-4">
              {messages.length === 0 ? (
                getInitialMessage()
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {message.content}
                          {message.role === "assistant" && (
                            <ResponseDetailsModal
                              details={responseDetails[Math.floor(index / 2)]}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="flex w-full gap-2">
              <Input
                placeholder="Enter your query..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                disabled={
                  !vectorized ||
                  isLoading ||
                  !localStorage.getItem("geminiApiKey")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    processQuery();
                  }
                }}
              />
              <Button
                onClick={processQuery}
                disabled={
                  !vectorized ||
                  !userQuery.trim() ||
                  isLoading ||
                  !localStorage.getItem("geminiApiKey")
                }
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
