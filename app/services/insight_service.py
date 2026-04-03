import json
from crewai import Task, Crew
from agents.insight_agent import insight_agent
import active_db

def clean_json_output(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def generate_insights(user_query, sql_query, results, schema_context):
    sample_data = results[:50] if results else []
    
    prompt = f"""
    User Query: {user_query}
    Executed SQL: {sql_query}
    Database Schema: {schema_context}
    Data Sample (up to 50 rows):
    {json.dumps(sample_data, default=str)}

    Perform a comprehensive analysis and return a STRICT JSON object with this schema:
    {{
        "insights": ["List of insights from the data. Include trends, growth rates, highest/lowest etc."],
        "anomalies": ["List of weird drops/spikes or unusually high/low variance. Return empty array if none."],
        "follow_up_questions": ["3 suggested conversational follow-up questions."],
        "primary_chart": {{
            "actionable": true/false (true if the primary Data Sample can be meaningfully graphed),
            "title": "Chart Title",
            "chart_type": "bar|line|pie",
            "x_axis_key": "the exact key in the Data Sample for the X axis",
            "y_axis_key": "the exact key in the Data Sample for the Y axis"
        }},
        "dashboard_queries": [
            {{
                "title": "Chart title",
                "sql": "Valid full SQL query",
                "chart_type": "bar|line|pie",
                "x_axis_key": "x axis key returned by sql",
                "y_axis_key": "y axis key returned by sql"
            }}
        ]
    }}

    Rules:
    - Determine the best chart based on the user's query and data.
    - If user asks for general 'analysis' or 'dashboard' or 'summary', fill `dashboard_queries` with 2-4 appropriate SQL queries using the Database Schema.
    - Otherwise, leave `dashboard_queries` empty.
    - Make sure keys match EXACTLY the keys in the data.
    - Ensure output is ONLY valid JSON.
    """

    task = Task(
        description=prompt,
        expected_output="A JSON object containing insights, anomalies, follow_up_questions, and charts.",
        agent=insight_agent
    )

    crew = Crew(
        agents=[insight_agent],
        tasks=[task],
        verbose=False
    )
    
    raw_result = crew.kickoff()
    cleaned_json = clean_json_output(str(raw_result))
    
    try:
        data = json.loads(cleaned_json)
        charts = []
        
        # Primary Chart
        primary = data.get("primary_chart", {})
        if primary.get("actionable") and primary.get("x_axis_key") and primary.get("y_axis_key"):
            charts.append({
                "title": primary.get("title", "Chart"),
                "type": primary.get("chart_type", "bar"),
                "x": primary.get("x_axis_key"),
                "y": primary.get("y_axis_key"),
                "data": results
            })
            
        # Dashboard Queries
        db_queries = data.get("dashboard_queries", [])
        if active_db.active_connector and isinstance(db_queries, list):
            for q in db_queries:
                try:
                    cq_sql = q.get("sql")
                    if cq_sql:
                        res = active_db.active_connector.execute_query(cq_sql)
                        if res and len(res) > 0:
                            charts.append({
                                "title": q.get("title", "Dashboard Item"),
                                "type": q.get("chart_type", "bar"),
                                "x": q.get("x_axis_key"),
                                "y": q.get("y_axis_key"),
                                "data": res
                            })
                except Exception as e:
                    print(f"Failed to execute dashboard query: {{e}}")
                    
        return {
            "insights": data.get("insights", []),
            "anomalies": data.get("anomalies", []),
            "follow_ups": data.get("follow_up_questions", []),
            "charts": charts
        }
    except Exception as e:
        print(f"Error parsing insight JSON: {{e}}")
        return {
            "insights": [], "anomalies": [], "follow_ups": [], "charts": []
        }
