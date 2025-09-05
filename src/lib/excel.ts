// Excel export utility with proper type handling
import { assignmentQueries, Assignment } from './database';

// Dynamic imports for better compatibility
const XLSX = require('xlsx');
const { format } = require('date-fns');

// Excel export interface
export interface ExportData {
  guardDuties: Assignment[];
  bodyguardDuties: Assignment[];
  leaveRecords: Assignment[];
}

// Get assignments categorized for export
export function getExportData(date: string): ExportData {
  const allAssignments = assignmentQueries.getByDate.all(date) as Assignment[];
  
  const guardDuties = allAssignments.filter(a => 
    a.duty_type?.toLowerCase().includes('guard') ||
    a.duty_type?.toLowerCase().includes('security') ||
    a.duty_type?.toLowerCase().includes('patrol') ||
    a.duty_type?.toLowerCase().includes('gate') ||
    a.duty_type?.toLowerCase().includes('monitoring') ||
    a.duty_type?.toLowerCase().includes('control')
  );
  
  const bodyguardDuties = allAssignments.filter(a =>
    a.duty_type?.toLowerCase().includes('protection') ||
    a.duty_type?.toLowerCase().includes('bodyguard') ||
    a.duty_type?.toLowerCase().includes('escort') ||
    a.duty_type?.toLowerCase().includes('vip') ||
    a.duty_type?.toLowerCase().includes('commissioner') ||
    a.duty_type?.toLowerCase().includes('dignitary')
  );
  
  const leaveRecords = allAssignments.filter(a =>
    a.duty_type?.toLowerCase().includes('leave') ||
    a.duty_type?.toLowerCase().includes('vacation') ||
    a.duty_type?.toLowerCase().includes('medical') ||
    a.duty_type?.toLowerCase().includes('maternity') ||
    a.duty_type?.toLowerCase().includes('casual')
  );
  
  return {
    guardDuties,
    bodyguardDuties,
    leaveRecords
  };
}

// Create Excel workbook with professional formatting
export function createDutyRosterExcel(date: string): any {
  const exportData = getExportData(date);
  const workbook = XLSX.utils.book_new();
  
  // Format date for headers
  const formattedDate = format(new Date(date), 'MMMM dd, yyyy (EEEE)');
  
  // Create Guard Duties sheet
  const guardSheet = createGuardDutiesSheet(exportData.guardDuties, formattedDate);
  XLSX.utils.book_append_sheet(workbook, guardSheet, 'Guard Duties');
  
  // Create Bodyguard Duties sheet
  const bodyguardSheet = createBodyguardDutiesSheet(exportData.bodyguardDuties, formattedDate);
  XLSX.utils.book_append_sheet(workbook, bodyguardSheet, 'Bodyguard Duties');
  
  // Create Leave Records sheet
  const leaveSheet = createLeaveRecordsSheet(exportData.leaveRecords, formattedDate);
  XLSX.utils.book_append_sheet(workbook, leaveSheet, 'Leave Records');
  
  // Create Summary sheet
  const summarySheet = createSummarySheet(exportData, formattedDate);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Convert workbook to buffer
  const buffer = XLSX.write(workbook, { 
    type: 'buffer', 
    bookType: 'xlsx',
    bookSST: false,
    compression: true
  });
  
  return buffer;
}

// Create Guard Duties sheet with professional formatting
function createGuardDutiesSheet(duties: Assignment[], date: string): XLSX.WorkSheet {
  const data = [
    // Header rows
    ['POLICE HEADQUARTERS', '', '', '', '', ''],
    ['DUTY ROSTER - GUARD DUTIES', '', '', '', '', ''],
    [`Date: ${date}`, '', '', '', '', ''],
    ['', '', '', '', '', ''], // Empty row
    
    // Table headers
    ['Sr. No.', 'Employee ID', 'Name', 'Designation', 'Duty Type', 'Mobile Number'],
    
    // Data rows
    ...duties.map((duty, index) => [
      index + 1,
      duty.employee_code || '',
      duty.employee_name || '',
      duty.designation || '',
      duty.duty_type || '',
      '' // Mobile number would come from employee data if needed
    ])
  ];
  
  // Add total count
  data.push(['', '', '', '', '', '']);
  data.push([`Total Guard Personnel: ${duties.length}`, '', '', '', '', '']);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 8 },   // Sr. No.
    { width: 12 },  // Employee ID
    { width: 25 },  // Name
    { width: 20 },  // Designation
    { width: 30 },  // Duty Type
    { width: 15 }   // Mobile Number
  ];
  
  // Set print area and margins for A4
  worksheet['!printHeader'] = ['1:4'];
  worksheet['!margins'] = {
    left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
  
  return worksheet;
}

