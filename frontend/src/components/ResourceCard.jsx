import React from "react";
import { Card } from "@/components/ui/card";

const typeColors = {
  pdf: "bg-destructive/10 text-destructive",
  video: "bg-secondary/10 text-secondary",
  link: "bg-primary/10 text-primary",
};

export function ResourceCard({ icon: Icon, title, type, onClick }) {
  return (
    <Card
      className="w-[150px] h-[150px] p-4 elevation-2 hover:elevation-3 transition-smooth cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[type]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium line-clamp-2">{title}</p>
      </div>
    </Card>
  );
}
