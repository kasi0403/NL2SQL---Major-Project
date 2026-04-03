from crewai import Task, Crew
from agents.nl2sql_agent import nl2sql_agent
from agents.correction_agent import correction_agent
from agents.validator_agent import validator_agent
from context.schema_context import get_schema_context
from tools.sql_tools import validate_sql

MAX_RETRIES = 5


def clean_sql_output(sql_text: str):
    sql_text = str(sql_text).strip()

    if sql_text.startswith("```"):
        sql_text = sql_text.replace("```sql", "")
        sql_text = sql_text.replace("```", "")

    sql_text = sql_text.replace("EXPLAIN", "")
    sql_text = sql_text.strip()

    return sql_text


def validate_with_llm(sql_query, schema_context):
    """
    Uses validator agent to check schema correctness before execution
    """
    description = f"""
You are a SQL validator.

Database Schema:
{schema_context}

SQL Query:
{sql_query}

Check whether the SQL query uses only valid tables and columns.
Respond with ONLY one word:
VALID or INVALID
"""

    task = Task(
        description=description,
        expected_output="VALID or INVALID",
        agent=validator_agent
    )

    crew = Crew(
        agents=[validator_agent],
        tasks=[task],
        verbose=False
    )

    result = crew.kickoff()
    return "VALID" in str(result)


def generate_sql(user_query):
    schema_context = get_schema_context(user_query)

    sql_query = None
    error_message = None

    for attempt in range(MAX_RETRIES):

        # FIRST ATTEMPT → NL2SQL
        if attempt == 0:
            description = f"""
You are an expert SQL generator.

Database Schema:
{schema_context}

Rules:
- Use only tables and columns from the schema.
- Always use JOINs using foreign keys when needed.
- When merging two tables via JOIN, you MUST explicitly select and preserve the exact order of columns from both tables as defined in the schema.
- Do not guess column names.
- Return ONLY raw SQL.
- Output must start with SELECT.
- Use PostgreSQL syntax.

User Question:
{user_query}
"""

            task = Task(
                description=description,
                expected_output="A valid SQL SELECT query",
                agent=nl2sql_agent
            )

            crew = Crew(
                agents=[nl2sql_agent],
                tasks=[task],
                verbose=True
            )

        # NEXT ATTEMPTS → CORRECTION AGENT
        else:
            description = f"""
The SQL query is invalid.

Previous SQL Query:
{sql_query}

Error Message:
{error_message}

Database Schema:
{schema_context}

Fix the SQL query using the schema.
Return ONLY corrected SQL query.
"""

            task = Task(
                description=description,
                expected_output="A corrected SQL query",
                agent=correction_agent
            )

            crew = Crew(
                agents=[correction_agent],
                tasks=[task],
                verbose=True
            )

        # Run CrewAI
        sql_query = crew.kickoff()
        sql_query = clean_sql_output(sql_query)

        print("\nGenerated SQL:", sql_query)

        # STEP 1 → VALIDATE WITH LLM (SCHEMA CHECK)
        is_schema_valid = validate_with_llm(sql_query, schema_context)

        if not is_schema_valid:
            error_message = "Schema validation failed. Invalid table or column names."
            print("Validator: INVALID SQL")
            continue
        else:
            print("Validator: SQL is schema-valid")

        # STEP 2 → VALIDATE WITH DATABASE (EXPLAIN)
        is_valid, error_message = validate_sql(sql_query)

        if is_valid:
            print("SQL Executed Successfully")
            return sql_query
        else:
            print("SQL Error:", error_message)

    return f"Failed after {MAX_RETRIES} attempts. Last error: {error_message}"