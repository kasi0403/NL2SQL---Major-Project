from crewai import Agent, Task, LLM
from connectors.postgres_connector import PostgresConnector
from utils.schema_formatter import format_schema_text
from vectorstore.chroma_store import store_schema_embedding
from config.db_config import DB_CONFIG
import os

def run_schema_discovery():

    connector = PostgresConnector(DB_CONFIG["postgres"])
    schema = connector.get_schema()

    schema_texts = format_schema_text(schema)

    for table, text in schema_texts:
        store_schema_embedding(table, text)

    return "Schema indexed successfully"

llm = LLM(provider="gemini", model="gemini-1.5-flash", api_key=os.getenv("GEMINI_API_KEY"))

schema_agent = Agent(
    role="Database Schema Analyst",
    goal="Understand database schema and store semantic meaning of tables and columns",
    backstory="You are an expert database analyst who understands database structures and relationships.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)


schema_task = Task(
    description="Extract database schema, generate descriptions, and store embeddings in vector database.",
    agent=schema_agent,
    expected_output="Schema embeddings stored in vector DB"
)