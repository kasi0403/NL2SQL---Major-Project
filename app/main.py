# STAGE -1: Initial setup and testing of database connection
# from connectors.postgres_connector import PostgresConnector
# from config.db_config import DB_CONFIG

# def main():
#     connector = PostgresConnector(DB_CONFIG["postgres"])

#     print("Testing connection...")
#     print(connector.test_connection())

#     print("\nSchema:")
#     schema = connector.get_schema()
#     print(schema)

#     print("\nQuery Result:")
#     result = connector.execute_query("SELECT * FROM employees LIMIT 1;")
#     print(result)

# if __name__ == "__main__":
#     main()

# STAGE 2: Basic NL2SQL pipeline with fixed SQL query
from services.nl2sql_service import generate_sql
from connectors.postgres_connector import PostgresConnector
from config.db_config import DB_CONFIG

def main():
    connector = PostgresConnector(DB_CONFIG["postgres"])

    while True:
        user_query = input("\nAsk a question: ")
        
        sql = generate_sql(user_query)
        print("\nGenerated SQL:", sql)

        if "Failed" not in sql:
            result = connector.execute_query(sql)
            print("\nResult:", result)

if __name__ == "__main__":
    main()