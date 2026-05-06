from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.users import router as auth_router
from app.api.agents import router as agent_router

# Explicitly import models before create_all so SQLAlchemy registers them
from app.models.user import User
from app.models.agent import Agent

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NEXUS AI Workspace")

# CORS CONFIGURATION: Allows your React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication routes
app.include_router(auth_router)
app.include_router(agent_router)

@app.get("/")
def root():
    return {"message": "NEXUS AI Backend is running"}