import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTrees } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const SPECIES_OPTIONS = [
  { value: 'oak', label: 'Oak' },
  { value: 'maple', label: 'Maple' },
  { value: 'pine', label: 'Pine' },
  { value: 'birch', label: 'Birch' },
  { value: 'other', label: 'Other' },
];

export default function RecordTreePage() {
  const navigate = useNavigate();
  const { recordTree } = useTrees();
  const [formData, setFormData] = useState({
    species: '',
    datePlanted: new Date().toISOString().split('T')[0],
    location: '',
    latitude: '',
    longitude: '',
    height: '',
    health: 'good',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationClick = (e) => {
    // This would be connected to a map click event
    // For now, we'll use placeholder coordinates
    const latitude = e.latLng?.lat() || 0;
    const longitude = e.latLng?.lng() || 0;
    
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
      location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.species || !formData.location) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await recordTree(formData);
      toast({
        title: 'Success',
        description: 'Tree recorded successfully!',
      });
      navigate('/trees');
    } catch (error) {
      console.error('Error recording tree:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to record tree',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Record a New Tree</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-6">
          Fill in the details below to record a new tree planting.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select 
                value={formData.species}
                onValueChange={(value) => handleSelectChange('species', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="datePlanted">Planting Date *</Label>
              <Input
                id="datePlanted"
                name="datePlanted"
                type="date"
                value={formData.datePlanted}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Click on the map to set location"
                  required
                  readOnly
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    // This would open a map modal in a real implementation
                    toast({
                      title: 'Map',
                      description: 'Map integration will be implemented here',
                    });
                  }}
                >
                  Set on Map
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (meters)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min="0"
                value={formData.height}
                onChange={handleChange}
                placeholder="e.g., 1.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health">Health Status</Label>
              <Select 
                value={formData.health}
                onValueChange={(value) => handleSelectChange('health', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select health status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about the tree..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Tree'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
