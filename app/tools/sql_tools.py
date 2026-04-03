import active_db

def validate_sql(query: str):
    """
    Dry run SQL validation
    """
    try:
        test_query = f"EXPLAIN {query}"
        active_db.active_connector.execute_query(test_query)
        return True, "SQL is valid"
    except Exception as e:
        return False, str(e)