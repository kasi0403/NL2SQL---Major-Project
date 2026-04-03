from crewai import Task, Crew
from agents.insights_agent import insights_agent
import json

def generate_insights(user_query, sql_query, results):
    if not results or len(results) == 0:
        return {}
        
    # Take a sample if too big
    sample_results = results[:20]

    description = f"""
You are a highly skilled Data Analyst and Visualization Expert.

User Request: {user_query}
SQL Executed: {sql_query}
Data Sample (first {len(sample_results)} rows): {sample_results}

Your job is to analyze this data and generate a JSON responding to the user's request.
We need:
1. "charts": An array of suggested charts. Based on the user's request:
   - For simple queries (e.g. employee count by dept) or comparisons (e.g. compare salaries), suggest 1 chart (bar).
   - For trends/over time queries, suggest a line chart.
   - For organizational charts, reporting structures, or hierarchical data, suggest a tree chart.
   - For "dashboard mode" or general analysis queries ("Give me sales analysis"), suggest multiple charts (e.g., 2-4 charts: Bar, Line, Pie).
   - If the data is simply a single scalar (e.g. total count without grouping), return an empty charts array.
   - A chart must have: "type" (bar, line, pie, tree), "title", "x_axis" (a column name from the data), "y_axis" (a column name). 
   - Note: If type is "tree", instead of x_axis and y_axis, provide: "id_col" (unique ID column), "parent_col" (manager/parent ID column), and "label_col" (display name column).
2. "insights": An array of strings with smart summaries, trend analysis, and anomaly detection. 
   - Note if there's a trend, growth rate, highest/lowest value, averages, or anomalies. Make it sound like an expert AI analyst.
3. "follow_up_questions": 2 or 3 follow-up questions the user might ask next.

Return ONLY a valid JSON object string (no markdown formatting, no backticks, just the parsable JSON).
Example Format:
{{
  "charts": [
    {{"type": "bar", "title": "Sales by Region", "x_axis": "region", "y_axis": "total_sales"}}
  ],
  "insights": [
    "Sales increased by 18% in Q4.",
    "Unusual spike of sales in March."
  ],
  "follow_up_questions": [
    "Do you want region-wise analysis?",
    "Show me the top 5 performing products?"
  ]
}}
"""

    task = Task(
        description=description,
        expected_output="A JSON object containing charts, insights, and follow-up questions.",
        agent=insights_agent
    )

    crew = Crew(
        agents=[insights_agent],
        tasks=[task],
        verbose=True
    )

    try:
        result = crew.kickoff()
        result_text = str(result)
        
        # clean JSON
        result_text = result_text.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        
        return json.loads(result_text)
    except Exception as e:
        print("Failed to generate/parse insights:", e)
        return {}
