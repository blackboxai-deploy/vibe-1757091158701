import { NextRequest, NextResponse } from 'next/server';
import { dutyQueries, Duty } from '@/lib/database';
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

// GET - Fetch all duties or search
export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const permanent = searchParams.get('permanent');
    
    let duties: Duty[];
    
    if (search) {
      // Search duties by type or description
      const searchTerm = `%${search}%`;
      duties = dutyQueries.search.all(searchTerm, searchTerm) as Duty[];
    } else {
      // Get all duties
      duties = dutyQueries.getAll.all() as Duty[];
    }
    
    // Filter by permanent status if specified
    if (permanent !== null) {
      const isPermanent = permanent === 'true';
      duties = duties.filter(duty => duty.is_permanent === isPermanent);
    }
    
    // Categorize duties for better organization
    const categorized = categorizeDuties(duties);
    
    return NextResponse.json({
      success: true,
      data: duties,
      count: duties.length,
      categories: categorized
    });
    
  } catch (error) {
    console.error('Error fetching duties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch duties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new duty
export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { duty_type, duty_description, is_permanent = false } = body;
    
    // Validate required fields
    if (!duty_type || !duty_description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['duty_type', 'duty_description']
        },
        { status: 400 }
      );
    }
    
    // Check if duty type already exists
    const existingDuties = dutyQueries.getAll.all() as Duty[];
    const duplicate = existingDuties.find(duty => 
      duty.duty_type.toLowerCase() === duty_type.toLowerCase()
    );
    
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty type already exists',
          existing: duplicate
        },
        { status: 409 }
      );
    }
    
    // Insert new duty
    const result = dutyQueries.insert.run(duty_type, duty_description, is_permanent);
    
    // Fetch the created duty
    const newDuty = dutyQueries.getById.get(result.lastInsertRowid) as Duty;
    
    return NextResponse.json({
      success: true,
      data: newDuty,
      message: 'Duty created successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating duty:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create duty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update duty
export async function PUT(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { id, duty_type, duty_description, is_permanent = false } = body;
    
    // Validate required fields
    if (!id || !duty_type || !duty_description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['id', 'duty_type', 'duty_description']
        },
        { status: 400 }
      );
    }
    
    // Check if duty exists
    const existing = dutyQueries.getById.get(id);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty not found',
          id
        },
        { status: 404 }
      );
    }
    
    // Update duty
    dutyQueries.update.run(duty_type, duty_description, is_permanent, id);
    
    // Fetch the updated duty
    const updatedDuty = dutyQueries.getById.get(id) as Duty;
    
    return NextResponse.json({
      success: true,
      data: updatedDuty,
      message: 'Duty updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating duty:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update duty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete duty
export async function DELETE(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty ID is required'
        },
        { status: 400 }
      );
    }
    
    // Check if duty exists
    const existing = dutyQueries.getById.get(Number(id));
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duty not found',
          id
        },
        { status: 404 }
      );
    }
    
    // Delete duty
    dutyQueries.delete.run(Number(id));
    
    return NextResponse.json({
      success: true,
      message: 'Duty deleted successfully',
      deleted_id: Number(id)
    });
    
  } catch (error) {
    console.error('Error deleting duty:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete duty',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to categorize duties
function categorizeDuties(duties: Duty[]) {
  const categories = {
    guard: duties.filter(d => 
      d.duty_type.toLowerCase().includes('guard') ||
      d.duty_type.toLowerCase().includes('security') ||
      d.duty_type.toLowerCase().includes('gate') ||
      d.duty_type.toLowerCase().includes('patrol')
    ),
    bodyguard: duties.filter(d =>
      d.duty_type.toLowerCase().includes('protection') ||
      d.duty_type.toLowerCase().includes('bodyguard') ||
      d.duty_type.toLowerCase().includes('escort') ||
      d.duty_type.toLowerCase().includes('vip')
    ),
    administrative: duties.filter(d =>
      d.duty_type.toLowerCase().includes('desk') ||
      d.duty_type.toLowerCase().includes('admin') ||
      d.duty_type.toLowerCase().includes('file') ||
      d.duty_type.toLowerCase().includes('data')
    ),
    leave: duties.filter(d =>
      d.duty_type.toLowerCase().includes('leave') ||
      d.duty_type.toLowerCase().includes('vacation')
    ),
    training: duties.filter(d =>
      d.duty_type.toLowerCase().includes('training') ||
      d.duty_type.toLowerCase().includes('course')
    ),
    special: duties.filter(d =>
      d.duty_type.toLowerCase().includes('special') ||
      d.duty_type.toLowerCase().includes('operation') ||
      d.duty_type.toLowerCase().includes('investigation')
    ),
    maintenance: duties.filter(d =>
      d.duty_type.toLowerCase().includes('maintenance') ||
      d.duty_type.toLowerCase().includes('equipment') ||
      d.duty_type.toLowerCase().includes('cleaning')
    )
  };
  
  return {
    guard: categories.guard.length,
    bodyguard: categories.bodyguard.length,
    administrative: categories.administrative.length,
    leave: categories.leave.length,
    training: categories.training.length,
    special: categories.special.length,
    maintenance: categories.maintenance.length,
    other: duties.length - Object.values(categories).reduce((sum, cat) => sum + cat.length, 0)
  };
}