def format_schema_text(schema: dict):
    schema_texts = []

    for table, columns in schema.items():
        col_desc = ", ".join([f"{col['name']} ({col['type']})" for col in columns])
        text = f"Table {table} has columns: {col_desc}"
        schema_texts.append((table, text))

    return schema_texts