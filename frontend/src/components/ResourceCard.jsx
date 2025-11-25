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
      className="w-full h-auto p-4 md:p-5 elevation-2 hover:elevation-3 transition-smooth cursor-pointer hover:shadow-md min-h-[140px] md:min-h-[160px]"
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${typeColors[type]}`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <p className="text-xs md:text-sm font-medium line-clamp-2">{title}</p>
        <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wide opacity-70">
          {type === 'pdf' ? 'PDF' : type === 'video' ? 'VIDEO' : 'LINK'}
        </span>
      </div>
    </Card>
  );
}
