from sqlalchemy import create_engine, inspect, text
from connectors.base_connector import DatabaseConnector

class PostgresConnector(DatabaseConnector):
    def __init__(self, connection_string):
        self.engine = create_engine(connection_string)

    def test_connection(self):
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except Exception as e:
            return str(e)

    def get_schema(self):
        inspector = inspect(self.engine)
        schema = {}

        for table in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table):
                columns.append({
                    "name": column["name"],
                    "type": str(column["type"])
                })
            
            schema[table] = columns

        return schema

    def execute_query(self, query: str):
        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            return [dict(row._mapping) for row in result]