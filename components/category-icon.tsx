import {
  Armchair,
  Bike,
  BookOpen,
  Camera,
  Drill,
  Dumbbell,
  Gamepad2,
  Headphones,
  Laptop,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Camera,
  Gamepad2,
  Headphones,
  Laptop,
  Armchair,
  Bike,
  PartyPopper,
  Drill,
  Dumbbell,
  BookOpen,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Camera;
  return <Icon className={className} />;
}