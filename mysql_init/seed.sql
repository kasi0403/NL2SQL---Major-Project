-- ============================================================
--  Company Database – MySQL Init Script
--  Schema: public (mapped to MySQL database "company")
--  Tables: departments, employees, projects, employee_projects
-- ============================================================

-- Drop tables in reverse dependency order to avoid FK conflicts
DROP TABLE IF EXISTS employee_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

-- ============================================================
-- 1. departments
-- ============================================================
CREATE TABLE departments (
    dept_id    INT          NOT NULL AUTO_INCREMENT,
    dept_name  VARCHAR(100) NOT NULL,
    location   VARCHAR(100),
    CONSTRAINT pk_departments PRIMARY KEY (dept_id),
    CONSTRAINT uq_dept_name   UNIQUE      (dept_name)
);

-- ============================================================
-- 2. employees
-- ============================================================
CREATE TABLE employees (
    emp_id      INT            NOT NULL AUTO_INCREMENT,
    first_name  VARCHAR(50),
    last_name   VARCHAR(50),
    email       VARCHAR(100),
    salary      DECIMAL(10,2),
    hire_date   DATE,
    dept_id     INT,
    manager_id  INT,
    CONSTRAINT pk_employees  PRIMARY KEY (emp_id),
    CONSTRAINT uq_email      UNIQUE      (email),
    CONSTRAINT fk_emp_dept   FOREIGN KEY (dept_id)    REFERENCES departments(dept_id),
    CONSTRAINT fk_emp_mgr    FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
);

-- ============================================================
-- 3. projects
-- ============================================================
CREATE TABLE projects (
    project_id   INT          NOT NULL AUTO_INCREMENT,
    project_name VARCHAR(100) NOT NULL,
    start_date   DATE,
    end_date     DATE,
    dept_id      INT,
    CONSTRAINT pk_projects    PRIMARY KEY (project_id),
    CONSTRAINT fk_proj_dept   FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- ============================================================
-- 4. employee_projects  (junction – many-to-many)
-- ============================================================
CREATE TABLE employee_projects (
    emp_id       INT,
    project_id   INT,
    role         VARCHAR(50),
    hours_worked INT,
    CONSTRAINT pk_emp_proj     PRIMARY KEY (emp_id, project_id),
    CONSTRAINT fk_ep_emp       FOREIGN KEY (emp_id)     REFERENCES employees(emp_id),
    CONSTRAINT fk_ep_proj      FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- departments
INSERT INTO departments (dept_name, location) VALUES
    ('Engineering',   'San Francisco'),
    ('Marketing',     'New York'),
    ('Sales',         'London'),
    ('Human Resources','San Francisco'),
    ('Product',       'Seattle');

-- employees (manager_id set to NULL for top-level managers first)
INSERT INTO employees (first_name, last_name, email, salary, hire_date, dept_id, manager_id) VALUES
    ('Alice',   'Johnson', 'alice.j@company.com',   130000.00, '2019-03-01', 1, NULL),
    ('Bob',     'Smith',   'bob.s@company.com',     115000.00, '2021-05-20', 1, 1),
    ('Charlie', 'Davis',   'charlie.d@company.com',  95000.00, '2023-03-10', 2, NULL),
    ('Diana',   'Prince',  'diana.p@company.com',   130000.00, '2020-11-05', 5, NULL),
    ('Eve',     'White',   'eve.w@company.com',      85000.00, '2022-08-01', 4, NULL),
    ('Frank',   'Miller',  'frank.m@company.com',   110000.00, '2019-02-14', 3, NULL),
    ('Grace',   'Lee',     'grace.l@company.com',    92000.00, '2022-06-15', 1, 1),
    ('Henry',   'Brown',   'henry.b@company.com',    88000.00, '2023-01-10', 2, 3),
    ('Iris',    'Clark',   'iris.c@company.com',     97000.00, '2021-09-20', 5, 4),
    ('Jack',    'Wilson',  'jack.w@company.com',     78000.00, '2024-02-01', 3, 6);

-- projects
INSERT INTO projects (project_name, start_date, end_date, dept_id) VALUES
    ('Project Alpha',    '2024-01-01', '2024-12-31', 1),
    ('Project Beta',     '2023-06-15', '2024-06-15', 2),
    ('Cloud Migration',  '2024-03-01', '2025-03-01', 1),
    ('Market Expansion', '2024-05-01', '2025-01-01', 3),
    ('HR Automation',    '2023-11-01', '2024-11-01', 4),
    ('Product Revamp',   '2024-02-01', '2024-09-30', 5);

-- employee_projects
INSERT INTO employee_projects (emp_id, project_id, role, hours_worked) VALUES
    (1, 1, 'Lead Engineer',      320),
    (1, 3, 'Architect',          180),
    (2, 1, 'Backend Developer',  200),
    (2, 3, 'DevOps Engineer',    150),
    (3, 2, 'Marketing Lead',     260),
    (3, 5, 'Analyst',             90),
    (4, 6, 'Product Manager',    300),
    (5, 5, 'HR Specialist',      210),
    (6, 4, 'Sales Lead',         280),
    (7, 1, 'Frontend Developer', 170),
    (7, 3, 'QA Engineer',        140),
    (8, 2, 'Content Strategist', 160),
    (9, 6, 'UX Designer',        220),
    (10,4, 'Sales Representative',190);
