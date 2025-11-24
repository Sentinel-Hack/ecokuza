import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

const SPECIES_OPTIONS = [
  { value: 'oak', label: 'Oak' },
  { value: 'maple', label: 'Maple' },
  { value: 'pine', label: 'Pine' },
  { value: 'birch', label: 'Birch' },
  { value: 'other', label: 'Other' },
];

export default function RecordTreePage() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.species || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Tree data:', formData);
      alert('Tree recorded successfully!');
      navigate('/trees');
    } catch (error) {
      console.error('Error recording tree:', error);
      alert('Failed to record tree');
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
              <label className="text-sm font-medium text-gray-700">Species *</label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select species</option>
                {SPECIES_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Planting Date *</label>
              <Input
                name="datePlanted"
                type="date"
                value={formData.datePlanted}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location *</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location or coordinates"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Height (meters)</label>
              <Input
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
              <label className="text-sm font-medium text-gray-700">Health Status</label>
              <select
                name="health"
                value={formData.health}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about the tree..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
