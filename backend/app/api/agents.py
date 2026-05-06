from pathlib import Path
import os
from google import genai
from google.genai import types # FIX 1: Imported types from the correct library
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status,exceptions
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.agent import Agent
from app.models.user import User
from app.models.message import Message
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File

# --- LOAD ENVIRONMENT ---
#load_dotenv()

# 1. Define the ENV_PATH variable correctly
# Path(__file__) is agents.py. We go up 3 levels to reach the backend folder.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"  # <--- This defines the variable

# 2. Load the environment using the variable you just defined
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
    print(f"--- SUCCESS: Found .env at {ENV_PATH} ---")
else:
    print(f"--- ERROR: .env file NOT FOUND at {ENV_PATH} ---")
    
GEMINI_API_KEY= os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("--- ERROR: GOOGLE_API_KEY not found in environment! ---")
    # You can temporarily hardcode it here just to test if the .env load is the only issue:
    # GEMINI_API_KEY = "AIza..."

client = genai.Client(api_key=GEMINI_API_KEY)

router = APIRouter(prefix="/agents", tags=["agents"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

# --- SCHEMAS ---
class AgentCreate(BaseModel):
    name: str
    system_prompt: str = ""

class ChatRequest(BaseModel):
    message: str

# --- ROUTES ---

@router.get("/")
def get_agents(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token != "nexus_access_token_demo":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return db.query(Agent).all()

@router.post("/")
def create_agent(agent_data: AgentCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token != "nexus_access_token_demo":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).first()
    
    new_agent = Agent(
        name=agent_data.name,
        system_prompt=agent_data.system_prompt,
        owner_id=user.id if user else 1
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return new_agent

# FIX 2: ADDED THE MISSING GET HISTORY ROUTE FOR THE REACT FRONTEND
@router.get("/{agent_id}/history")
def get_chat_history(agent_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token != "nexus_access_token_demo":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    messages = db.query(Message).filter(Message.agent_id == agent_id).order_by(Message.timestamp.asc()).all()
    return messages

# --- AGENT TOOLS ---
def get_live_weather(location: str) -> str:
    """Fetches the real-time weather for a given city."""
    # This print statement will let you see the AI triggering the tool in your terminal
    print(f"\n[SYSTEM] -> AI executing get_live_weather for: {location}\n")
    
    # In a production app, you would hit a real API like OpenWeatherMap here.
    # For now, we use a mock database.
    mock_weather = {
        "Bangalore": "28°C and partly cloudy. Perfect weather for coding.",
        "Amaravathi": "35°C and very sunny. Stay hydrated!",
        "Mumbai": "31°C and humid.",
        "London": "15°C and raining."
    }
    
    return mock_weather.get(location, f"I do not have real-time data for {location} right now.")


@router.post("/{agent_id}/chat")
def chat_with_agent(agent_id: int, request: ChatRequest, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if token != "nexus_access_token_demo":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # 1. Save User's message to Database FIRST
    user_msg = Message(agent_id=agent_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    # 2. Fetch the last 10 messages for context
    history_records = db.query(Message).filter(Message.agent_id == agent_id).order_by(Message.timestamp.asc()).limit(10).all()
    
    # 3. Format history for the Gemini SDK
    chat_history = []
    for msg in history_records:
        if msg.id == user_msg.id: 
            continue
        chat_history.append(
            types.Content(role=msg.role, parts=[types.Part.from_text(text=msg.content)])
        )

# --- DIAGNOSTIC: Print available models to your terminal ---
    print("\n--- FETCHING AVAILABLE MODELS ---")
    try:
        for m in client.models.list():
            if "flash" in m.name:
                print(f"AVAILABLE FLASH MODEL: {m.name}")
    except Exception as list_error:
        print(f"Could not list models: {list_error}")
    print("---------------------------------\n")

    # --- ACTUAL AI CALL ---
    try:
        # We pass the function directly into the tools array
        chat = client.chats.create(
            model="gemini-2.5-flash", 
            config={
                "system_instruction": agent.system_prompt,
                "tools": [get_live_weather]  # <-- THE AI NOW HAS HANDS
            },
            history=chat_history
        )
        
        # Send the new message. If the AI decides it needs weather data, 
        # the SDK will automatically pause, run your Python function, 
        # feed the result back to the AI, and then generate the final reply!
        response = chat.send_message(request.message)

        # Save the AI's final response to the database
        ai_msg = Message(agent_id=agent_id, role="model", content=response.text)
        db.add(ai_msg)
        db.commit()
        
        return {"reply": response.text}
    
    except Exception as e:
        if "429" in str(e):
             raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait a moment.")
        
        print(f"Gemini Error: {e}")
        raise HTTPException(status_code=500, detail="AI Engine error")
    
    except exceptions.ServiceUnavailable:
        # This catches the 503 error specifically
        raise HTTPException(
            status_code=503, 
            detail="AI is currently busy in Bangalore! Please try again in 30 seconds."
        )
    
@router.post("/{agent_id}/upload")
async def upload_knowledge(
    agent_id: int, 
    file: UploadFile = File(...), 
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
):
    if token != "nexus_access_token_demo":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        # 1. Read the uploaded file
        content = await file.read()
        extracted_text = content.decode("utf-8")

        # 2. Update the Agent's system prompt with this new knowledge
        # We append it so we don't overwrite their original personality
        new_knowledge = f"\n\n--- NEW KNOWLEDGE BASE ---\n{extracted_text}\n--------------------------"
        agent.system_prompt += new_knowledge
        
        db.commit()
        db.refresh(agent)

        return {"filename": file.filename, "status": "Knowledge successfully injected!"}

    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail="Could not process file. Ensure it is a valid text file.")


