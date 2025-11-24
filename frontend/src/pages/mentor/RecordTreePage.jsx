import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecordTreePage() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // The ArcGIS map is embedded via iframe
    if (iframeRef.current) {
      iframeRef.current.src = "https://arcg.is/191rL50";
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold">Record Tree Update</h1>
          <p className="text-sm text-muted-foreground">
            Click on the map to record a tree location
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="ArcGIS Tree Recording Map"
          className="w-full h-full border-0"
          allow="geolocation"
        />
      </div>
    </div>
  );
}
