'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Duty {
  id: number;
  duty_type: string;
  duty_description: string;
  is_permanent: boolean;
  created_at: string;
  updated_at: string;
}

interface DutyCategories {
  guard: number;
  bodyguard: number;
  administrative: number;
  leave: number;
  training: number;
  special: number;
  maintenance: number;
  other: number;
}

export default function DutiesPage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [categories, setCategories] = useState<DutyCategories | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [permanentFilter, setPermanentFilter] = useState('');
  
  // Form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [formData, setFormData] = useState({
    duty_type: '',
    duty_description: '',
    is_permanent: false
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Load duties on component mount
  useEffect(() => {
    loadDuties();
  }, []);

  const loadDuties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/duties');
      const data = await response.json();
      
      if (data.success) {
        setDuties(data.data);
        setCategories(data.categories);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load duties');
      console.error('Load duties error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!formData.duty_type || !formData.duty_description) {
      setFormError('Duty type and description are required');
      return;
    }

    if (formData.duty_type.length < 3) {
      setFormError('Duty type must be at least 3 characters long');
      return;
    }

    if (formData.duty_description.length < 10) {
      setFormError('Duty description must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/duties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await loadDuties();
        setShowAddDialog(false);
        resetForm();
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Failed to add duty');
      console.error('Add duty error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!editingDuty) return;

    // Validate form
    if (!formData.duty_type || !formData.duty_description) {
      setFormError('Duty type and description are required');
      return;
    }

    if (formData.duty_type.length < 3) {
      setFormError('Duty type must be at least 3 characters long');
      return;
    }

    if (formData.duty_description.length < 10) {
      setFormError('Duty description must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/duties', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingDuty.id,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        await loadDuties();
        setShowEditDialog(false);
        setEditingDuty(null);
        resetForm();
      } else {
        setFormError(data.error);
      }
    } catch (err) {
      setFormError('Failed to update duty');
      console.error('Update duty error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDuty = async (duty: Duty) => {
    if (!confirm(`Are you sure you want to delete "${duty.duty_type}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/duties?id=${duty.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadDuties();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete duty');
      console.error('Delete duty error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (duty: Duty) => {
    setEditingDuty(duty);
    setFormData({
      duty_type: duty.duty_type,
      duty_description: duty.duty_description,
      is_permanent: duty.is_permanent
    });
    setFormError(null);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      duty_type: '',
      duty_description: '',
      is_permanent: false
    });
    setFormError(null);
  };

  // Filter duties
  const filteredDuties = duties.filter(duty => {
    const matchesSearch = duty.duty_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         duty.duty_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory) {
      const dutyType = duty.duty_type.toLowerCase();
      switch (selectedCategory) {
        case 'guard':
          matchesCategory = dutyType.includes('guard') || dutyType.includes('security') || 
                           dutyType.includes('gate') || dutyType.includes('patrol');
          break;
        case 'bodyguard':
          matchesCategory = dutyType.includes('protection') || dutyType.includes('bodyguard') || 
                           dutyType.includes('escort') || dutyType.includes('vip');
          break;
        case 'administrative':
          matchesCategory = dutyType.includes('desk') || dutyType.includes('admin') || 
                           dutyType.includes('file') || dutyType.includes('data');
          break;
        case 'leave':
          matchesCategory = dutyType.includes('leave') || dutyType.includes('vacation');
          break;
        case 'training':
          matchesCategory = dutyType.includes('training') || dutyType.includes('course');
          break;
        case 'special':
          matchesCategory = dutyType.includes('special') || dutyType.includes('operation') || 
                           dutyType.includes('investigation');
          break;
        case 'maintenance':
          matchesCategory = dutyType.includes('maintenance') || dutyType.includes('equipment') || 
                           dutyType.includes('cleaning');
          break;
      }
    }
    
    const matchesPermanent = !permanentFilter || 
      (permanentFilter === 'permanent' && duty.is_permanent) ||
      (permanentFilter === 'temporary' && !duty.is_permanent);
    
    return matchesSearch && matchesCategory && matchesPermanent;
  });

  // Group duties by category for better display
  const categorizedDuties = {
    guard: filteredDuties.filter(d => 
      d.duty_type.toLowerCase().includes('guard') || 
      d.duty_type.toLowerCase().includes('security') ||
      d.duty_type.toLowerCase().includes('gate') ||
      d.duty_type.toLowerCase().includes('patrol')
    ),
    bodyguard: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('protection') ||
      d.duty_type.toLowerCase().includes('bodyguard') ||
      d.duty_type.toLowerCase().includes('escort') ||
      d.duty_type.toLowerCase().includes('vip')
    ),
    administrative: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('desk') ||
      d.duty_type.toLowerCase().includes('admin') ||
      d.duty_type.toLowerCase().includes('file') ||
      d.duty_type.toLowerCase().includes('data')
    ),
    leave: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('leave') ||
      d.duty_type.toLowerCase().includes('vacation')
    ),
    training: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('training') ||
      d.duty_type.toLowerCase().includes('course')
    ),
    special: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('special') ||
      d.duty_type.toLowerCase().includes('operation') ||
      d.duty_type.toLowerCase().includes('investigation')
    ),
    maintenance: filteredDuties.filter(d =>
      d.duty_type.toLowerCase().includes('maintenance') ||
      d.duty_type.toLowerCase().includes('equipment') ||
      d.duty_type.toLowerCase().includes('cleaning')
    )
  };

  const otherDuties = filteredDuties.filter(duty => 
    !Object.values(categorizedDuties).some(categoryDuties => 
      categoryDuties.includes(duty)
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Duty Management</h1>
              <p className="text-lg text-gray-600">Manage police duty types and assignments</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                ← Back to Dashboard
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    Add New Duty
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Duty</DialogTitle>
                    <DialogDescription>
                      Create a new duty type for assignment
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDuty} className="space-y-4">
                    <div>
                      <Label htmlFor="duty_type">Duty Type</Label>
                      <Input
                        id="duty_type"
                        value={formData.duty_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, duty_type: e.target.value }))}
                        placeholder="e.g., Main Gate Security"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duty_description">Duty Description</Label>
                      <Textarea
                        id="duty_description"
                        value={formData.duty_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, duty_description: e.target.value }))}
                        placeholder="Detailed description of the duty responsibilities..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_permanent"
                        checked={formData.is_permanent}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_permanent: checked }))}
                      />
                      <Label htmlFor="is_permanent">Permanent/Stagnant Duty</Label>
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
                        {loading ? 'Adding...' : 'Add Duty'}
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
        {/* Stats Cards */}
        {categories && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Duties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{duties.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Guard Duties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{categories.guard}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bodyguard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">{categories.bodyguard}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Leave Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{categories.leave}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search duty type or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="guard">Guard Duties</SelectItem>
                  <SelectItem value="bodyguard">Bodyguard/Protection</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="leave">Leave Types</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="special">Special Operations</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={permanentFilter} onValueChange={setPermanentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="permanent">Permanent Duties</SelectItem>
                  <SelectItem value="temporary">Temporary Duties</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || selectedCategory || permanentFilter) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setPermanentFilter('');
                }}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Duties List */}
        <Card>
          <CardHeader>
            <CardTitle>Duty Directory</CardTitle>
            <CardDescription>
              {filteredDuties.length} duties found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && duties.length === 0 ? (
              <div className="text-center py-8">
                <p>Loading duties...</p>
              </div>
            ) : filteredDuties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No duties found matching your criteria.</p>
                {duties.length === 0 && (
                  <p>Add your first duty to get started.</p>
                )}
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  {/* Guard Duties */}
                  {categorizedDuties.guard.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-green-800">Guard Duties</h3>
                        <Badge variant="secondary" className="bg-green-100">{categorizedDuties.guard.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.guard.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bodyguard Duties */}
                  {categorizedDuties.bodyguard.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-purple-800">Bodyguard & Protection</h3>
                        <Badge variant="secondary" className="bg-purple-100">{categorizedDuties.bodyguard.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.bodyguard.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Administrative Duties */}
                  {categorizedDuties.administrative.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-blue-800">Administrative</h3>
                        <Badge variant="secondary" className="bg-blue-100">{categorizedDuties.administrative.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.administrative.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Leave Types */}
                  {categorizedDuties.leave.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-orange-800">Leave Types</h3>
                        <Badge variant="secondary" className="bg-orange-100">{categorizedDuties.leave.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.leave.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Training */}
                  {categorizedDuties.training.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-indigo-800">Training & Development</h3>
                        <Badge variant="secondary" className="bg-indigo-100">{categorizedDuties.training.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.training.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Operations */}
                  {categorizedDuties.special.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-red-800">Special Operations</h3>
                        <Badge variant="secondary" className="bg-red-100">{categorizedDuties.special.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.special.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maintenance */}
                  {categorizedDuties.maintenance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-800">Maintenance & Support</h3>
                        <Badge variant="secondary" className="bg-gray-100">{categorizedDuties.maintenance.length}</Badge>
                      </div>
                      <div className="grid gap-3 mb-6">
                        {categorizedDuties.maintenance.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Duties */}
                  {otherDuties.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-gray-800">Other Duties</h3>
                        <Badge variant="secondary">{otherDuties.length}</Badge>
                      </div>
                      <div className="grid gap-3">
                        {otherDuties.map((duty) => (
                          <DutyCard key={duty.id} duty={duty} onEdit={openEditDialog} onDelete={handleDeleteDuty} loading={loading} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Duty</DialogTitle>
              <DialogDescription>
                Update duty information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditDuty} className="space-y-4">
              <div>
                <Label htmlFor="edit_duty_type">Duty Type</Label>
                <Input
                  id="edit_duty_type"
                  value={formData.duty_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, duty_type: e.target.value }))}
                  placeholder="e.g., Main Gate Security"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_duty_description">Duty Description</Label>
                <Textarea
                  id="edit_duty_description"
                  value={formData.duty_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, duty_description: e.target.value }))}
                  placeholder="Detailed description of the duty responsibilities..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_is_permanent"
                  checked={formData.is_permanent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_permanent: checked }))}
                />
                <Label htmlFor="edit_is_permanent">Permanent/Stagnant Duty</Label>
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
                  {loading ? 'Updating...' : 'Update Duty'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Duty Card Component
function DutyCard({ 
  duty, 
  onEdit, 
  onDelete, 
  loading 
}: { 
  duty: Duty; 
  onEdit: (duty: Duty) => void; 
  onDelete: (duty: Duty) => void; 
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{duty.duty_type}</span>
          {duty.is_permanent && <Badge variant="secondary">Permanent</Badge>}
        </div>
        <p className="text-sm text-gray-600 mt-1">{duty.duty_description}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEdit(duty)}
          disabled={loading}
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onDelete(duty)}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}