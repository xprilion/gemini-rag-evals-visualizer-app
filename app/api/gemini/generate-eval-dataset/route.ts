import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { documents, numQuestions, numQueries, apiKey } =
      await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: documents.join("\n"),
                },
              ],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text: `Given the following list of documents in a dataset, you have to come up with ${numQuestions} queries that can be asked on that dataset such that:
1. ${numQueries} of the queries can bring up good search results
2. ${numQueries} of the queries are complex and need strong algorithms for better results
3. ${numQueries} of the queries are good for multiple document outcomes, assign multiple values to matched_indexes field.
4. ${numQueries} of the queries should not have any responses from the dataset, use invented words, questions with no sense and non english languages
5. Don't provide any numbering to the query phrases.
6. ${numQueries} queries will be between 1 to 3 words.
7. ${numQueries} queries will be between 4 to 6 words.
8. ${numQueries} queries will be 7 or more words.

use the indexes as mentioned by the user as numbering.

documents provided in user query`,
              },
            ],
          },
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                query_pairs: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      matched_indexes: {
                        type: "array",
                        items: {
                          type: "number",
                        },
                      },
                      question: {
                        type: "string",
                      },
                    },
                    required: ["matched_indexes", "question"],
                  },
                },
              },
              required: ["query_pairs"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate evaluation dataset");
    }

    const data = await response.json();
    return NextResponse.json(
      data.candidates[0].content.parts[0].text
        ? JSON.parse(data.candidates[0].content.parts[0].text)
        : { query_pairs: [] }
    );
  } catch (error) {
    console.error("Error generating evaluation dataset:", error);
    return NextResponse.json(
      { error: "Failed to generate evaluation dataset" },
      { status: 500 }
    );
  }
}