// Create Bodyguard Duties sheet
function createBodyguardDutiesSheet(duties: Assignment[], date: string): XLSX.WorkSheet {
  const data = [
    // Header rows
    ['POLICE HEADQUARTERS', '', '', '', '', ''],
    ['DUTY ROSTER - BODYGUARD ASSIGNMENTS', '', '', '', '', ''],
    [`Date: ${date}`, '', '', '', '', ''],
    ['', '', '', '', '', ''], // Empty row
    
    // Table headers
    ['Sr. No.', 'Employee ID', 'Name', 'Designation', 'Protection Assignment', 'Status'],
    
    // Data rows
    ...duties.map((duty, index) => [
      index + 1,
      duty.employee_code || '',
      duty.employee_name || '',
      duty.designation || '',
      duty.duty_type || '',
      'Active'
    ])
  ];
  
  // Add total count
  data.push(['', '', '', '', '', '']);
  data.push([`Total Bodyguard Personnel: ${duties.length}`, '', '', '', '', '']);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 8 },   // Sr. No.
    { width: 12 },  // Employee ID
    { width: 25 },  // Name
    { width: 20 },  // Designation
    { width: 35 },  // Protection Assignment
    { width: 12 }   // Status
  ];
  
  // Set print area and margins for A4
  worksheet['!printHeader'] = ['1:4'];
  worksheet['!margins'] = {
    left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
  
  return worksheet;
}

// Create Leave Records sheet
function createLeaveRecordsSheet(leaves: Assignment[], date: string): XLSX.WorkSheet {
  const data = [
    // Header rows
    ['POLICE HEADQUARTERS', '', '', '', '', ''],
    ['LEAVE RECORDS', '', '', '', '', ''],
    [`Date: ${date}`, '', '', '', '', ''],
    ['', '', '', '', '', ''], // Empty row
    
    // Table headers
    ['Sr. No.', 'Employee ID', 'Name', 'Designation', 'Leave Type', 'Duration'],
    
    // Data rows
    ...leaves.map((leave, index) => [
      index + 1,
      leave.employee_code || '',
      leave.employee_name || '',
      leave.designation || '',
      leave.duty_type || '',
      '1 Day' // Default duration
    ])
  ];
  
  // Categorize by leave types
  const leaveTypes = ['Casual Leave', 'Medical Leave', 'Maternity Leave', 'Compulsory Leave'];
  const leaveCounts = leaveTypes.map(type => ({
    type,
    count: leaves.filter(l => l.duty_type?.toLowerCase().includes(type.toLowerCase())).length
  }));
  
  data.push(['', '', '', '', '', '']);
  data.push(['LEAVE SUMMARY:', '', '', '', '', '']);
  leaveCounts.forEach(({ type, count }) => {
    if (count > 0) {
      data.push([type, `${count} personnel`, '', '', '', '']);
    }
  });
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 8 },   // Sr. No.
    { width: 12 },  // Employee ID
    { width: 25 },  // Name
    { width: 20 },  // Designation
    { width: 20 },  // Leave Type
    { width: 12 }   // Duration
  ];
  
  // Set print area and margins for A4
  worksheet['!printHeader'] = ['1:4'];
  worksheet['!margins'] = {
    left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
  
  return worksheet;
}

// Create Summary sheet
function createSummarySheet(data: ExportData, date: string): XLSX.WorkSheet {
  const totalPersonnel = data.guardDuties.length + data.bodyguardDuties.length + data.leaveRecords.length;
  
  const summaryData = [
    // Header rows
    ['POLICE HEADQUARTERS', '', ''],
    ['DAILY DUTY ROSTER SUMMARY', '', ''],
    [`Date: ${date}`, '', ''],
    ['', '', ''], // Empty row
    
    // Summary statistics
    ['DUTY CATEGORY', 'PERSONNEL COUNT', 'PERCENTAGE'],
    ['Guard Duties', data.guardDuties.length, `${((data.guardDuties.length / totalPersonnel) * 100).toFixed(1)}%`],
    ['Bodyguard Duties', data.bodyguardDuties.length, `${((data.bodyguardDuties.length / totalPersonnel) * 100).toFixed(1)}%`],
    ['Leave Records', data.leaveRecords.length, `${((data.leaveRecords.length / totalPersonnel) * 100).toFixed(1)}%`],
    ['', '', ''], // Empty row
    ['TOTAL ASSIGNED PERSONNEL', totalPersonnel, '100%'],
    
    ['', '', ''], // Empty row
    ['', '', ''], // Empty row
    
    // Additional statistics
    ['DETAILED BREAKDOWN', '', ''],
    ['', '', ''], // Empty row
    
    // Top duty types
    ['MOST COMMON DUTIES:', '', ''],
    ...getTopDutyTypes([...data.guardDuties, ...data.bodyguardDuties, ...data.leaveRecords])
      .slice(0, 10)
      .map(([dutyType, count]) => [dutyType, count, '']),
    
    ['', '', ''], // Empty row
    ['Report Generated:', new Date().toLocaleString(), '']
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  worksheet['!cols'] = [
    { width: 30 },  // Category/Description
    { width: 18 },  // Count/Value
    { width: 12 }   // Percentage/Additional
  ];
  
  // Set print area and margins for A4
  worksheet['!margins'] = {
    left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
  
  return worksheet;
}

// Get top duty types with counts
function getTopDutyTypes(assignments: Assignment[]): [string, number][] {
  const dutyCounts = new Map<string, number>();
  
  assignments.forEach(assignment => {
    const dutyType = assignment.duty_type || 'Unknown';
    dutyCounts.set(dutyType, (dutyCounts.get(dutyType) || 0) + 1);
  });
  
  return Array.from(dutyCounts.entries())
    .sort(([, a], [, b]) => b - a);
}

// Generate filename for export
export function generateExcelFilename(date: string): string {
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');
  return `Police_Duty_Roster_${formattedDate}.xlsx`;
}

// Helper function to get file download headers
export function getDownloadHeaders(filename: string) {
  return {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}