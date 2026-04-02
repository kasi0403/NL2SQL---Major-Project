from agents.schema_agent import run_schema_discovery
from context.schema_context import get_schema_context

# Step 1: Index schema
print(run_schema_discovery())

# Step 2: Search schema using natural language
query = "get all employees and their departments"
context = get_schema_context(query)

print("\nRelevant Schema Context:")
print(context)