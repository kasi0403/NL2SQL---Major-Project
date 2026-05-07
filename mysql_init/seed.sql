DROP TABLE IF EXISTS employee_projects;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hire_date DATE DEFAULT (CURRENT_DATE),
    salary DECIMAL(12, 2),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    budget DECIMAL(15, 2),
    start_date DATE
);

CREATE TABLE employee_projects (
    employee_id INT,
    project_id INT,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

INSERT INTO departments (name, location) VALUES 
('Engineering', 'San Francisco'),
('Marketing', 'New York'),
('Sales', 'London'),
('HR', 'San Francisco'),
('Product', 'Seattle');

INSERT INTO employees (first_name, last_name, email, hire_date, salary, department_id) VALUES 
('Alice', 'Johnson', 'alice.j@company.com', '2022-01-15', 120000.00, 1),
('Bob', 'Smith', 'bob.s@company.com', '2021-05-20', 115000.00, 1),
('Charlie', 'Davis', 'charlie.d@company.com', '2023-03-10', 95000.00, 2),
('Diana', 'Prince', 'diana.p@company.com', '2020-11-05', 130000.00, 5),
('Eve', 'White', 'eve.w@company.com', '2022-08-01', 85000.00, 4),
('Frank', 'Miller', 'frank.m@company.com', '2019-02-14', 110000.00, 3);

INSERT INTO projects (name, budget, start_date) VALUES 
('Project Alpha', 500000.00, '2024-01-01'),
('Project Beta', 750000.00, '2023-06-15'),
('Cloud Migration', 1200000.00, '2024-03-01');

INSERT INTO employee_projects (employee_id, project_id) VALUES 
(1, 1), (1, 3),
(2, 1),
(4, 2), (4, 3),
(6, 2);
