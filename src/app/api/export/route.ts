import { NextRequest, NextResponse } from 'next/server';
import { createDutyRosterExcel, generateExcelFilename, getDownloadHeaders } from '@/lib/excel';
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

// GET - Export duty roster to Excel
export async function GET(request: NextRequest) {
  try {
    ensureInitialized();
    
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const format = searchParams.get('format') || 'xlsx';
    
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
    
    // Validate format
    if (format !== 'xlsx') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only Excel format (xlsx) is supported'
        },
        { status: 400 }
      );
    }
    
    try {
      // Generate Excel file
      const excelBuffer = createDutyRosterExcel(date);
      const filename = generateExcelFilename(date);
      
      // Create response with proper headers
      const response = new NextResponse(excelBuffer);
      
      // Set download headers
      const headers = getDownloadHeaders(filename);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
      
    } catch (excelError) {
      console.error('Excel generation error:', excelError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate Excel file',
          details: excelError instanceof Error ? excelError.message : 'Excel generation failed'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in export API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export duty roster',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Export with custom parameters
export async function POST(request: NextRequest) {
  try {
    ensureInitialized();
    
    const body = await request.json();
    const { 
      date, 
      customTitle
    } = body;
    
    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date is required'
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
    
    try {
      // Generate Excel file with custom parameters
      const excelBuffer = createDutyRosterExcel(date);
      const filename = customTitle 
        ? `${customTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.xlsx`
        : generateExcelFilename(date);
      
      // Create response
      const response = new NextResponse(excelBuffer);
      
      // Set download headers
      const headers = getDownloadHeaders(filename);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
      
    } catch (excelError) {
      console.error('Excel generation error:', excelError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate Excel file',
          details: excelError instanceof Error ? excelError.message : 'Excel generation failed'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in export POST API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to export duty roster',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}