"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function RAGEvalsApp() {
  const [message, setMessage] = useState("")

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-black p-4 gap-4">
      {/* Left side - Evaluation tables */}
      <div className="flex flex-col w-full md:w-1/2 gap-6">
        {/* Sentence table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 w-24 text-left">Index</th>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 text-left">Sentence</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Vector table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 w-24 text-left">Index</th>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 text-left">vector</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Query info */}
        <div className="bg-blue-100 rounded-md p-4">
          <p className="text-black">User query:</p>
          <p className="text-black">Query Vector:</p>
        </div>

        {/* Cosine similarity table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 w-24 text-left">Index</th>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 text-left">Cosine similarity score</th>
                <th className="bg-blue-100 text-black border border-gray-300 p-2 w-24 text-left">Rank</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
                <td className="bg-blue-100 border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right side - Chat interface */}
      <div className="flex flex-col w-full md:w-1/2">
        <div className="bg-blue-100 rounded-lg flex flex-col h-full">
          {/* Header */}
          <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-100 text-center text-black text-lg font-medium">
            Testing Panel
          </div>

          {/* Chat area */}
          <div className="flex-grow p-4 flex flex-col gap-4">
            {/* User message */}
            <div className="self-end">
              <div className="bg-green-100 text-black p-4 rounded-lg max-w-xs">Hello</div>
            </div>

            {/* Bot message */}
            <div className="self-start">
              <div className="bg-white text-black p-4 rounded-lg max-w-xs">Hey, how can I help you today?</div>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 mt-auto">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white">
              <input
                type="text"
                placeholder="Your message here..."
                className="flex-grow p-4 outline-none text-black"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="bg-blue-200 p-2 px-4 text-black hover:bg-blue-300 transition-colors">
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

