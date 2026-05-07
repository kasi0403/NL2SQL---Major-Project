import psycopg2
from datetime import date

def seed_database():
    conn_params = {
        "host": "host.docker.internal",
        "port": 5432,
        "database": "vector_db",
        "user": "postgres",
        "password": "postgres"
    }

    try:
        conn = psycopg2.connect(**conn_params)
        cur = conn.cursor()

        # 1. Create Tables
        print("Creating tables...")
        cur.execute("""
            DROP TABLE IF EXISTS employee_projects CASCADE;
            DROP TABLE IF EXISTS employees CASCADE;
            DROP TABLE IF EXISTS departments CASCADE;
            DROP TABLE IF EXISTS projects CASCADE;

            CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                location VARCHAR(100)
            );

            CREATE TABLE employees (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                hire_date DATE DEFAULT CURRENT_DATE,
                salary DECIMAL(12, 2),
                department_id INTEGER REFERENCES departments(id)
            );

            CREATE TABLE projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                budget DECIMAL(15, 2),
                start_date DATE
            );

            CREATE TABLE employee_projects (
                employee_id INTEGER REFERENCES employees(id),
                project_id INTEGER REFERENCES projects(id),
                PRIMARY KEY (employee_id, project_id)
            );
        """)

        # 2. Insert Departments
        print("Inserting departments...")
        departments = [
            ('Engineering', 'San Francisco'),
            ('Marketing', 'New York'),
            ('Sales', 'London'),
            ('HR', 'San Francisco'),
            ('Product', 'Seattle')
        ]
        cur.executemany("INSERT INTO departments (name, location) VALUES (%s, %s)", departments)

        # 3. Insert Employees
        print("Inserting employees...")
        employees = [
            ('Alice', 'Johnson', 'alice.j@company.com', date(2022, 1, 15), 120000.00, 1),
            ('Bob', 'Smith', 'bob.s@company.com', date(2021, 5, 20), 115000.00, 1),
            ('Charlie', 'Davis', 'charlie.d@company.com', date(2023, 3, 10), 95000.00, 2),
            ('Diana', 'Prince', 'diana.p@company.com', date(2020, 11, 5), 130000.00, 5),
            ('Eve', 'White', 'eve.w@company.com', date(2022, 8, 1), 85000.00, 4),
            ('Frank', 'Miller', 'frank.m@company.com', date(2019, 2, 14), 110000.00, 3)
        ]
        cur.executemany("""
            INSERT INTO employees (first_name, last_name, email, hire_date, salary, department_id)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, employees)

        # 4. Insert Projects
        print("Inserting projects...")
        projects = [
            ('Project Alpha', 500000.00, date(2024, 1, 1)),
            ('Project Beta', 750000.00, date(2023, 6, 15)),
            ('Cloud Migration', 1200000.00, date(2024, 3, 1))
        ]
        cur.executemany("INSERT INTO projects (name, budget, start_date) VALUES (%s, %s, %s)", projects)

        # 5. Link Employees to Projects
        print("Linking employees to projects...")
        mappings = [
            (1, 1), (1, 3), # Alice on Alpha and Cloud
            (2, 1),         # Bob on Alpha
            (4, 2), (4, 3), # Diana on Beta and Cloud
            (6, 2)          # Frank on Beta
        ]
        cur.executemany("INSERT INTO employee_projects (employee_id, project_id) VALUES (%s, %s)", mappings)

        conn.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    seed_database()
