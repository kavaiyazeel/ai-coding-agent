# AI Coding Agent

AI Coding Agent is a coding assistant that analyzes Python code, detects
syntax and other potential issues, suggests fixes, and validates solutions
using an AI agent.

## Frontend

The frontend is a React and Vite coding workspace that provides:

- Dashboard workspace with project navigation
- Create, rename, delete, duplicate, and open projects
- Code editor with language selection
- Save code to the selected project during the current session
- Basic Python checks for:
  - Possible division by zero
  - Bare `except` blocks
  - Lines longer than 100 characters
- Code review history
- User settings for the default language and editor font size

> The current frontend review screen uses basic browser checks. The frontend
> has not been connected to the backend API yet.

### Frontend structure

```text
src/
├── components/    # React workspace components
├── App.jsx        # Frontend application state and layout
├── App.css        # Application styles
├── index.css      # Global styles
└── main.jsx       # React entry point
```

### Frontend setup

#### Prerequisites

- Node.js and npm

#### Installation

```bash
npm install
```

#### Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

#### Frontend scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Backend

The backend is a FastAPI application with these endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /` | Check that the backend is running |
| `POST /analyze` | Validate Python syntax |
| `POST /ai-review` | Request an AI-powered Python code review |

The AI review uses a local Ollama server with the
`qwen2.5-coder:1.5b` model.

### Backend structure

```text
backend/
├── ai_agent.py    # Ollama-based AI review logic
├── analyzer.py    # Python syntax validation
└── main.py        # FastAPI application and API endpoints
```

### Backend requirements

- Python
- FastAPI
- Pydantic
- Ollama running locally at `http://127.0.0.1:11434`

## Development Notes

Frontend project data, editor content, settings, and review history are
currently kept in React state, so they reset when the page is refreshed.
Persistent storage and frontend-backend integration can be added in a future
version.

Do not commit API keys, local environment files, or generated directories such
as `node_modules` and `dist`.
