export type InstructorBadgeIcon =
  | "verified"
  | "psychology"
  | "military"
  | "speed"
  | "stars"
  | "badge";

export type MockInstructor = {
  id: string;
  name: string;
  badgeIcon: InstructorBadgeIcon;
  badgeLabel: string;
  location: string;
  city: string;
  imageUrl: string;
  imageAlt: string;
  tags: string[];
  categories: string[];
  bio: string;
  experienceYears: number;
  passRate: number;
  students: number;
  rating: number;
  hourlyRate: number;
  likes: number;
};
