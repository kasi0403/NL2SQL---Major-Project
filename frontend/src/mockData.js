export const mockQueries = [
  "show all departments and their locations",
  "list all employees earning more than $80,000",
  "how many active projects do we have right now?",
  "show the average salary by department",
  "list employees working on the alpha project",
  "which department has the most employees?",
  "who are the top 5 employees by total hours worked?",
  "compare total salary expenses across different locations",
  "identify employees who are working on 2 or more projects simultaneously",
  "show the month-over-month hiring trend over the last year",
  "list all employees in the sales department",
  "show the emails of all employees",
  "how many departments do we have?",
  "list all projects starting this month",
  "who is the manager of the hr department?",
  "show the locations of all offices",
  "list employees hired in 2023",
  "what is the total number of employees?",
  "show projects that ended last year",
  "list all employee names and their hire dates",
  "show the total salary expense for the marketing department",
  "list all projects without an end date",
  "which department has the lowest average salary?",
  "show the number of projects per department",
  "who are the managers with the most direct reports?",
  "list employees who earn less than their department average",
  "how many hours have been logged across all projects?",
  "show the average hours worked per project",
  "list the top 3 longest running projects",
  "which project has the most team members?",
  "show the distribution of employee roles in projects",
  "list employees who have not been assigned to any project",
  "show the total number of hours worked by the engineering team",
  "compare the average salary of employees with and without projects",
  "what is the total budget implication of active projects?",
  "calculate the utilization rate of each employee",
  "identify departments with the highest project turnover rate",
  "show the month-over-month growth in total payroll expense",
  "identify projects that are at risk of missing their deadlines",
  "compare the average tenure of employees across different departments",
  "which manager oversees the highest total salary expense?",
  "show the correlation between salary and hours worked on projects",
  "identify employees whose salaries are in the top 10% but have 0 project hours",
  "calculate the cost per project based on employee salaries and hours",
  "predict the future hiring needs for the next quarter",
  "identify anomalies in hours logged vs project duration",
  "which location is the most cost-effective in terms of salary?",
  "show the historical trend of project completion times",
  "identify potential bottlenecks in multiple projects",
  "calculate the roi of each department based on project completion",
  "rank departments by number of employees",
  "rank employees by their salary",
  "rank projects by their duration",
  "rank departments by average employee salary",
  "rank employees by total hours worked across all projects",
  "rank projects by the number of employees assigned to them",
  "rank locations by total number of active projects",
  "rank managers by the total number of hours logged by their team",
  "rank departments by cost-efficiency",
  "rank employees by their utilization rate",
  "rank the top 3 highest paid employees who have no active projects",
  "rank locations by total salary expense"
];

export const mockConnectionResponse = {
  success: true,
  db_type: "PostgreSQL",
  message: "Successfully connected.",
  schema: {
    "departments": {
      "columns": [
        { "name": "dept_id", "type": "INTEGER", "nullable": false, "is_pk": true },
        { "name": "dept_name", "type": "VARCHAR(100)", "nullable": false, "is_pk": false },
        { "name": "location", "type": "VARCHAR(100)", "nullable": true, "is_pk": false }
      ]
    },
    "projects": {
      "columns": [
        { "name": "project_id", "type": "INTEGER", "nullable": false, "is_pk": true },
        { "name": "project_name", "type": "VARCHAR(100)", "nullable": false, "is_pk": false },
        { "name": "start_date", "type": "DATE", "nullable": true, "is_pk": false },
        { "name": "end_date", "type": "DATE", "nullable": true, "is_pk": false },
        { "name": "dept_id", "type": "INTEGER", "nullable": true, "is_pk": false }
      ],
      "foreign_keys": [
        { "constrained_columns": ["dept_id"], "referred_table": "departments", "referred_columns": ["dept_id"] }
      ]
    },
    "employee_projects": {
      "columns": [
        { "name": "emp_id", "type": "INTEGER", "nullable": false, "is_pk": true },
        { "name": "project_id", "type": "INTEGER", "nullable": false, "is_pk": true },
        { "name": "role", "type": "VARCHAR(50)", "nullable": true, "is_pk": false },
        { "name": "hours_worked", "type": "INTEGER", "nullable": true, "is_pk": false }
      ],
      "foreign_keys": [
        { "constrained_columns": ["emp_id"], "referred_table": "employees", "referred_columns": ["emp_id"] },
        { "constrained_columns": ["project_id"], "referred_table": "projects", "referred_columns": ["project_id"] }
      ]
    },
    "employees": {
      "columns": [
        { "name": "emp_id", "type": "INTEGER", "nullable": false, "is_pk": true },
        { "name": "first_name", "type": "VARCHAR(50)", "nullable": true, "is_pk": false },
        { "name": "last_name", "type": "VARCHAR(50)", "nullable": true, "is_pk": false },
        { "name": "email", "type": "VARCHAR(100)", "nullable": true, "is_pk": false },
        { "name": "salary", "type": "NUMERIC(10, 2)", "nullable": true, "is_pk": false },
        { "name": "hire_date", "type": "DATE", "nullable": true, "is_pk": false },
        { "name": "dept_id", "type": "INTEGER", "nullable": true, "is_pk": false },
        { "name": "manager_id", "type": "INTEGER", "nullable": true, "is_pk": false }
      ],
      "foreign_keys": [
        { "constrained_columns": ["dept_id"], "referred_table": "departments", "referred_columns": ["dept_id"] },
        { "constrained_columns": ["manager_id"], "referred_table": "employees", "referred_columns": ["emp_id"] }
      ]
    }
  }
};


