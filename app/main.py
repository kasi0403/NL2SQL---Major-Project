from flask import Flask, request, jsonify
from flask_cors import CORS
from connectors.postgres_connector import PostgresConnector
from connectors.mysql_connector import MySQLConnector
import active_db
import re
from vectorstore.chroma_store import ingest_schema
from services.nl2sql_service import generate_sql

app = Flask(__name__)
CORS(app)

@app.route('/api/connect', methods=['POST'])
def connect_db():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"success": False, "error": "No URL provided"}), 400

    try:
        # Regex to check database type
        if re.match(r"^postgresql(\+psycopg2)?://", url):
            connector = PostgresConnector(url)
            db_type = "PostgreSQL"
        elif re.match(r"^mysql(\+pymysql)?://", url):
            # SQLAlchemy needs mysql+pymysql:// if dialect is default
            if url.startswith("mysql://"):
                url = url.replace("mysql://", "mysql+pymysql://", 1)
            connector = MySQLConnector(url)
            db_type = "MySQL"
        else:
            return jsonify({"success": False, "error": "Unsupported database type. URL must start with postgresql:// or mysql://"}), 400

        # Test connection
        test_res = connector.test_connection()
        if test_res is not True:
            return jsonify({"success": False, "error": f"Connection failed: {test_res}"}), 400

        # Retrieve Schema
        schema = connector.get_schema()
        
        # Make the connector globally active for the queries
        active_db.active_connector = connector

        # Ingest schema into Chroma
        ingest_schema(schema)

        return jsonify({
            "success": True, 
            "db_type": db_type,
            "schema": schema,
            "message": f"Successfully connected to {db_type}."
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/query', methods=['POST'])
def query_db():
    data = request.json
    user_query = data.get('query')

    if not user_query:
        return jsonify({"success": False, "error": "No query provided"}), 400

    if not active_db.active_connector:
        return jsonify({"success": False, "error": "No active database connection"}), 400

    try:
        sql = generate_sql(user_query)

        if sql.startswith("Failed"):
            return jsonify({"success": False, "error": sql, "sql": None, "results": None})

        # Execute query
        results = active_db.active_connector.execute_query(sql)

        # Generate Insights (Charts, Summary, Anomalies, Follow-ups)
        insights_data = {}
        try:
            from services.insights_service import generate_insights
            insights_data = generate_insights(user_query, sql, results)
        except Exception as e:
            print("Insights error:", e)

        return jsonify({
            "success": True,
            "sql": sql,
            "results": results,
            "insights": insights_data
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e), "sql": None, "results": None})

if __name__ == "__main__":
    app.run(port=5000, debug=True)