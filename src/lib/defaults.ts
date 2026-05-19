import { CVDocument } from "@/types/cv";

export const defaultCV: CVDocument = {
  userId: "",
  fullName: "",
  email: "",
  phone: "",
  title: "",
  summary: "",
  experiences: [{ company: "", role: "", startDate: "", endDate: "", summary: "" }],
  education: [{ school: "", degree: "", startDate: "", endDate: "" }],
  skills: [],
  photoUrl: "",
  template: "modern",
  status: "draft",
  isPaid: false,
  isExpired: false,
};
