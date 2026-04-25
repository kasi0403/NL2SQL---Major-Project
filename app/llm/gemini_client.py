# import google.genai as genai
# import os
# from dotenv import load_dotenv
# from functools import partial
# from crewai import LLM

# load_dotenv()

# llm = LLM(provider="gemini", model="gemini-2.5-pro", api_key=os.getenv("GEMINI_API_KEY"))

# # Client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# def get_gemini_model():
#     return llm

# import os
# from dotenv import load_dotenv
# from crewai import LLM

# load_dotenv()

# def get_ollama_model():
#     llm = LLM(
#         provider="openai",  # Ollama uses OpenAI-compatible format
#         base_url="http://localhost:11434/v1",
#         model="sqlcoder",   # your Ollama model
#         api_key="ollama"    # dummy value (Ollama ignores it)
#     )
#     return llm

import os
from dotenv import load_dotenv
from crewai import LLM

load_dotenv()

def get_gemini_model():
    llm = LLM(
        provider="openai",                      # Ollama uses OpenAI-compatible API
        base_url="http://localhost:11434/v1",   # local Ollama server
        model="llama3:latest",                  # 👈 your model
        api_key="ollama"                        # dummy (not used)
    )
    return llm