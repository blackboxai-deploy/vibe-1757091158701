import { NextRequest, NextResponse } from 'next/server';
import { assignmentQueries, employeeQueries, dutyQueries, Assignment, AssignmentStats } from '@/lib/database';
import { initializeSampleData } from '@/lib/sample-data';
// Use require for date-fns to avoid TypeScript issues
const { format } = require('date-fns');

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

// GET - Fetch assignments for a specific date
export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const stats = searchParams.get('stats');
    
    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date parameter is required (YYYY-MM-DD format)'
        },
        { status: 400 }
      );
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        },
        { status: 400 }
      );
    }
    
    // Get assignments for the date
    const assignments = assignmentQueries.getByDate.all(date) as Assignment[];
    
    // Get statistics if requested
    let statistics: AssignmentStats | null = null;
    if (stats === 'true') {
      const statsResult = assignmentQueries.getStats.get(date) as AssignmentStats;
      statistics = statsResult;
    }
    
    // Get available employees for this date
    const availableEmployees = employeeQueries.getAvailable.all(date);
    
    // Format date for response
    const formattedDate = format(new Date(date), 'MMMM dd, yyyy (EEEE)');
    
    return NextResponse.json({
      success: true,
      data: {
        date,
        formatted_date: formattedDate,
        assignments,
        statistics,
        available_employees: availableEmployees.length,
        total_assignments: assignments.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch assignments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new assignment
export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { date, duty_id, employee_id } = body;
    
    // Validate required fields
    if (!date || !duty_id || !employee_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['date', 'duty_id', 'employee_id']
        },
        { status: 400 }
      );
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        },
        { status: 400 }
      );
    }
    
    // Check if employee exists
    const employee = employeeQueries.getById.get(employee_id);
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
          employee_id
        },
        { status: 404 }
      );
    }
    
    // Check if duty exists
    const duty = dutyQueries.getById.get(duty_id);
    if (!duty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty not found',
          duty_id
        },
        { status: 404 }
      );
    }
    
    // Check for duplicate assignment (employee already assigned on this date)
    const duplicateCheck = assignmentQueries.checkDuplicate.get(date, employee_id);
    if (duplicateCheck && duplicateCheck.count > 0) {
      // Get the existing assignment details
      const existingAssignments = assignmentQueries.getByDate.all(date) as Assignment[];
      const existingAssignment = existingAssignments.find(a => a.employee_id === employee_id);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Employee already assigned to another duty on this date',
          existing_assignment: existingAssignment,
          employee_name: employee.name,
          date
        },
        { status: 409 }
      );
    }
    
    // Create the assignment
    const result = assignmentQueries.insert.run(date, duty_id, employee_id);
    
    // Fetch the created assignment with joined data
    const assignments = assignmentQueries.getByDate.all(date) as Assignment[];
    const newAssignment = assignments.find(a => a.id === result.lastInsertRowid);
    
    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: 'Assignment created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating assignment:', error);
    
    // Handle SQLite constraint errors
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee already assigned to another duty on this date',
          details: 'Each employee can only be assigned to one duty per day'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update assignment
export async function PUT(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { id, duty_id, employee_id } = body;
    
    // Validate required fields
    if (!id || !duty_id || !employee_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'duty_id', 'employee_id']
        },
        { status: 400 }
      );
    }
    
    // Check if employee exists
    const employee = employeeQueries.getById.get(employee_id);
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee not found',
          employee_id
        },
        { status: 404 }
      );
    }
    
    // Check if duty exists
    const duty = dutyQueries.getById.get(duty_id);
    if (!duty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty not found',
          duty_id
        },
        { status: 404 }
      );
    }
    
    // Update assignment
    assignmentQueries.update.run(duty_id, employee_id, id);
    
    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      updated_id: id
    });
    
  } catch (error) {
    console.error('Error updating assignment:', error);
    
    // Handle SQLite constraint errors
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Employee already assigned to another duty on this date',
          details: 'Each employee can only be assigned to one duty per day'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete assignment
export async function DELETE(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assignment ID is required'
        },
        { status: 400 }
      );
    }
    
    // Delete assignment
    const result = assignmentQueries.delete.run(Number(id));
    
    if (result.changes === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Assignment not found or already deleted',
          id
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully',
      deleted_id: Number(id)
    });
    
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}