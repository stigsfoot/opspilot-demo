# ITSM OpsPilot Frontend

This is the frontend for the ITSM OpsPilot application, an AI-powered IT Service Management Triage & Resolution system.

## Technologies Used

- **Next.js 14+** - React framework with server-side rendering
- **TypeScript** - For type safety
- **Tailwind CSS** - For styling
- **shadcn/ui** - Component library built on Radix UI
- **React Query** - For data fetching and state management
- **Zod** - For runtime type validation

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

The application uses the `.env` file in the project root directory for both the backend and frontend configuration. Make sure your root `.env` file contains:

```
# Backend settings
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend settings
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Alternatively, you can create a local frontend-specific configuration by copying `.env.example` to `.env.local` in the frontend directory:

```bash
cp .env.example .env.local
```

The application will prioritize using the frontend's `.env.local` if available, but will fall back to the root `.env` file values.

### Development

To run the development server:

```bash
npm run dev
```

This will start the frontend application on [http://localhost:3000](http://localhost:3000).

### Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes for proxy
│   │   ├── components/  # App-specific components
│   │   ├── lib/         # Utilities and API clients
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/      # Shared UI components (shadcn)
│   │   └── ui/          # shadcn UI components
│   └── lib/             # Shared utilities
├── .env.local           # Environment variables (create this)
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Connecting to the Backend

The frontend uses a proxy API route to avoid CORS issues with the backend. The proxy is set up in `/src/app/api/proxy/route.ts` and automatically forwards requests to the backend server.

By default, it connects to `http://localhost:8000`. To change this, set the `NEXT_PUBLIC_BACKEND_URL` environment variable.

### Direct LLM Integration

The application includes a direct Gemini 2.5 Pro integration that can be used if the backend is unavailable or if you prefer to use the LLM directly. This integration:

1. Sends requests directly to the latest Gemini 2.5 Pro API
2. Supports multimodal queries with images
3. Formats responses to match the backend's format
4. Includes structured reasoning steps and classification

To use this integration, you need to provide a Gemini API key in your root `.env` file or frontend `.env.local` file:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

The direct LLM integration will be used automatically if the backend server is not available.

## Running the Full Stack

To run the complete application:

1. Start the backend server:

```bash
# From the project root
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:

```bash
# From the project root
cd frontend
npm run dev
```

Now you can access the application at http://localhost:3000.

## Development Workflow

1. The frontend sends user messages to the backend triage agent via the API proxy
2. The backend classifies the issue, retrieves relevant knowledge base articles, and provides solutions
3. If no suitable solution is found, the issue is escalated to human support
4. The frontend displays the response to the user with proper formatting

## Troubleshooting

If you encounter connection issues:

1. Check that the backend server is running
2. Verify that the `NEXT_PUBLIC_BACKEND_URL` environment variable is set correctly
3. Check the browser console for API errors
4. Verify that the backend endpoint is accessible directly
