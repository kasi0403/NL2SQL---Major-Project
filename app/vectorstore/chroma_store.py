import chromadb
from chromadb.config import Settings
from utils.embeddings import get_embedding

client = chromadb.Client(Settings(persist_directory="./chroma_db"))

collection = client.get_or_create_collection(name="schema_embeddings")

def store_schema_embedding(id, text):
    embedding = get_embedding(text)
    
    collection.add(
        ids=[id],
        embeddings=[embedding],
        documents=[text]
    )

def search_schema(query, n_results=5):
    embedding = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )
    
    return results["documents"]