import React from "react";
import * as LucideIcons from "lucide-react";
import { Shield } from "lucide-react";

interface LevelIconProps {
  name: string;
  className?: string;
}

export function LevelIcon({ name, className }: LevelIconProps) {
  // Extract the specific icon component from Lucide
  const IconComponent = (LucideIcons as any)[name];

  // Render the icon if found, otherwise fallback to Shield
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  
  return <Shield className={className} />;
}
