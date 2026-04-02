from vectorstore.chroma_store import search_schema

def get_schema_context(user_query):
    results = search_schema(user_query)
    context = "\n".join(results[0])
    return context