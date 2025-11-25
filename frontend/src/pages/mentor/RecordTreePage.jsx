import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Camera, Check, AlertCircle, ChevronDown } from 'lucide-react';
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

  // Update-progress form state (hooks must be top-level)
  const [treesList, setTreesList] = useState([]);
  const [updateForm, setUpdateForm] = useState({
    tree: '',
    date: new Date().toISOString().slice(0, 10),
    photo: null,
    height: '',
    health_notes: '',
    maintenance_activities: [],
    maintenance_other: '',
    latitude: null,
    longitude: null
  });
  const [photoPreviewUpdate, setPhotoPreviewUpdate] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiCall(ENDPOINTS.TREES_LIST || '/api/trees/');
        if (mounted && res && Array.isArray(res.results ? res.results : res)) {
          setTreesList(res.results || res);
        }
      } catch (err) {
        // non-fatal: trees list may not be available
        console.warn('Could not fetch trees list', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleMaintenanceActivity = (activity) => {
    setUpdateForm(prev => {
      const list = new Set(prev.maintenance_activities || []);
      if (list.has(activity)) list.delete(activity); else list.add(activity);
      return { ...prev, maintenance_activities: Array.from(list) };
    });
  };

  const handleUpdatePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdateForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreviewUpdate(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const captureGPS = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 7000 }
    );
  });

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!updateForm.tree) {
      return alert('Please select a tree to update');
    }
    if (!updateForm.photo) {
      return alert('Please add a photo (required)');
    }

    try {
      const pos = await captureGPS();
      const payload = new FormData();
      payload.append('record_type', 'update');
      payload.append('tree_id', updateForm.tree);
      payload.append('date', updateForm.date);
      payload.append('height', updateForm.height || '');
        // Combine maintenance activities and health notes into health_notes for backend
        const maintenance = (updateForm.maintenance_activities || []).join(', ');
        let combinedHealth = updateForm.health_notes || '';
        if (maintenance) combinedHealth = (combinedHealth ? combinedHealth + '\n' : '') + `Maintenance: ${maintenance}`;
        if (updateForm.maintenance_other) combinedHealth = (combinedHealth ? combinedHealth + '\n' : '') + `Other: ${updateForm.maintenance_other}`;
        payload.append('health_notes', combinedHealth || '');
      payload.append('photo', updateForm.photo);
      if (pos && pos.coords) {
        payload.append('latitude', pos.coords.latitude);
        payload.append('longitude', pos.coords.longitude);
      }

      await apiCall(ENDPOINTS.TREES_RECORDS, {
        method: 'POST',
        body: payload,
      });

      toast({ title: 'Success', description: 'Tree progress updated', duration: 3000 });
      setSelectedOption(null);
      navigate('/mentor/dashboard');
    } catch (err) {
      console.error('Update failed', err);
      toast({ title: 'Error', description: err?.payload?.detail || 'Failed to update tree', duration: 4000 });
    }
  };

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
    (async () => {
      if (isMobileDevice()) {
        const gpsEnabled = await requestGPS();
        if (!gpsEnabled) return;
      }
      setSelectedOption('update');
    })();
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

        // Try to parse created tree from response. If API returns the created
        // tree object, append it to `treesList` so the Update dropdown shows it
        // immediately without requiring a remount or re-fetch.
        let createdTree = null;
        try {
          // apiCall returns the fetch Response when successful
          createdTree = await res.json();
        } catch (err) {
          // ignore parse errors — we'll fallback to a re-fetch if needed later
          createdTree = null;
        }
        if (createdTree && createdTree.id) {
          setTreesList(prev => {
            // avoid duplicates if already present
            const exists = (prev || []).some(t => String(t.id) === String(createdTree.id));
            if (exists) return prev;
            return [createdTree, ...(prev || [])];
          });
        }
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

  // Show update form when selected
  if (selectedOption === 'update') {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex items-center gap-3 p-4 border-b bg-white">
          <button onClick={handleCancel} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-xl font-bold">Update Tree Progress</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleUpdateSubmit} className="p-6 max-w-2xl mx-auto">
            {/* Select Tree */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Tree *</label>
              <select
                name="tree"
                value={updateForm.tree}
                onChange={handleUpdateInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white cursor-pointer"
                required
              >
                <option value="">-- Select a tree from your club --</option>
                {treesList.length > 0 ? (
                  treesList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.species || `Tree #${t.id}`}
                    </option>
                  ))
                ) : (
                  <option disabled>No trees available</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-2">Select the tree you want to update from your 4K Club's tree list.</p>
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Update</label>
              <input
                type="date"
                name="date"
                value={updateForm.date}
                onChange={handleUpdateInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Photo */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo *</label>
              <div>
                {isMobileDevice() ? (
                  !photoPreviewUpdate ? (
                    <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-green-400 rounded-md cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors bg-green-50">
                      <Camera className="w-6 h-6 text-green-600" />
                      <span className="text-green-700 font-medium">Take Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleUpdatePhoto}
                        className="hidden"
                        required
                      />
                    </label>
                  ) : (
                    <div>
                      <img src={photoPreviewUpdate} alt="Tree preview" className="w-full h-48 object-cover rounded-md border-2 border-green-300" />
                      <button type="button" onClick={() => { setPhotoPreviewUpdate(null); setUpdateForm(prev => ({ ...prev, photo: null })); }} className="mt-3 w-full px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition-colors">Retake Photo</button>
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

            {/* Height / Growth */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tree Height / Growth (cm)</label>
              <input type="number" name="height" value={updateForm.height} onChange={handleUpdateInputChange} placeholder="e.g., 120" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none" />
            </div>

            {/* Health condition / notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Health Condition / Notes (Optional)</label>
              <textarea name="health_notes" value={updateForm.health_notes} onChange={handleUpdateInputChange} rows="4" placeholder="e.g., pests observed, watering, sunlight, soil condition" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none" />
            </div>

            {/* Maintenance Activities */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Maintenance Activities (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Watered','Pruned','Weeded','Mulched','Pest removal','Soil care','Support fixed','Protection added'].map(act => (
                  <label key={act} className="flex items-center gap-2">
                    <input type="checkbox" checked={updateForm.maintenance_activities.includes(act)} onChange={() => toggleMaintenanceActivity(act)} />
                    <span className="text-sm">{act}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Other (optional)</label>
                <input type="text" name="maintenance_other" value={updateForm.maintenance_other} onChange={handleUpdateInputChange} placeholder="Describe other activity..." className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>

            {/* GPS capture note */}
            <div className="mb-6 text-sm text-gray-600">
              GPS location will be attempted automatically when you submit. It is optional and only saved if permission is granted.
            </div>

            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold transition-colors">Save Update</button>
              <button type="button" onClick={handleCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Show the popup with three options - MODERN MATERIAL DESIGN
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 md:py-6">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 p-2 hover:bg-green-700/50 rounded-full transition-all md:block hidden"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <h1 className="text-3xl md:text-2xl font-bold text-white">Record Tree Update</h1>
          <p className="text-green-100 text-sm md:text-xs mt-2">
            Choose what you'd like to do today
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 md:py-6 space-y-3">
          {/* Plant New Tree Button */}
          <button
            onClick={handlePlantNewTree}
            className="w-full group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-400 hover:shadow-lg active:shadow-md p-6 md:p-5 rounded-2xl transition-all duration-300 text-left overflow-hidden hover:scale-105 active:scale-100"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 to-green-500/0 group-hover:from-green-400/5 group-hover:to-green-500/5 transition-all" />
            
            <div className="relative flex items-start justify-between">
              <div>
                <h2 className="text-xl md:text-lg font-bold text-green-900 flex items-center gap-2">
                  <span className="flex-shrink-0 w-10 h-10 md:w-9 md:h-9 rounded-full bg-green-200 flex items-center justify-center text-xl">
                    🌱
                  </span>
                  Plant New Tree
                </h2>
                <p className="text-green-700 text-sm md:text-xs mt-2">
                  Record a newly planted tree with photo, species, and location
                </p>
              </div>
              <ChevronDown className="w-6 h-6 md:w-5 md:h-5 text-green-600 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          </button>

          {/* Update Tree Progress Button */}
          <button
            onClick={handleUpdateProgress}
            className="w-full group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg active:shadow-md p-6 md:p-5 rounded-2xl transition-all duration-300 text-left overflow-hidden hover:scale-105 active:scale-100"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-500/0 group-hover:from-blue-400/5 group-hover:to-blue-500/5 transition-all" />
            
            <div className="relative flex items-start justify-between">
              <div>
                <h2 className="text-xl md:text-lg font-bold text-blue-900 flex items-center gap-2">
                  <span className="flex-shrink-0 w-10 h-10 md:w-9 md:h-9 rounded-full bg-blue-200 flex items-center justify-center text-xl">
                    📈
                  </span>
                  Update Progress
                </h2>
                <p className="text-blue-700 text-sm md:text-xs mt-2">
                  Log height, health, maintenance, and growth for an existing tree
                </p>
              </div>
              <ChevronDown className="w-6 h-6 md:w-5 md:h-5 text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0" style={{ transform: 'rotate(-90deg)' }} />
            </div>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-xs md:text-[10px]">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="w-full px-6 md:px-4 py-4 md:py-3 text-gray-700 font-medium text-lg md:text-base hover:bg-gray-100 active:bg-gray-200 rounded-2xl transition-all duration-200 border border-gray-200 hover:scale-105 active:scale-100"
          >
            Cancel
          </button>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 hidden md:block">
          <p className="text-gray-500 text-xs">
            📍 GPS will be captured automatically when you submit forms
          </p>
        </div>

        {/* Mobile close indicator */}
        <div className="md:hidden h-1 bg-gray-300 rounded-full mx-auto mb-2 w-12" />
      </div>
    </div>
  );
}
