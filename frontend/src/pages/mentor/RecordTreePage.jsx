import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RecordTreePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold">Record Tree Update</h1>
          <p className="text-sm text-muted-foreground">Click on the map to record a tree location</p>
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
