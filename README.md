# Nexus AI Workspace 🧠💼

An Enterprise AI Agent Platform designed to provide a secure, multi-tenant environment where users can register, manage, and interact with specialized, autonomous AI agents. 

This system upgrades basic LLM interactions into an Agentic architecture capable of long-term memory, tool execution, and recursive task processing.

## 🚀 Tech Stack

* **Frontend:** React.js, Vite, JavaScript (ES6+)
* **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic V2
* **Database & ORM:** PostgreSQL (Production), SQLite (Local), SQLAlchemy 2.0, Alembic
* **Security:** OAuth2 (Password Flow), JSON Web Tokens (JWT), Passlib (Bcrypt)
* **AI Integration:** Google Generative AI API (Gemini Pro)
* **DevOps & Orchestration:** Docker, Docker Compose

## 💡 Core Functionalities

* **Secure Multi-Tenancy:** Locked down using OAuth2 and password hashing. Only requests with valid JWTs are processed, ensuring isolated data environments for every user.
* **Agentic Memory:** A robust relational database schema links `Users`, `Agents`, and `ChatHistory`, acting as the "Long-Term Memory" for the AI across sessions.
* **Strict Validation:** Pydantic V2 schemas enforce robust data entry and govern the flow of data through dependency-injected backend routes.
* **Traffic Control:** Implemented strict rate limiting (10 requests/minute) via `slowapi` to protect Google Gemini API thresholds.
* **Asynchronous Processing:** Heavy Agentic loops are offloaded to Background Tasks, preventing UI freezes during complex operations.
* **Zero-Downtime Migrations:** Database version control is safely managed using Alembic migrations.

## 🏗️ Architecture & Database Workflow

The system relies on a strictly typed relational database (managed via SQLAlchemy) to handle secure context retention:
1. **The Vault (Users):** Stores user IDs, emails, and bcrypt-hashed passwords.
2. **The Personas (Agents):** Linked to specific users. Stores agent names, selected LLM models, and strict system instructions.
3. **The Hippocampus (ChatHistory):** Linked to specific agents. Stores exact timestamps and conversational roles, allowing FastAPI to package historical context with every new prompt sent to the Gemini API.

## 🏃‍♂️ Local Deployment (Docker)

This application is fully containerized for environment-agnostic deployment. 

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* A valid Google Gemini API Key.

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR-USERNAME/nexus-ai-workspace.git](https://github.com/YOUR-USERNAME/nexus-ai-workspace.git)
   cd nexus-ai-workspace

2.Environment Variables:
Create a .env file in the backend directory and add your credentials:

Code snippet
GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=your_jwt_secret_key
DATABASE_URL=sqlite:///./nexus.db

3.Build and Spin Up the Containers:
Run the following command from the root directory to orchestrate the frontend and backend:

Bash
docker compose up --build
Access the Application:

Frontend (React): http://localhost:5173

Backend API Docs (Swagger UI): http://localhost:8000/docs

4.🛤️ Typical User Flow
Registration: User creates an account; password is encrypted via Bcrypt.

Authentication: User logs in, receiving a JWT for secure session management.

Configuration: User creates a tailored AI persona (e.g., "Financial Analyst").

Interaction: User prompts the AI. FastAPI retrieves historical context from the database, queries Gemini, logs the processing latency via custom middleware, and returns the contextualized response.
