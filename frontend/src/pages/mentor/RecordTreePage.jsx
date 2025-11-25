import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <button onClick={handleCancel} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
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
          <button
            onClick={() => window.open('https://arcg.is/191rL50', '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Open map in new tab
          </button>
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
          <button
            onClick={handlePlantNewTree}
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            Plant New Tree
          </button>

          <button
            onClick={handleUpdateProgress}
            style={{
              width: '100%',
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Update Tree Progress
          </button>

          <button
            onClick={handleCancel}
            style={{
              width: '100%',
              backgroundColor: '#d1d5db',
              color: '#1f2937',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#9ca3af'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#d1d5db'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
