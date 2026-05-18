import { Badge } from "@/components/ui/badge";

interface SkillBadgeProps {
  skill: string;
}

export function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <Badge className="cursor-default transition-all duration-300 hover:-translate-y-0.5 hover:border-luxury-champagne/80 hover:bg-luxury-gold/20">
      {skill}
    </Badge>
  );
}
