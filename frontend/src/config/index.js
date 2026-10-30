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
];

export function getCourseCategoryLabel(category) {
  return (
    courseExamOptions.find((option) => option.id === category)?.label ||
    category
  );
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
  category: courseExamOptions,
};
