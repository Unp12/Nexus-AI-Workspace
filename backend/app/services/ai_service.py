import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("YOUR_GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

def generate_agent_response(system_prompt: str, user_message: str) -> str:
    """Dynamically finds the available Flash model and generates a response."""
    
    # 1. Dynamically find the correct model name (e.g., 'models/gemini-1.5-flash-latest')
    available_models = [m.name for m in genai.list_models() 
                        if 'generateContent' in m.supported_generation_methods 
                        and 'flash' in m.name.lower()]
    
    if not available_models:
        # Fallback to a safe default if list fails
        model_name = "gemini-1.5-flash"
    else:
        # Use the first valid Flash model found
        model_name = available_models[0]

    # 2. Initialize the model
    model = genai.GenerativeModel(model_name=model_name)
    
    # 3. Combine Instructions and Message
    combined_prompt = f"SYSTEM_INSTRUCTIONS:\n{system_prompt}\n\nUSER_MESSAGE:\n{user_message}"
    
    response = model.generate_content(combined_prompt)
    return response.text