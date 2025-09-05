'use client';

import { useState, useEffect } from 'react';
// Use require for date-fns to avoid TypeScript issues
const { format } = require('date-fns');
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  designation: string;
  mobile_number: string;
}

interface Duty {
  id: number;
  duty_type: string;
  duty_description: string;
  is_permanent: boolean;
}

interface Assignment {
  id: number;
  date: string;
  duty_id: number;
  employee_id: number;
  duty_type: string;
  duty_description: string;
  employee_name: string;
  employee_code: string;
  designation: string;
}

interface AssignmentStats {
  total_assignments: number;
  employees_assigned: number;
  employees_available: number;
}

export default function DashboardPage() {
  // State management
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDutyType, setSelectedDutyType] = useState('');
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [selectedDate]);

  // Load all necessary data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadAssignments(),
        loadEmployees(),
        loadDuties(),
        loadAvailableEmployees()
      ]);
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load assignments for selected date
  const loadAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?date=${selectedDate}&stats=true`);
      const data = await response.json();
      
      if (data.success) {
        setAssignments(data.data.assignments);
        setStats(data.data.statistics);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
      throw err;
    }
  };

  // Load all employees
  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      throw err;
    }
  };

  // Load all duties
  const loadDuties = async () => {
    try {
      const response = await fetch('/api/duties');
      const data = await response.json();
      
      if (data.success) {
        setDuties(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to load duties:', err);
      throw err;
    }
  };

  // Load available employees for selected date
  const loadAvailableEmployees = async () => {
    try {
      const response = await fetch(`/api/employees?available=true&date=${selectedDate}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableEmployees(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Failed to load available employees:', err);
      throw err;
    }
  };

  // Create new assignment
  const createAssignment = async () => {
    if (!selectedDuty || !selectedEmployee) {
      setAssignmentError('Please select both duty and employee');
      return;
    }

    setLoading(true);
    setAssignmentError(null);

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          duty_id: selectedDuty.id,
          employee_id: parseInt(selectedEmployee)
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh data after successful assignment
        await loadAllData();
        setShowAssignmentDialog(false);
        setSelectedDuty(null);
        setSelectedEmployee('');
      } else {
        setAssignmentError(data.error);
      }
    } catch (err) {
      setAssignmentError('Failed to create assignment. Please try again.');
      console.error('Assignment creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/assignments?id=${assignmentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadAllData();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete assignment');
      console.error('Assignment deletion error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export?date=${selectedDate}&format=xlsx`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Police_Duty_Roster_${selectedDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to export Excel file');
      }
    } catch (err) {
      setError('Failed to export Excel file');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter duties based on search and type
  const filteredDuties = duties.filter(duty => {
    const matchesSearch = duty.duty_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         duty.duty_description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedDutyType || 
                       duty.duty_type.toLowerCase().includes(selectedDutyType.toLowerCase());
    return matchesSearch && matchesType;
  });

  // Get assigned duties (duties that have assignments)
  const assignedDuties = assignments.map(a => a.duty_id);
  const unassignedDuties = filteredDuties.filter(duty => !assignedDuties.includes(duty.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Police Headquarters</h1>
              <p className="text-lg text-gray-600">Duty Roster Management System</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Date & Day</p>
              <p className="text-lg font-semibold text-gray-900">
                {format(new Date(), 'MMMM dd, yyyy (EEEE)')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selection and Stats */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Roster Date Selection</CardTitle>
              <CardDescription>Select date to view and manage duty assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto"
                />
                <Button onClick={loadAllData} disabled={loading}>
                  {loading ? 'Loading...' : 'Load Roster'}
                </Button>
                <Button onClick={exportToExcel} variant="outline" disabled={loading}>
                  Export Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Statistics</CardTitle>
                <CardDescription>Assignment overview for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.total_assignments}</p>
                    <p className="text-sm text-gray-500">Total Assigned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.employees_assigned}</p>
                    <p className="text-sm text-gray-500">Personnel Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.employees_available}</p>
                    <p className="text-sm text-gray-500">Still Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments">Current Assignments</TabsTrigger>
            <TabsTrigger value="duties">Available Duties</TabsTrigger>
            <TabsTrigger value="employees">Personnel Directory</TabsTrigger>
          </TabsList>

          {/* Current Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Current Assignments - {format(new Date(selectedDate), 'MMMM dd, yyyy')}</CardTitle>
                <CardDescription>
                  {assignments.length} duties assigned for this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No assignments found for this date.</p>
                    <p>Start by assigning duties to available personnel.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{assignment.employee_code}</Badge>
                              <span className="font-semibold">{assignment.employee_name}</span>
                              <span className="text-gray-500">({assignment.designation})</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{assignment.duty_type}</p>
                            <p className="text-xs text-gray-400 mt-1">{assignment.duty_description}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteAssignment(assignment.id)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Available Duties Tab */}
          <TabsContent value="duties">
            <Card>
              <CardHeader>
                <CardTitle>Available Duties</CardTitle>
                <CardDescription>
                  Click on any duty to assign personnel
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Input
                    placeholder="Search duties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={selectedDutyType} onValueChange={setSelectedDutyType}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="guard">Guard Duties</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="protection">Protection</SelectItem>
                      <SelectItem value="leave">Leave</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {unassignedDuties.map((duty) => (
                      <div 
                        key={duty.id} 
                        className="p-4 border rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDuty(duty);
                          setShowAssignmentDialog(true);
                          setAssignmentError(null);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-800">{duty.duty_type}</span>
                              {duty.is_permanent && <Badge variant="secondary">Permanent</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{duty.duty_description}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Assign →
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {unassignedDuties.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>All duties have been assigned or no duties match your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personnel Directory Tab */}
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Personnel Directory</CardTitle>
                <CardDescription>
                  {employees.length} total personnel • {availableEmployees.length} available for {selectedDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="grid gap-3">
                    {employees.map((employee) => {
                      const isAvailable = availableEmployees.some(ae => ae.id === employee.id);
                      return (
                        <div key={employee.id} className={`p-3 border rounded-lg ${isAvailable ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{employee.employee_id}</Badge>
                                <span className="font-semibold">{employee.name}</span>
                                {isAvailable ? (
                                  <Badge className="bg-green-100 text-green-800">Available</Badge>
                                ) : (
                                  <Badge variant="secondary">Assigned</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{employee.designation}</p>
                            </div>
                            <p className="text-sm text-gray-500">{employee.mobile_number}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Personnel to Duty</DialogTitle>
              <DialogDescription>
                Select an available employee for this duty assignment
              </DialogDescription>
            </DialogHeader>

            {selectedDuty && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">{selectedDuty.duty_type}</h4>
                  <p className="text-sm text-blue-700 mt-1">{selectedDuty.duty_description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Select Employee</label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose available employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{employee.employee_id}</Badge>
                            <span>{employee.name}</span>
                            <span className="text-gray-500">({employee.designation})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assignmentError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{assignmentError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAssignmentDialog(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createAssignment} 
                    disabled={loading || !selectedEmployee}
                  >
                    {loading ? 'Assigning...' : 'Assign Duty'}
                  </Button>
                </div>
              </div>
            )}

            {availableEmployees.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p>No available employees for this date.</p>
                <p>All personnel have been assigned duties.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}