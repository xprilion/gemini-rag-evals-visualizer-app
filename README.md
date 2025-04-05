# RAG Evals App

A Next.js application for evaluating and visualizing RAG (Retrieval-Augmented Generation) systems. This application provides a user-friendly interface to test and analyze the performance of RAG implementations through various metrics and visualizations.

## Features

- Interactive chat interface for testing RAG systems
- Real-time visualization of vector embeddings
- Cosine similarity scoring and ranking
- Comprehensive evaluation tables for:
  - Sentence analysis
  - Vector representations
  - Query information
  - Similarity scores

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Language**: TypeScript
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Data Visualization**: Recharts
- **Date Handling**: date-fns
- **AI Integration**: Vercel AI SDK

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended package manager)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/xprilion/gemini-rag-evals-visualizer-app.git
cd gemini-rag-evals-visualizer-app
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
gemini-rag-evals-visualizer-app/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── page.tsx        # Main page component
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── styles/            # Global styles
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
