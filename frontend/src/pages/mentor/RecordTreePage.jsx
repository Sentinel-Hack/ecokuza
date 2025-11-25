import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

export default function RecordTreePage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  const handlePlantNewTree = () => {
    setSelectedOption('plant');
  };

  const handleUpdateProgress = () => {
    setSelectedOption('update');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // If an option is selected, show the map
  if (selectedOption) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex items-center gap-3 p-4 border-b bg-background">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {selectedOption === 'plant' ? 'Plant New Tree' : 'Update Tree Progress'}
            </h1>
            <p className="text-sm text-muted-foreground">Click on the map to record location</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <iframe
            title="ArcGIS Tree Recording Map"
            src="https://arcg.is/191rL50"
            className="w-full h-full border-0"
            allow="geolocation"
          />
        </div>
        <div className="fixed right-4 bottom-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://arcg.is/191rL50', '_blank')}
          >
            Open map in new tab
          </Button>
        </div>
      </div>
    );
  }

  // Show the popup with three options
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Record Tree Update</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-8 text-center">
          Choose an action to record tree information
        </p>

        <div className="space-y-3">
          <Button
            onClick={handlePlantNewTree}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
          >
            Plant New Tree
          </Button>

          <Button
            onClick={handleUpdateProgress}
            variant="outline"
            className="w-full py-6 text-lg font-semibold"
          >
            Update Tree Progress
          </Button>

          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full py-6 text-lg font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
