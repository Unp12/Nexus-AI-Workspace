from pydantic import BaseModel, Field

# What the user sends us to create an Agent
class AgentCreate(BaseModel):
    name: str = Field(..., description="E.g., Python Code Reviewer")
    system_prompt: str = Field(..., description="The strict instructions for this AI")

# What we send back to the React app
class AgentResponse(BaseModel):
    id: int
    name: str
    system_prompt: str
    user_id: int  # Proves who owns this agent!

    class Config:
        from_attributes = True
        
# What the user sends to the AI
class ChatRequest(BaseModel):
    message: str = Field(..., description="The message you want to send to the AI")

# What the AI sends back
class ChatResponse(BaseModel):
    reply: str