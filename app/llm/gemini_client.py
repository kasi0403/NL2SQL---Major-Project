import google.genai as genai
import os
from dotenv import load_dotenv
from functools import partial
from crewai import LLM

load_dotenv()

llm = LLM(provider="gemini", model="gemini-2.5-pro", api_key=os.getenv("GEMINI_API_KEY"))

# Client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_gemini_model():
    return llm