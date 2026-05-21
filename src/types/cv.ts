export type CVExperience = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  summary: string;
};

export type CVEducation = {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type CVSkills = string[];

export type CVTemplate =
  | "modern"
  | "classic"
  | "premium"
  | "minimal"
  | "modern-timeline"
  | "classic-columns";
export type CVStatus = "draft" | "ready" | "published";

export type CVDocument = {
  _id?: string;
  userId?: string;
  guestId?: string;
  fullName: string;
  email: string;
  phone?: string;
  title: string;
  summary: string;
  experiences: CVExperience[];
  education: CVEducation[];
  skills: CVSkills;
  photoUrl?: string;
  template: CVTemplate;
  status: CVStatus;
  isPaid?: boolean;
  isExpired?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
