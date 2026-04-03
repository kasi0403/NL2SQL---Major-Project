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

def clear_schema_database():
    try:
        client.delete_collection("schema_embeddings")
    except:
        pass
    global collection
    collection = client.get_or_create_collection(name="schema_embeddings")

def ingest_schema(schema_dict):
    clear_schema_database()
    for table_name, table_info in schema_dict.items():
        columns = ", ".join([f"{col['name']} ({col['type']})" for col in table_info['columns']])
        fks_list = []
        for fk in table_info.get('foreign_keys', []):
            fks_list.append(f"Foreign Key: {', '.join(fk['constrained_columns'])} references {fk['referred_table']}({', '.join(fk['referred_columns'])})")
        fks_str = " | ".join(fks_list) if fks_list else "No foreign keys"

        text = f"Table: {table_name}\nColumns: {columns}\nRelationships: {fks_str}"
        store_schema_embedding(f"table_{table_name}", text)

def search_schema(query, n_results=5):
    try:
        if collection.count() == 0:
            return [[]]
    except:
        return [[]]
        
    embedding = get_embedding(query)
    
    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results
    )
    
    return results["documents"]