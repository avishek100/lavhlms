export const signInFormControls = [
  {
    name: "loginId",
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    componentType: "input",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    componentType: "input",
  },
];

export const initialSignInFormData = {
  loginId: "",
  password: "",
};

export const courseExamOptions = [
  { id: "ielts-preparation", label: "IELTS Preparation" },
  { id: "pte-preparation", label: "PTE Preparation" },
  { id: "duolingo-preparation", label: "Duolingo" },
  { id: "celpip-preparation", label: "CELPIP" },
];

export function getCourseCategoryLabel(category) {
  const option = courseExamOptions.find((item) => item.id === category);
  if (!option) return category;
  return option.label.replace(/ Preparation$/, "");
}

export const courseLandingPageFormControls = [
  {
    name: "title",
    label: "Title",
    componentType: "input",
    type: "text",
    placeholder: "Enter course title",
  },
  {
    name: "category",
    label: "Exam program",
    componentType: "select",
    type: "text",
    placeholder: "",
    options: courseExamOptions,
  },
  {
    name: "subtitle",
    label: "Subtitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter course subtitle",
  },
  {
    name: "description",
    label: "Description",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course description",
  },
  {
    name: "objectives",
    label: "Objectives",
    componentType: "textarea",
    type: "text",
    placeholder: "Enter course objectives",
  },
  {
    name: "welcomeMessage",
    label: "Welcome Message",
    componentType: "textarea",
    placeholder: "Welcome message for students",
  },
];

export const courseLandingInitialFormData = {
  title: "",
  category: "",
  subtitle: "",
  description: "",
  pricing: 0,
  objectives: "",
  welcomeMessage: "",
  image: "",
  formats: [],
  purposes: [],
  timeSlots: [],
};

export const courseCurriculumInitialFormData = [
  {
    title: "",
    videoUrl: "",
    readingMaterialUrl: "",
    lessonContent: "",
    freePreview: false,
    public_id: "",
  },
];

export const sortOptions = [
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const filterOptions = {
  category: courseExamOptions.map((option) => ({
    ...option,
    label: getCourseCategoryLabel(option.id),
  })),
  formats: [
    { id: "full-course", label: "Full Course" },
    { id: "crash-course", label: "Crash Course" },
  ],
  purposes: [
    { id: "medical-professional", label: "Medical Professional" },
    { id: "permanent-residency", label: "Permanent Residency (PR)" },
    { id: "college-university-admission", label: "College/University admission" },
  ],
  timeSlots: [
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening", label: "Evening" },
  ],
};
