import { CookingPot, Refrigerator, WashingMachine, AirVent, Blender } from "lucide-react";

const ICONS = {
  cocina: CookingPot,
  frio: Refrigerator,
  lavado: WashingMachine,
  climatizacion: AirVent,
  pequenos: Blender,
};

export default function ProductImagePlaceholder({ category, className = "" }) {
  const Icon = ICONS[category] || Blender;
  return (
    <div className={`flex items-center justify-center bg-panel-2 text-steel ${className}`}>
      <Icon size={40} strokeWidth={1.3} />
    </div>
  );
}
