import Database from 'better-sqlite3';
import { join } from 'path';

// Database path - using explicit path construction for better compatibility
const DB_PATH = typeof process !== 'undefined' 
  ? join(process.cwd(), 'police_roster.db')
  : 'police_roster.db';

// Initialize database
export const db = new Database(DB_PATH);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Database schema
export function initializeDatabase() {
  // Create Employees table
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      mobile_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Duties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS duties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duty_type TEXT NOT NULL,
      duty_description TEXT NOT NULL,
      is_permanent BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      duty_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (duty_id) REFERENCES duties(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      UNIQUE(date, employee_id) -- Prevent duplicate assignments per day
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(date);
    CREATE INDEX IF NOT EXISTS idx_assignments_duty_id ON assignments(duty_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_employee_id ON assignments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
  `);

  console.log('Database initialized successfully');
}

// Employee queries
export const employeeQueries = {
  // Get all employees
  getAll: db.prepare(`
    SELECT * FROM employees 
    ORDER BY name ASC
  `),

  // Get employee by ID
  getById: db.prepare(`
    SELECT * FROM employees 
    WHERE id = ?
  `),

  // Get employee by employee_id
  getByEmployeeId: db.prepare(`
    SELECT * FROM employees 
    WHERE employee_id = ?
  `),

  // Search employees by name or employee_id
  search: db.prepare(`
    SELECT * FROM employees 
    WHERE name LIKE ? OR employee_id LIKE ?
    ORDER BY name ASC
  `),

  // Insert new employee
  insert: db.prepare(`
    INSERT INTO employees (employee_id, name, designation, mobile_number)
    VALUES (?, ?, ?, ?)
  `),

  // Update employee
  update: db.prepare(`
    UPDATE employees 
    SET name = ?, designation = ?, mobile_number = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // Delete employee
  delete: db.prepare(`DELETE FROM employees WHERE id = ?`),

  // Get available employees for a specific date (not already assigned)
  getAvailable: db.prepare(`
    SELECT e.* FROM employees e
    WHERE e.id NOT IN (
      SELECT employee_id FROM assignments 
      WHERE date = ?
    )
    ORDER BY e.name ASC
  `)
};

// Duty queries
export const dutyQueries = {
  // Get all duties
  getAll: db.prepare(`
    SELECT * FROM duties 
    ORDER BY duty_type ASC
  `),

  // Get duty by ID
  getById: db.prepare(`
    SELECT * FROM duties 
    WHERE id = ?
  `),

  // Search duties
  search: db.prepare(`
    SELECT * FROM duties 
    WHERE duty_type LIKE ? OR duty_description LIKE ?
    ORDER BY duty_type ASC
  `),

  // Insert new duty
  insert: db.prepare(`
    INSERT INTO duties (duty_type, duty_description, is_permanent)
    VALUES (?, ?, ?)
  `),

  // Update duty
  update: db.prepare(`
    UPDATE duties 
    SET duty_type = ?, duty_description = ?, is_permanent = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // Delete duty
  delete: db.prepare(`DELETE FROM duties WHERE id = ?`)
};

// Assignment queries
export const assignmentQueries = {
  // Get all assignments for a specific date
  getByDate: db.prepare(`
    SELECT 
      a.id,
      a.date,
      a.duty_id,
      a.employee_id,
      d.duty_type,
      d.duty_description,
      e.name as employee_name,
      e.employee_id as employee_code,
      e.designation
    FROM assignments a
    JOIN duties d ON a.duty_id = d.id
    JOIN employees e ON a.employee_id = e.id
    WHERE a.date = ?
    ORDER BY d.duty_type ASC
  `),

  // Check if employee is already assigned on a date
  checkDuplicate: db.prepare(`
    SELECT COUNT(*) as count FROM assignments 
    WHERE date = ? AND employee_id = ?
  `),

  // Insert new assignment
  insert: db.prepare(`
    INSERT INTO assignments (date, duty_id, employee_id)
    VALUES (?, ?, ?)
  `),

  // Update assignment
  update: db.prepare(`
    UPDATE assignments 
    SET duty_id = ?, employee_id = ?
    WHERE id = ?
  `),

  // Delete assignment
  delete: db.prepare(`DELETE FROM assignments WHERE id = ?`),

  // Get assignments by duty type for export
  getByDutyType: db.prepare(`
    SELECT 
      a.date,
      d.duty_type,
      d.duty_description,
      e.name as employee_name,
      e.employee_id as employee_code,
      e.designation,
      e.mobile_number
    FROM assignments a
    JOIN duties d ON a.duty_id = d.id
    JOIN employees e ON a.employee_id = e.id
    WHERE a.date = ? AND d.duty_type LIKE ?
    ORDER BY d.duty_type ASC, e.name ASC
  `),

  // Get assignment statistics
  getStats: db.prepare(`
    SELECT 
      COUNT(*) as total_assignments,
      COUNT(DISTINCT employee_id) as employees_assigned,
      (SELECT COUNT(*) FROM employees) - COUNT(DISTINCT employee_id) as employees_available
    FROM assignments 
    WHERE date = ?
  `)
};

// Database types
export interface Employee {
  id: number;
  employee_id: string;
  name: string;
  designation: string;
  mobile_number: string;
  created_at: string;
  updated_at: string;
}

export interface Duty {
  id: number;
  duty_type: string;
  duty_description: string;
  is_permanent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  date: string;
  duty_id: number;
  employee_id: number;
  duty_type?: string;
  duty_description?: string;
  employee_name?: string;
  employee_code?: string;
  designation?: string;
}

export interface AssignmentStats {
  total_assignments: number;
  employees_assigned: number;
  employees_available: number;
}

// Initialize database on import
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'test') {
  initializeDatabase();
}