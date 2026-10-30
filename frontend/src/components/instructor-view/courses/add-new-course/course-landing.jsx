import FormControls from "@/components/common-form/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  courseExamOptions,
  courseLandingPageFormControls,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import PropTypes from "prop-types";
import { useContext, useState } from "react";

function CourseLanding({ categories = [] }) {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const category = courseLandingFormData.category || "";
  const isCustomCategory =
    category && !courseExamOptions.some((option) => option.id === category);
  const categoryOptions = [
    ...courseExamOptions,
    ...categories
      .filter(
        (value) =>
          value &&
          value !== "__add_category__" &&
          !courseExamOptions.some((option) => option.id === value)
      )
      .map((value) => ({ id: value, label: value })),
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Landing Page</CardTitle>
        <p className="text-sm text-slate-500">
          Required to save: title, exam program, description, and price. Other
          details can be filled in later.
        </p>
      </CardHeader>
      <CardContent>
        <FormControls
          formControls={courseLandingPageFormControls.filter(
            (control) => control.name !== "category"
          )}
          formData={courseLandingFormData}
          setFormData={setCourseLandingFormData}
        />
        <div className="mt-3 space-y-2">
          <Label htmlFor="course-category">Exam program</Label>
          <Select
            value={isAddingCategory ? "__add_category__" : category}
            onValueChange={(value) => {
              if (value === "__add_category__") {
                setIsAddingCategory(true);
                setNewCategory("");
                return;
              }
              setIsAddingCategory(false);
              setCourseLandingFormData({
                ...courseLandingFormData,
                category: value,
              });
            }}
          >
            <SelectTrigger id="course-category" className="w-full">
              <SelectValue placeholder="Select an exam program" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
              {isCustomCategory &&
                !categoryOptions.some((option) => option.id === category) && (
                  <SelectItem value={category}>{category}</SelectItem>
                )}
              <SelectItem value="__add_category__">
                Add new category...
              </SelectItem>
            </SelectContent>
          </Select>
          {isAddingCategory && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="New exam program category"
                placeholder="Enter a category name"
                maxLength={60}
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!newCategory.trim()}
                onClick={() => {
                  setCourseLandingFormData({
                    ...courseLandingFormData,
                    category: newCategory.trim(),
                  });
                  setIsAddingCategory(false);
                }}
              >
                Add category
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

CourseLanding.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
};

export default CourseLanding;
