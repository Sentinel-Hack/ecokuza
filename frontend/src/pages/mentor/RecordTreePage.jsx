import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Camera } from 'lucide-react';
import { ENDPOINTS, apiCall } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';

const TREE_SPECIES = [
  'Acacia',
  'Bamboo',
  'Cedar',
  'Ebony',
  'Fig',
  'Mahogany',
  'Mango',
  'Oak',
  'Palm',
  'Pine',
  'Willow',
  'Other'
];

const TREE_TYPES = [
  'Fruit Tree',
  'Timber Tree',
  'Medicinal Tree',
  'Ornamental Tree',
  'Windbreak',
  'Shade Tree',
  'Nitrogen Fixer',
  'Other'
];

export default function RecordTreePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({
    species: '',
    type: '',
    location: '',
    photo: null,
    notes: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePlantNewTree = async () => {
    if (isMobileDevice()) {
      const gpsEnabled = await requestGPS();
      if (!gpsEnabled) {
        return;
      }
    }
    setSelectedOption('plant');
  };

  const handleUpdateProgress = () => {
    setSelectedOption('update');
  };

  const handleCancel = () => {
    if (selectedOption === 'plant' || selectedOption === 'update') {
      setSelectedOption(null);
      setFormData({ species: '', type: '', location: '', photo: null, notes: '' });
      setPhotoPreview(null);
    } else {
      navigate(-1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const requestGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('GPS enabled:', position.coords);
          resolve(true);
        },
        (error) => {
          console.log('GPS error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            alert('GPS permission denied. Please enable location services and try again.');
          } else {
            alert('Unable to access GPS. Please enable location services.');
          }
          resolve(false);
        },
        { timeout: 5000 }
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const getPosition = () => new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { timeout: 7000 }
      );
    });

    (async () => {
      try {
        const pos = await getPosition();

        const payload = new FormData();
        payload.append('record_type', 'plant');
        payload.append('species', formData.species);
        payload.append('tree_type', formData.type);
        payload.append('location_description', formData.location);
        payload.append('notes', formData.notes || '');
        if (formData.photo) payload.append('photo', formData.photo);
        if (pos && pos.coords) {
          payload.append('latitude', pos.coords.latitude);
          payload.append('longitude', pos.coords.longitude);
          if (pos.coords.altitude !== null) payload.append('altitude', pos.coords.altitude);
        }

        // Use centralized API helper. apiCall now handles FormData properly.
        const res = await apiCall(ENDPOINTS.TREES_RECORDS, {
          method: 'POST',
          body: payload,
        });

        console.log('Tree record response:', res);
        toast({
          title: 'Success',
          description: 'Tree update recorded!',
          duration: 3000,
        });
        setSelectedOption(null);
        setFormData({ species: '', type: '', location: '', photo: null, notes: '' });
        setPhotoPreview(null);
        navigate('/mentor/dashboard');
      } catch (err) {
        console.error('Failed to save tree record', err);
        toast({
          title: 'Error',
          description: err?.payload?.detail || err.message || 'Failed to save tree record',
          duration: 4000,
        });
      }
    })();
  };

  // Show tree planting form
  if (selectedOption === 'plant') {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <button onClick={handleCancel} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-bold">Plant New Tree</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto">
            {/* Tree Species */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tree Species *
              </label>
              <input
                type="text"
                name="species"
                placeholder="Search or select species..."
                value={formData.species}
                onChange={handleInputChange}
                list="species-list"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
              <datalist id="species-list">
                {TREE_SPECIES.map(sp => (
                  <option key={sp} value={sp} />
                ))}
              </datalist>
            </div>

            {/* Tree Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tree Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Select tree type...</option>
                {TREE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location Description *
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Near the main gate, along the fence..."
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Tree Photo */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tree Photo *
              </label>
              <div>
                {isMobileDevice() ? (
                  !photoPreview ? (
                    <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-green-400 rounded-md cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors bg-green-50">
                      <Camera className="w-6 h-6 text-green-600" />
                      <span className="text-green-700 font-medium">Take Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                        required={!formData.photo}
                      />
                    </label>
                  ) : (
                    <div>
                      <img
                        src={photoPreview}
                        alt="Tree preview"
                        className="w-full h-48 object-cover rounded-md border-2 border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setFormData(prev => ({ ...prev, photo: null }));
                        }}
                        className="mt-3 w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition-colors"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                    <Camera className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600 font-medium">Camera available on mobile only</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes/Remarks */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes/Remarks (Optional)
              </label>
              <textarea
                name="notes"
                placeholder="Add any additional information about the tree..."
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold transition-colors"
              >
                Save Tree Record
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show map for update option
  if (selectedOption === 'update') {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex items-center gap-3 p-4 border-b bg-background">
          <button onClick={handleCancel} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold">Update Tree Progress</h1>
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
