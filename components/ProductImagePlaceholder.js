import { CookingPot, WashingMachine, AirVent, Blender, Shirt, Car, Gamepad2 } from "lucide-react";

const ICONS = {
  cocina: CookingPot,
  lavado: WashingMachine,
  climatizacion: AirVent,
  pequenos: Blender,
  ropa: Shirt,
  vehiculos: Car,
  juegos: Gamepad2,
};

export default function ProductImagePlaceholder({ category, className = "" }) {
  const Icon = ICONS[category] || Blender;
  return (
    <div className={`flex items-center justify-center bg-panel-2 text-steel ${className}`}>
      <Icon size={40} strokeWidth={1.3} />
    </div>
  );
}