export const mockResponses = {

  "show all departments and their locations": {
    sql: "SELECT dept_name, location FROM departments ORDER BY dept_name;",
    results: [
      { dept_name: "Engineering", location: "San Francisco" },
      { dept_name: "Finance", location: "New York" },
      { dept_name: "Human Resources", location: "Chicago" },
      { dept_name: "Marketing", location: "San Francisco" },
      { dept_name: "Sales", location: "New York" }
    ],
    insights: ["San Francisco and New York both host two departments.", "The company currently operates across 3 major cities."],
    anomalies: [],
    charts: [
      {
        type: "pie", title: "Departments by Location", x: "location", y: "departments",
        data: [{ location: "San Francisco", departments: 2 }, { location: "New York", departments: 2 }, { location: "Chicago", departments: 1 }]
      }
    ],
    follow_ups: ["Which department has the most employees?", "Compare total salary expenses across different locations"]
  },

  "list all employees earning more than $80,000": {
    sql: "SELECT first_name, last_name, salary, dept_name FROM employees e JOIN departments d ON e.dept_id = d.dept_id WHERE salary > 80000 ORDER BY salary DESC;",
    results: [
      { first_name: "Sarah", last_name: "Connor", salary: "$145,000", department: "Engineering" },
      { first_name: "Michael", last_name: "Scott", salary: "$110,000", department: "Sales" },
      { first_name: "David", last_name: "Wallace", salary: "$105,000", department: "Finance" },
      { first_name: "Pam", last_name: "Beesly", salary: "$85,000", department: "Marketing" },
      { first_name: "Jim", last_name: "Halpert", salary: "$82,000", department: "Sales" }
    ],
    insights: ["35% of the total workforce earns above $80,000.", "The majority of high earners are concentrated in Engineering and Sales."],
    anomalies: [],
    charts: [
      {
        type: "bar", title: "Top Earners Salaries", x: "name", y: "salary",
        data: [
          { name: "Sarah", salary: 145000 },
          { name: "Michael", salary: 110000 },
          { name: "David", salary: 105000 },
          { name: "Pam", salary: 85000 },
          { name: "Jim", salary: 82000 }
        ]
      }
    ],
    follow_ups: ["Show the average salary by department", "Compare total salary expenses across different locations"]
  },

  "how many active projects do we have right now?": {
    sql: "SELECT COUNT(project_id) as active_projects FROM projects WHERE end_date IS NULL OR end_date >= CURRENT_DATE;",
    results: [{ active_projects: 14 }],
    insights: ["There are 3 more active projects compared to last quarter.", "Engineering handles 60% of the current active projects."],
    anomalies: [],
    charts: [
      {
        type: "pie", title: "Active Projects by Dept", x: "department", y: "projects",
        data: [
          { department: "Engineering", projects: 8 },
          { department: "Sales", projects: 3 },
          { department: "Marketing", projects: 2 },
          { department: "Finance", projects: 1 }
        ]
      }
    ],
    follow_ups: ["List employees working on the Alpha project", "Identify employees who are working on 2 or more projects simultaneously"]
  },

  "show the average salary by department": {
    sql: "SELECT d.dept_name, ROUND(AVG(e.salary), 2) as avg_salary FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.dept_name ORDER BY avg_salary DESC;",
    results: [
      { department: "Engineering", avg_salary: "$115,200.00" },
      { department: "Finance", avg_salary: "$95,450.00" },
      { department: "Sales", avg_salary: "$88,000.00" },
      { department: "Marketing", avg_salary: "$78,500.00" },
      { department: "Human Resources", avg_salary: "$72,100.00" }
    ],
    insights: ["Engineering has the highest average salary, 20% higher than Finance.", "HR has the lowest average salary across the company."],
    anomalies: ["The salary gap between Engineering and HR is wider than industry standard (45% vs 30%)."],
    charts: [
      {
        type: "bar", title: "Average Salary by Department", x: "department", y: "avg_salary",
        data: [
          { department: "Eng", avg_salary: 115200 },
          { department: "Finance", avg_salary: 95450 },
          { department: "Sales", avg_salary: 88000 },
          { department: "Marketing", avg_salary: 78500 },
          { department: "HR", avg_salary: 72100 }
        ]
      }
    ],
    follow_ups: ["Which department has the most employees?", "List all employees earning more than $80,000"]
  },

  "list employees working on the alpha project": {
    sql: "SELECT e.first_name, e.last_name, ep.role, ep.hours_worked FROM employees e JOIN employee_projects ep ON e.emp_id = ep.emp_id JOIN projects p ON ep.project_id = p.project_id WHERE p.project_name = 'Alpha Project';",
    results: [
      { name: "Alice Smith", role: "Project Manager", hours_worked: 120 },
      { name: "Bob Johnson", role: "Backend Developer", hours_worked: 155 },
      { name: "Charlie Davis", role: "Frontend Developer", hours_worked: 140 },
      { name: "Diana Prince", role: "QA Engineer", hours_worked: 85 }
    ],
    insights: ["Bob Johnson has logged the most hours on the Alpha Project.", "The team has logged a combined 500 hours this month."],
    anomalies: ["QA hours are disproportionately low compared to Development hours logged."],
    charts: [
      {
        type: "bar", title: "Hours Logged - Alpha Project", x: "name", y: "hours",
        data: [
          { name: "Alice", hours: 120 },
          { name: "Bob", hours: 155 },
          { name: "Charlie", hours: 140 },
          { name: "Diana", hours: 85 }
        ]
      }
    ],
    follow_ups: ["Who are the top 5 employees by total hours worked?", "How many active projects do we have right now?"]
  },

  "which department has the most employees?": {
    sql: "SELECT d.dept_name, COUNT(e.emp_id) as employee_count FROM departments d JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_name ORDER BY employee_count DESC LIMIT 1;",
    results: [{ department: "Engineering", employee_count: 45 }],
    insights: ["Engineering represents 42% of the entire company workforce.", "Sales is the second largest with 28 employees."],
    anomalies: [],
    charts: [
      {
        type: "bar", title: "Top 3 Departments by Size", x: "department", y: "employees",
        data: [{ department: "Engineering", employees: 45 }, { department: "Sales", employees: 28 }, { department: "Customer Support", employees: 15 }]
      }
    ],
    follow_ups: ["Show the average salary by department", "Compare total salary expenses across different locations"]
  },

  "who are the top 5 employees by total hours worked?": {
    sql: "SELECT e.first_name, e.last_name, SUM(ep.hours_worked) as total_hours FROM employees e JOIN employee_projects ep ON e.emp_id = ep.emp_id GROUP BY e.emp_id ORDER BY total_hours DESC LIMIT 5;",
    results: [
      { name: "Bob Johnson", total_hours: 310 },
      { name: "Alice Smith", total_hours: 285 },
      { name: "Eve Polastri", total_hours: 270 },
      { name: "Frank Castle", total_hours: 260 },
      { name: "Charlie Davis", total_hours: 245 }
    ],
    insights: ["Bob Johnson is highly utilized, contributing to 3 separate projects.", "The top 5 employees account for 18% of all project hours logged this quarter."],
    anomalies: ["Bob Johnson's logged hours exceed standard full-time capacity, indicating potential burnout or overtime issues."],
    charts: [
      {
        type: "bar", title: "Top 5 Employees (Hours)", x: "name", y: "hours",
        data: [{ name: "Bob", hours: 310 }, { name: "Alice", hours: 285 }, { name: "Eve", hours: 270 }, { name: "Frank", hours: 260 }, { name: "Charlie", hours: 245 }]
      }
    ],
    follow_ups: ["Identify employees who are working on 2 or more projects simultaneously", "List employees working on the Alpha project"]
  },

  "compare total salary expenses across different locations": {
    sql: "SELECT d.location, SUM(e.salary) as total_expense FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.location ORDER BY total_expense DESC;",
    results: [
      { location: "San Francisco", total_expense: "$4,250,000" },
      { location: "New York", total_expense: "$3,100,000" },
      { location: "Chicago", total_expense: "$1,450,000" }
    ],
    insights: ["San Francisco has the highest payroll expense, driven by the large Engineering team.", "Despite having two departments, New York's payroll is 27% lower than San Francisco."],
    anomalies: [],
    charts: [
      {
        type: "pie", title: "Salary Expenses by Location", x: "location", y: "expense",
        data: [{ location: "San Francisco", expense: 4250000 }, { location: "New York", expense: 3100000 }, { location: "Chicago", expense: 1450000 }]
      }
    ],
    follow_ups: ["Show all departments and their locations", "Show the average salary by department"]
  },

  "identify employees who are working on 2 or more projects simultaneously": {
    sql: "SELECT e.first_name, e.last_name, COUNT(ep.project_id) as project_count FROM employees e JOIN employee_projects ep ON e.emp_id = ep.emp_id GROUP BY e.emp_id HAVING COUNT(ep.project_id) >= 2 ORDER BY project_count DESC;",
    results: [
      { name: "Bob Johnson", project_count: 3 },
      { name: "Eve Polastri", project_count: 3 },
      { name: "Alice Smith", project_count: 2 },
      { name: "David Wallace", project_count: 2 },
      { name: "Diana Prince", project_count: 2 }
    ],
    insights: ["12 employees are currently assigned to multiple projects.", "Senior staff and leads are more likely to be split across multiple initiatives."],
    anomalies: ["Eve Polastri is assigned to 3 projects but has only logged 150 hours total, suggesting misallocation or inactive projects."],
    charts: [
      {
        type: "bar", title: "Employees on Multiple Projects", x: "name", y: "projects",
        data: [
          { name: "Bob", projects: 3 },
          { name: "Eve", projects: 3 },
          { name: "Alice", projects: 2 },
          { name: "David", projects: 2 },
          { name: "Diana", projects: 2 }
        ]
      }
    ],
    follow_ups: ["Who are the top 5 employees by total hours worked?", "How many active projects do we have right now?"]
  },

  "show the month-over-month hiring trend over the last year": {
    sql: "SELECT TO_CHAR(hire_date, 'YYYY-MM') as month, COUNT(emp_id) as new_hires FROM employees WHERE hire_date >= CURRENT_DATE - INTERVAL '1 year' GROUP BY month ORDER BY month;",
    results: [
      { month: "2023-04", new_hires: 2 },
      { month: "2023-05", new_hires: 5 },
      { month: "2023-06", new_hires: 8 },
      { month: "2023-07", new_hires: 3 },
      { month: "2023-08", new_hires: 4 },
      { month: "2023-09", new_hires: 10 },
      { month: "2023-10", new_hires: 7 },
      { month: "2023-11", new_hires: 2 },
      { month: "2023-12", new_hires: 1 },
      { month: "2024-01", new_hires: 6 },
      { month: "2024-02", new_hires: 4 },
      { month: "2024-03", new_hires: 5 }
    ],
    insights: ["Hiring peaked in September 2023 with 10 new employees.", "Q4 saw a significant slowdown in hiring, standard for end-of-year budgets."],
    anomalies: ["A sudden spike in June 2023 correlates with the launch of the Alpha Project."],
    charts: [
      {
        type: "line", title: "MoM Hiring Trend", x: "month", y: "hires",
        data: [
          { month: "Apr", hires: 2 }, { month: "May", hires: 5 }, { month: "Jun", hires: 8 },
          { month: "Jul", hires: 3 }, { month: "Aug", hires: 4 }, { month: "Sep", hires: 10 },
          { month: "Oct", hires: 7 }, { month: "Nov", hires: 2 }, { month: "Dec", hires: 1 },
          { month: "Jan", hires: 6 }, { month: "Feb", hires: 4 }, { month: "Mar", hires: 5 }
        ]
      }
    ],
    follow_ups: ["Which department has the most employees?", "Compare total salary expenses across different locations"]
  }
,
  "list all employees in the sales department": {
    sql: "SELECT * FROM mock_table WHERE query = 'list all employees in the sales department';",
    results: [
      { id: 733, metric: "Sample Data", value: 502 },
      { id: 461, metric: "Sample Data", value: 108 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 22% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 10 }, { category: "B", amount: 89 }, { category: "C", amount: 37 }]
      }
    ],
    follow_ups: ["which department has the most employees?", "list employees who earn less than their department average"]
  },

  "show the emails of all employees": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the emails of all employees';",
    results: [
      { id: 931, metric: "Sample Data", value: 222 },
      { id: 378, metric: "Sample Data", value: 464 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 9% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 46 }, { category: "B", amount: 85 }, { category: "C", amount: 16 }]
      }
    ],
    follow_ups: ["identify projects that are at risk of missing their deadlines", "show projects that ended last year"]
  },

  "how many departments do we have?": {
    sql: "SELECT * FROM mock_table WHERE query = 'how many departments do we have?';",
    results: [
      { id: 767, metric: "Sample Data", value: 80 },
      { id: 486, metric: "Sample Data", value: 523 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 5% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 87 }, { category: "B", amount: 55 }, { category: "C", amount: 74 }]
      }
    ],
    follow_ups: ["rank locations by total number of active projects", "list all projects without an end date"]
  },

  "list all projects starting this month": {
    sql: "SELECT * FROM mock_table WHERE query = 'list all projects starting this month';",
    results: [
      { id: 703, metric: "Sample Data", value: 265 },
      { id: 662, metric: "Sample Data", value: 623 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 25% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 88 }, { category: "B", amount: 11 }, { category: "C", amount: 18 }]
      }
    ],
    follow_ups: ["rank employees by total hours worked across all projects", "identify employees who are working on 2 or more projects simultaneously"]
  },

  "who is the manager of the hr department?": {
    sql: "SELECT * FROM mock_table WHERE query = 'who is the manager of the hr department?';",
    results: [
      { id: 642, metric: "Sample Data", value: 312 },
      { id: 773, metric: "Sample Data", value: 769 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 7% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 28 }, { category: "B", amount: 34 }, { category: "C", amount: 98 }]
      }
    ],
    follow_ups: ["show the historical trend of project completion times", "rank employees by their utilization rate"]
  },

  "show the locations of all offices": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the locations of all offices';",
    results: [
      { id: 936, metric: "Sample Data", value: 306 },
      { id: 585, metric: "Sample Data", value: 198 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 29% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 87 }, { category: "B", amount: 75 }, { category: "C", amount: 52 }]
      }
    ],
    follow_ups: ["show the month-over-month hiring trend over the last year", "identify employees whose salaries are in the top 10% but have 0 project hours"]
  },

  "list employees hired in 2023": {
    sql: "SELECT * FROM mock_table WHERE query = 'list employees hired in 2023';",
    results: [
      { id: 389, metric: "Sample Data", value: 921 },
      { id: 715, metric: "Sample Data", value: 645 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 29% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 55 }, { category: "B", amount: 50 }, { category: "C", amount: 79 }]
      }
    ],
    follow_ups: ["identify projects that are at risk of missing their deadlines", "list employees who earn less than their department average"]
  },

  "what is the total number of employees?": {
    sql: "SELECT * FROM mock_table WHERE query = 'what is the total number of employees?';",
    results: [
      { id: 116, metric: "Sample Data", value: 986 },
      { id: 981, metric: "Sample Data", value: 305 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 23% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 31 }, { category: "B", amount: 87 }, { category: "C", amount: 95 }]
      }
    ],
    follow_ups: ["which location is the most cost-effective in terms of salary?", "show the correlation between salary and hours worked on projects"]
  },

  "show projects that ended last year": {
    sql: "SELECT * FROM mock_table WHERE query = 'show projects that ended last year';",
    results: [
      { id: 395, metric: "Sample Data", value: 387 },
      { id: 242, metric: "Sample Data", value: 651 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 23% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 38 }, { category: "B", amount: 33 }, { category: "C", amount: 88 }]
      }
    ],
    follow_ups: ["how many active projects do we have right now?", "compare the average tenure of employees across different departments"]
  },

  "list all employee names and their hire dates": {
    sql: "SELECT * FROM mock_table WHERE query = 'list all employee names and their hire dates';",
    results: [
      { id: 562, metric: "Sample Data", value: 67 },
      { id: 538, metric: "Sample Data", value: 323 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 8% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 95 }, { category: "B", amount: 89 }, { category: "C", amount: 74 }]
      }
    ],
    follow_ups: ["show the average hours worked per project", "show the total number of hours worked by the engineering team"]
  },

  "show the total salary expense for the marketing department": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the total salary expense for the marketing department';",
    results: [
      { id: 770, metric: "Sample Data", value: 337 },
      { id: 177, metric: "Sample Data", value: 568 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 12% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 39 }, { category: "B", amount: 32 }, { category: "C", amount: 45 }]
      }
    ],
    follow_ups: ["identify employees who are working on 2 or more projects simultaneously", "rank employees by their utilization rate"]
  },

  "list all projects without an end date": {
    sql: "SELECT * FROM mock_table WHERE query = 'list all projects without an end date';",
    results: [
      { id: 301, metric: "Sample Data", value: 122 },
      { id: 250, metric: "Sample Data", value: 721 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 18% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 15 }, { category: "B", amount: 41 }, { category: "C", amount: 16 }]
      }
    ],
    follow_ups: ["identify anomalies in hours logged vs project duration", "identify employees whose salaries are in the top 10% but have 0 project hours"]
  },

  "which department has the lowest average salary?": {
    sql: "SELECT * FROM mock_table WHERE query = 'which department has the lowest average salary?';",
    results: [
      { id: 261, metric: "Sample Data", value: 923 },
      { id: 379, metric: "Sample Data", value: 983 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 8% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 38 }, { category: "B", amount: 79 }, { category: "C", amount: 73 }]
      }
    ],
    follow_ups: ["show projects that ended last year", "rank managers by the total number of hours logged by their team"]
  },

  "show the number of projects per department": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the number of projects per department';",
    results: [
      { id: 849, metric: "Sample Data", value: 875 },
      { id: 982, metric: "Sample Data", value: 692 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 10% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 95 }, { category: "B", amount: 81 }, { category: "C", amount: 31 }]
      }
    ],
    follow_ups: ["show the historical trend of project completion times", "which department has the most employees?"]
  },

  "who are the managers with the most direct reports?": {
    sql: "SELECT * FROM mock_table WHERE query = 'who are the managers with the most direct reports?';",
    results: [
      { id: 473, metric: "Sample Data", value: 880 },
      { id: 842, metric: "Sample Data", value: 423 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 6% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 90 }, { category: "B", amount: 69 }, { category: "C", amount: 62 }]
      }
    ],
    follow_ups: ["who are the top 5 employees by total hours worked?", "show the month-over-month growth in total payroll expense"]
  },

  "list employees who earn less than their department average": {
    sql: "SELECT * FROM mock_table WHERE query = 'list employees who earn less than their department average';",
    results: [
      { id: 188, metric: "Sample Data", value: 134 },
      { id: 220, metric: "Sample Data", value: 565 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 11% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 31 }, { category: "B", amount: 94 }, { category: "C", amount: 32 }]
      }
    ],
    follow_ups: ["identify departments with the highest project turnover rate", "show the emails of all employees"]
  },

  "how many hours have been logged across all projects?": {
    sql: "SELECT * FROM mock_table WHERE query = 'how many hours have been logged across all projects?';",
    results: [
      { id: 352, metric: "Sample Data", value: 881 },
      { id: 681, metric: "Sample Data", value: 23 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 21% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 27 }, { category: "B", amount: 52 }, { category: "C", amount: 30 }]
      }
    ],
    follow_ups: ["rank employees by total hours worked across all projects", "rank the top 3 highest paid employees who have no active projects"]
  },

  "show the average hours worked per project": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the average hours worked per project';",
    results: [
      { id: 690, metric: "Sample Data", value: 759 },
      { id: 391, metric: "Sample Data", value: 634 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 22% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 54 }, { category: "B", amount: 62 }, { category: "C", amount: 93 }]
      }
    ],
    follow_ups: ["list employees hired in 2023", "calculate the cost per project based on employee salaries and hours"]
  },

  "list the top 3 longest running projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'list the top 3 longest running projects';",
    results: [
      { id: 191, metric: "Sample Data", value: 725 },
      { id: 584, metric: "Sample Data", value: 663 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 24% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 49 }, { category: "B", amount: 79 }, { category: "C", amount: 49 }]
      }
    ],
    follow_ups: ["show the correlation between salary and hours worked on projects", "rank projects by their duration"]
  },

  "which project has the most team members?": {
    sql: "SELECT * FROM mock_table WHERE query = 'which project has the most team members?';",
    results: [
      { id: 610, metric: "Sample Data", value: 952 },
      { id: 444, metric: "Sample Data", value: 536 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 11% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 49 }, { category: "B", amount: 42 }, { category: "C", amount: 72 }]
      }
    ],
    follow_ups: ["which location is the most cost-effective in terms of salary?", "show the locations of all offices"]
  },

  "show the distribution of employee roles in projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the distribution of employee roles in projects';",
    results: [
      { id: 412, metric: "Sample Data", value: 839 },
      { id: 573, metric: "Sample Data", value: 765 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 21% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 78 }, { category: "B", amount: 88 }, { category: "C", amount: 71 }]
      }
    ],
    follow_ups: ["rank departments by average employee salary", "rank employees by their salary"]
  },

  "list employees who have not been assigned to any project": {
    sql: "SELECT * FROM mock_table WHERE query = 'list employees who have not been assigned to any project';",
    results: [
      { id: 918, metric: "Sample Data", value: 241 },
      { id: 569, metric: "Sample Data", value: 993 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 30% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 98 }, { category: "B", amount: 80 }, { category: "C", amount: 73 }]
      }
    ],
    follow_ups: ["show the locations of all offices", "rank projects by their duration"]
  },

  "show the total number of hours worked by the engineering team": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the total number of hours worked by the engineering team';",
    results: [
      { id: 343, metric: "Sample Data", value: 52 },
      { id: 138, metric: "Sample Data", value: 1000 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 14% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 30 }, { category: "B", amount: 41 }, { category: "C", amount: 33 }]
      }
    ],
    follow_ups: ["identify projects that are at risk of missing their deadlines", "what is the total number of employees?"]
  },

  "compare the average salary of employees with and without projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'compare the average salary of employees with and without projects';",
    results: [
      { id: 366, metric: "Sample Data", value: 900 },
      { id: 227, metric: "Sample Data", value: 484 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 14% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 31 }, { category: "B", amount: 69 }, { category: "C", amount: 46 }]
      }
    ],
    follow_ups: ["compare total salary expenses across different locations", "rank projects by their duration"]
  },

  "what is the total budget implication of active projects?": {
    sql: "SELECT * FROM mock_table WHERE query = 'what is the total budget implication of active projects?';",
    results: [
      { id: 905, metric: "Sample Data", value: 656 },
      { id: 978, metric: "Sample Data", value: 928 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 11% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 79 }, { category: "B", amount: 91 }, { category: "C", amount: 77 }]
      }
    ],
    follow_ups: ["which manager oversees the highest total salary expense?", "who are the managers with the most direct reports?"]
  },

  "calculate the utilization rate of each employee": {
    sql: "SELECT * FROM mock_table WHERE query = 'calculate the utilization rate of each employee';",
    results: [
      { id: 205, metric: "Sample Data", value: 997 },
      { id: 255, metric: "Sample Data", value: 761 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 8% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 26 }, { category: "B", amount: 27 }, { category: "C", amount: 12 }]
      }
    ],
    follow_ups: ["list the top 3 longest running projects", "show the average hours worked per project"]
  },

  "identify departments with the highest project turnover rate": {
    sql: "SELECT * FROM mock_table WHERE query = 'identify departments with the highest project turnover rate';",
    results: [
      { id: 254, metric: "Sample Data", value: 260 },
      { id: 395, metric: "Sample Data", value: 651 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 6% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 100 }, { category: "B", amount: 61 }, { category: "C", amount: 71 }]
      }
    ],
    follow_ups: ["what is the total number of employees?", "identify employees whose salaries are in the top 10% but have 0 project hours"]
  },

  "show the month-over-month growth in total payroll expense": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the month-over-month growth in total payroll expense';",
    results: [
      { id: 500, metric: "Sample Data", value: 452 },
      { id: 205, metric: "Sample Data", value: 334 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 7% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 96 }, { category: "B", amount: 61 }, { category: "C", amount: 32 }]
      }
    ],
    follow_ups: ["rank employees by their salary", "show the month-over-month growth in total payroll expense"]
  },

  "identify projects that are at risk of missing their deadlines": {
    sql: "SELECT * FROM mock_table WHERE query = 'identify projects that are at risk of missing their deadlines';",
    results: [
      { id: 283, metric: "Sample Data", value: 891 },
      { id: 403, metric: "Sample Data", value: 723 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 11% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 38 }, { category: "B", amount: 51 }, { category: "C", amount: 72 }]
      }
    ],
    follow_ups: ["which manager oversees the highest total salary expense?", "rank the top 3 highest paid employees who have no active projects"]
  },

  "compare the average tenure of employees across different departments": {
    sql: "SELECT * FROM mock_table WHERE query = 'compare the average tenure of employees across different departments';",
    results: [
      { id: 221, metric: "Sample Data", value: 127 },
      { id: 532, metric: "Sample Data", value: 970 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 30% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 47 }, { category: "B", amount: 60 }, { category: "C", amount: 91 }]
      }
    ],
    follow_ups: ["show the average salary by department", "list all projects starting this month"]
  },

  "which manager oversees the highest total salary expense?": {
    sql: "SELECT * FROM mock_table WHERE query = 'which manager oversees the highest total salary expense?';",
    results: [
      { id: 337, metric: "Sample Data", value: 569 },
      { id: 264, metric: "Sample Data", value: 969 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 22% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 69 }, { category: "B", amount: 41 }, { category: "C", amount: 81 }]
      }
    ],
    follow_ups: ["identify employees who are working on 2 or more projects simultaneously", "identify employees whose salaries are in the top 10% but have 0 project hours"]
  },

  "show the correlation between salary and hours worked on projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the correlation between salary and hours worked on projects';",
    results: [
      { id: 560, metric: "Sample Data", value: 736 },
      { id: 973, metric: "Sample Data", value: 741 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 13% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 40 }, { category: "B", amount: 75 }, { category: "C", amount: 17 }]
      }
    ],
    follow_ups: ["show the month-over-month growth in total payroll expense", "show the historical trend of project completion times"]
  },

  "identify employees whose salaries are in the top 10% but have 0 project hours": {
    sql: "SELECT * FROM mock_table WHERE query = 'identify employees whose salaries are in the top 10% but have 0 project hours';",
    results: [
      { id: 289, metric: "Sample Data", value: 571 },
      { id: 612, metric: "Sample Data", value: 712 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 24% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 63 }, { category: "B", amount: 76 }, { category: "C", amount: 69 }]
      }
    ],
    follow_ups: ["calculate the utilization rate of each employee", "list employees hired in 2023"]
  },

  "calculate the cost per project based on employee salaries and hours": {
    sql: "SELECT * FROM mock_table WHERE query = 'calculate the cost per project based on employee salaries and hours';",
    results: [
      { id: 151, metric: "Sample Data", value: 201 },
      { id: 668, metric: "Sample Data", value: 403 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 23% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 85 }, { category: "B", amount: 58 }, { category: "C", amount: 64 }]
      }
    ],
    follow_ups: ["identify potential bottlenecks in multiple projects", "show the locations of all offices"]
  },

  "predict the future hiring needs for the next quarter": {
    sql: "SELECT * FROM mock_table WHERE query = 'predict the future hiring needs for the next quarter';",
    results: [
      { id: 612, metric: "Sample Data", value: 903 },
      { id: 132, metric: "Sample Data", value: 540 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 12% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 75 }, { category: "B", amount: 23 }, { category: "C", amount: 91 }]
      }
    ],
    follow_ups: ["compare the average salary of employees with and without projects", "calculate the utilization rate of each employee"]
  },

  "identify anomalies in hours logged vs project duration": {
    sql: "SELECT * FROM mock_table WHERE query = 'identify anomalies in hours logged vs project duration';",
    results: [
      { id: 491, metric: "Sample Data", value: 471 },
      { id: 166, metric: "Sample Data", value: 662 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 26% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 33 }, { category: "B", amount: 76 }, { category: "C", amount: 92 }]
      }
    ],
    follow_ups: ["which department has the lowest average salary?", "rank employees by their salary"]
  },

  "which location is the most cost-effective in terms of salary?": {
    sql: "SELECT * FROM mock_table WHERE query = 'which location is the most cost-effective in terms of salary?';",
    results: [
      { id: 412, metric: "Sample Data", value: 510 },
      { id: 314, metric: "Sample Data", value: 565 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 11% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 33 }, { category: "B", amount: 14 }, { category: "C", amount: 94 }]
      }
    ],
    follow_ups: ["which department has the most employees?", "how many active projects do we have right now?"]
  },

  "show the historical trend of project completion times": {
    sql: "SELECT * FROM mock_table WHERE query = 'show the historical trend of project completion times';",
    results: [
      { id: 819, metric: "Sample Data", value: 563 },
      { id: 487, metric: "Sample Data", value: 534 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 5% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "pie", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 90 }, { category: "B", amount: 66 }, { category: "C", amount: 86 }]
      }
    ],
    follow_ups: ["list all projects without an end date", "who are the top 5 employees by total hours worked?"]
  },

  "identify potential bottlenecks in multiple projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'identify potential bottlenecks in multiple projects';",
    results: [
      { id: 790, metric: "Sample Data", value: 642 },
      { id: 545, metric: "Sample Data", value: 516 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 24% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "line", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 52 }, { category: "B", amount: 98 }, { category: "C", amount: 36 }]
      }
    ],
    follow_ups: ["rank managers by the total number of hours logged by their team", "show the historical trend of project completion times"]
  },

  "calculate the roi of each department based on project completion": {
    sql: "SELECT * FROM mock_table WHERE query = 'calculate the roi of each department based on project completion';",
    results: [
      { id: 214, metric: "Sample Data", value: 388 },
      { id: 239, metric: "Sample Data", value: 557 }
    ],
    insights: ["Generated insight 1 for this data.", "Insight 2 indicating a 13% increase."],
    anomalies: ["Detected minor anomaly in standard deviation."],
    charts: [
      {
        type: "bar", title: "Analysis Chart", x: "category", y: "amount",
        data: [{ category: "A", amount: 87 }, { category: "B", amount: 38 }, { category: "C", amount: 34 }]
      }
    ],
    follow_ups: ["calculate the roi of each department based on project completion", "identify employees whose salaries are in the top 10% but have 0 project hours"]
  },

  "rank departments by number of employees": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank departments by number of employees' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 757 },
      { rank: 2, entity: "Entity B", value: 700 },
      { rank: 3, entity: "Entity C", value: 417 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period.", "Entity C unexpectedly dropped in value."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 757 }, { entity: "B", value: 700 }, { entity: "C", value: 417 }]
      }
    ],
    follow_ups: ["identify employees whose salaries are in the top 10% but have 0 project hours", "who are the managers with the most direct reports?"]
  },

  "rank employees by their salary": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank employees by their salary' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 454 },
      { rank: 2, entity: "Entity B", value: 436 },
      { rank: 3, entity: "Entity C", value: 420 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "bar", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 454 }, { entity: "B", value: 436 }, { entity: "C", value: 420 }]
      }
    ],
    follow_ups: ["calculate the utilization rate of each employee", "who are the managers with the most direct reports?"]
  },

  "rank projects by their duration": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank projects by their duration' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 517 },
      { rank: 2, entity: "Entity B", value: 111 },
      { rank: 3, entity: "Entity C", value: 59 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 517 }, { entity: "B", value: 111 }, { entity: "C", value: 59 }]
      }
    ],
    follow_ups: ["rank the top 3 highest paid employees who have no active projects", "rank departments by number of employees"]
  },

  "rank departments by average employee salary": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank departments by average employee salary' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 915 },
      { rank: 2, entity: "Entity B", value: 855 },
      { rank: 3, entity: "Entity C", value: 710 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period.", "Entity C unexpectedly dropped in value."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 915 }, { entity: "B", value: 855 }, { entity: "C", value: 710 }]
      }
    ],
    follow_ups: ["which location is the most cost-effective in terms of salary?", "which project has the most team members?"]
  },

  "rank employees by total hours worked across all projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank employees by total hours worked across all projects' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 638 },
      { rank: 2, entity: "Entity B", value: 541 },
      { rank: 3, entity: "Entity C", value: 498 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "bar", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 638 }, { entity: "B", value: 541 }, { entity: "C", value: 498 }]
      }
    ],
    follow_ups: ["rank departments by number of employees", "list employees who earn less than their department average"]
  },

  "rank projects by the number of employees assigned to them": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank projects by the number of employees assigned to them' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 842 },
      { rank: 2, entity: "Entity B", value: 359 },
      { rank: 3, entity: "Entity C", value: 267 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period.", "Entity C unexpectedly dropped in value."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 842 }, { entity: "B", value: 359 }, { entity: "C", value: 267 }]
      }
    ],
    follow_ups: ["calculate the utilization rate of each employee", "show the average hours worked per project"]
  },

  "rank locations by total number of active projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank locations by total number of active projects' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 467 },
      { rank: 2, entity: "Entity B", value: 349 },
      { rank: 3, entity: "Entity C", value: 139 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 467 }, { entity: "B", value: 349 }, { entity: "C", value: 139 }]
      }
    ],
    follow_ups: ["list all projects without an end date", "how many hours have been logged across all projects?"]
  },

  "rank managers by the total number of hours logged by their team": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank managers by the total number of hours logged by their team' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 901 },
      { rank: 2, entity: "Entity B", value: 791 },
      { rank: 3, entity: "Entity C", value: 150 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 901 }, { entity: "B", value: 791 }, { entity: "C", value: 150 }]
      }
    ],
    follow_ups: ["rank projects by their duration", "rank departments by average employee salary"]
  },

  "rank departments by cost-efficiency": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank departments by cost-efficiency' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 529 },
      { rank: 2, entity: "Entity B", value: 491 },
      { rank: 3, entity: "Entity C", value: 327 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "bar", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 529 }, { entity: "B", value: 491 }, { entity: "C", value: 327 }]
      }
    ],
    follow_ups: ["which manager oversees the highest total salary expense?", "show the month-over-month hiring trend over the last year"]
  },

  "rank employees by their utilization rate": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank employees by their utilization rate' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 973 },
      { rank: 2, entity: "Entity B", value: 544 },
      { rank: 3, entity: "Entity C", value: 416 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal.", "Entity A has consistently held the top spot."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "bar", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 973 }, { entity: "B", value: 544 }, { entity: "C", value: 416 }]
      }
    ],
    follow_ups: ["show the month-over-month hiring trend over the last year", "rank projects by their duration"]
  },

  "rank the top 3 highest paid employees who have no active projects": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank the top 3 highest paid employees who have no active projects' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 968 },
      { rank: 2, entity: "Entity B", value: 505 },
      { rank: 3, entity: "Entity C", value: 436 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period."],
    charts: [
      {
        type: "pie", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 968 }, { entity: "B", value: 505 }, { entity: "C", value: 436 }]
      }
    ],
    follow_ups: ["which location is the most cost-effective in terms of salary?", "how many active projects do we have right now?"]
  },

  "rank locations by total salary expense": {
    sql: "SELECT * FROM mock_table WHERE query = 'rank locations by total salary expense' ORDER BY rank_column DESC;",
    results: [
      { rank: 1, entity: "Entity A", value: 919 },
      { rank: 2, entity: "Entity B", value: 627 },
      { rank: 3, entity: "Entity C", value: 372 }
    ],
    insights: ["Entity A leads the ranking by a significant margin.", "The difference between rank 2 and 3 is minimal."],
    anomalies: ["A sudden shift in rankings occurred in the last reporting period.", "Entity C unexpectedly dropped in value."],
    charts: [
      {
        type: "bar", title: "Ranking Analysis", x: "entity", y: "value",
        data: [{ entity: "A", value: 919 }, { entity: "B", value: 627 }, { entity: "C", value: 372 }]
      }
    ],
    follow_ups: ["rank departments by average employee salary", "how many departments do we have?"]
  }
};
