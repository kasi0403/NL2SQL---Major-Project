from connectors.postgres_connector import PostgresConnector
from config.db_config import DB_CONFIG

def main():
    connector = PostgresConnector(DB_CONFIG["postgres"])

    print("Testing connection...")
    print(connector.test_connection())

    print("\nSchema:")
    schema = connector.get_schema()
    print(schema)

    print("\nQuery Result:")
    result = connector.execute_query("SELECT * FROM employees LIMIT 1;")
    print(result)

if __name__ == "__main__":
    main()