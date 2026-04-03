from sqlalchemy import create_engine, inspect, text
from connectors.base_connector import DatabaseConnector

class MySQLConnector(DatabaseConnector):
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
            # Get Primary Key
            pk_info = inspector.get_pk_constraint(table)
            pk_cols = pk_info.get("constrained_columns", []) if pk_info else []

            columns = []
            for column in inspector.get_columns(table):
                columns.append({
                    "name": column["name"],
                    "type": str(column["type"]),
                    "is_pk": column["name"] in pk_cols,
                    "nullable": column.get("nullable", True)
                })
            
            fks = []
            for fk in inspector.get_foreign_keys(table):
                fks.append({
                    "constrained_columns": fk["constrained_columns"],
                    "referred_table": fk["referred_table"],
                    "referred_columns": fk["referred_columns"]
                })
            
            schema[table] = {
                "columns": columns,
                "foreign_keys": fks,
                "primary_keys": pk_cols
            }

        return schema

    def execute_query(self, query: str):
        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            return [dict(row._mapping) for row in result]
