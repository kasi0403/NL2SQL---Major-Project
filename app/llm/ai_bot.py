import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()

# Configure Groq API LLM
ai_bot = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

def get_ai_bot():
    """Returning Groq model"""
    return ai_bot
