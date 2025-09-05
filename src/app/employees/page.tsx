'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  designation: string;
  mobile_number: string;
  created_at: string;
  updated_at: string;
}

// Common police designations
const DESIGNATIONS = [
  'Commissioner of Police',
  'Deputy Commissioner',
  'Assistant Commissioner',
  'Inspector',
  'Sub-Inspector',
  'Assistant Sub-Inspector',
  'Head Constable',
  'Constable',
  'Lady Constable',
  'Traffic Inspector',
  'Traffic Constable',
  'Armed Constable',
  'Driver'
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  
  // Form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    designation: '',
    mobile_number: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load employees');
      console.error('Load employees error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!formData.employee_id || !formData.name || !formData.designation || !formData.mobile_number) {
      setFormError('All fields are required');
      return;
    }

    // Validate mobile number (basic Indian mobile number validation)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile_number)) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await loadEmployees();
        setShowAddDialog(false);
        resetForm();
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Failed to add employee');
      console.error('Add employee error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingEmployee) return;

    // Validate form
    if (!formData.name || !formData.designation || !formData.mobile_number) {
      setFormError('All fields are required');
      return;
    }

    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile_number)) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/employees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingEmployee.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadEmployees();
        setShowEditDialog(false);
        setEditingEmployee(null);
        resetForm();
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Failed to update employee');
      console.error('Update employee error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/employees?id=${employee.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadEmployees();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete employee');
      console.error('Delete employee error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      name: employee.name,
      designation: employee.designation,
      mobile_number: employee.mobile_number
    });
    setFormError(null);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      name: '',
      designation: '',
      mobile_number: ''
    });
    setFormError(null);
  };

  // Generate next employee ID
  const generateNextEmployeeId = () => {
    const maxId = employees.reduce((max, emp) => {
      const numPart = parseInt(emp.employee_id.replace('EMP', '')) || 0;
      return Math.max(max, numPart);
    }, 0);
    return `EMP${(maxId + 1).toString().padStart(4, '0')}`;
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDesignation = !selectedDesignation || employee.designation === selectedDesignation;
    return matchesSearch && matchesDesignation;
  });

  // Group employees by designation
  const employeesByDesignation = filteredEmployees.reduce((acc, employee) => {
    if (!acc[employee.designation]) {
      acc[employee.designation] = [];
    }
    acc[employee.designation].push(employee);
    return acc;
  }, {} as Record<string, Employee[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-lg text-gray-600">Manage police personnel records</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Dashboard
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, employee_id: generateNextEmployeeId() }));
                  }}>
                    Add New Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new police personnel
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div>
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                        placeholder="EMP0001"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Select 
                        value={formData.designation} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          {DESIGNATIONS.map((designation) => (
                            <SelectItem key={designation} value={designation}>
                              {designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="mobile_number">Mobile Number</Label>
                      <Input
                        id="mobile_number"
                        type="tel"
                        value={formData.mobile_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                    {formError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{formError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Employee'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total Personnel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
              <p className="text-sm text-gray-500">Active employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Designations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{Object.keys(employeesByDesignation).length}</p>
              <p className="text-sm text-gray-500">Different ranks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{filteredEmployees.length}</p>
              <p className="text-sm text-gray-500">Matching records</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Filter by designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Designations</SelectItem>
                  {DESIGNATIONS.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchTerm || selectedDesignation) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDesignation('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Personnel Directory</CardTitle>
            <CardDescription>
              {filteredEmployees.length} personnel records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && employees.length === 0 ? (
              <div className="text-center py-8">
                <p>Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No employees found matching your criteria.</p>
                {employees.length === 0 && (
                  <p>Add your first employee to get started.</p>
                )}
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {Object.entries(employeesByDesignation).map(([designation, designationEmployees]) => (
                    <div key={designation}>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-900">{designation}</h3>
                        <Badge variant="secondary">{designationEmployees.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {designationEmployees.map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{employee.employee_id}</Badge>
                                <span className="font-semibold">{employee.name}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-sm text-gray-600">{employee.designation}</p>
                                <p className="text-sm text-gray-500">📱 {employee.mobile_number}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openEditDialog(employee)}
                                disabled={loading}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeleteEmployee(employee)}
                                disabled={loading}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update employee information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <Label htmlFor="edit_employee_id">Employee ID</Label>
                <Input
                  id="edit_employee_id"
                  value={formData.employee_id}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="edit_name">Full Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_designation">Designation</Label>
                <Select 
                  value={formData.designation} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, designation: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {DESIGNATIONS.map((designation) => (
                      <SelectItem key={designation} value={designation}>
                        {designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_mobile_number">Mobile Number</Label>
                <Input
                  id="edit_mobile_number"
                  type="tel"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile_number: e.target.value }))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              {formError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{formError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Employee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}