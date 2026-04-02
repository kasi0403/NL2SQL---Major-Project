from connectors.postgres_connector import PostgresConnector
from config.db_config import DB_CONFIG

connector = PostgresConnector(DB_CONFIG["postgres"])

def validate_sql(query: str):
    """
    Dry run SQL validation
    """
    try:
        test_query = f"EXPLAIN {query}"
        connector.execute_query(test_query)
        return True, "SQL is valid"
    except Exception as e:
        return False, str(e)