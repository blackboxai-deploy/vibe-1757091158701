import { NextRequest, NextResponse } from 'next/server';
import { employeeQueries, Employee } from '@/lib/database';
import { initializeSampleData } from '@/lib/sample-data';

// Initialize sample data on first API call
let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    try {
      initializeSampleData();
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }
}

// GET - Fetch all employees or search
export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const available = searchParams.get('available');
    const date = searchParams.get('date');
    
    let employees: Employee[];
    
    if (available === 'true' && date) {
      // Get available employees for a specific date
      employees = employeeQueries.getAvailable.all(date) as Employee[];
    } else if (search) {
      // Search employees by name or employee_id
      const searchTerm = `%${search}%`;
      employees = employeeQueries.search.all(searchTerm, searchTerm) as Employee[];
    } else {
      // Get all employees
      employees = employeeQueries.getAll.all() as Employee[];
    }
    
    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length
    });
    
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch employees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { employee_id, name, designation, mobile_number } = body;
    
    // Validate required fields
    if (!employee_id || !name || !designation || !mobile_number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['employee_id', 'name', 'designation', 'mobile_number']
        },
        { status: 400 }
      );
    }
    
    // Check if employee_id already exists
    const existing = employeeQueries.getByEmployeeId.get(employee_id);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID already exists',
          employee_id
        },
        { status: 409 }
      );
    }
    
    // Insert new employee
    const result = employeeQueries.insert.run(employee_id, name, designation, mobile_number);
    
    // Fetch the created employee
    const newEmployee = employeeQueries.getById.get(result.lastInsertRowid) as Employee;
    
    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: 'Employee created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update employee
export async function PUT(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { id, name, designation, mobile_number } = body;
    
    // Validate required fields
    if (!id || !name || !designation || !mobile_number) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'name', 'designation', 'mobile_number']
        },
        { status: 400 }
      );
    }
    
    // Check if employee exists
    const existing = employeeQueries.getById.get(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
          id
        },
        { status: 404 }
      );
    }
    
    // Update employee
    employeeQueries.update.run(name, designation, mobile_number, id);
    
    // Fetch the updated employee
    const updatedEmployee = employeeQueries.getById.get(id) as Employee;
    
    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Employee updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete employee
export async function DELETE(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee ID is required'
        },
        { status: 400 }
      );
    }
    
    // Check if employee exists
    const existing = employeeQueries.getById.get(Number(id));
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
          id
        },
        { status: 404 }
      );
    }
    
    // Delete employee
    employeeQueries.delete.run(Number(id));
    
    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
      deleted_id: Number(id)
    });
    
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}