import {
  Car,
  GraduationCap,
  History,
  Languages,
  MapPin,
  Phone,
  Settings,
  Sparkles,
} from "lucide-react";

export function InstructorMetaBadgeIcon({ type }: { type: string }) {
  const className = "size-[18px] text-primary";
  switch (type) {
    case "car":
      return <Car className={className} />;
    case "settings":
      return <Settings className={className} />;
    case "history":
      return <History className={className} />;
    case "location":
      return <MapPin className={className} />;
    case "languages":
      return <Languages className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "school":
      return <GraduationCap className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}
