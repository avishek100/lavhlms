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
  filterOptions,
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
        {[
          ["formats", "Format"],
          ["purposes", "Purpose"],
          ["timeSlots", "Time Slot"],
        ].map(([field, title]) => (
          <fieldset className="mt-5 space-y-2" key={field}>
            <legend className="text-sm font-medium text-slate-900">
              {title}
              {field === "formats" && (
                <span className="ml-1 font-normal text-slate-500">
                  (select all that apply)
                </span>
              )}
            </legend>
            <div className="flex flex-wrap gap-2">
              {field === "formats" && (
                <Label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={
                      (courseLandingFormData[field] || []).length ===
                      filterOptions[field].length
                    }
                    onChange={() =>
                      setCourseLandingFormData({
                        ...courseLandingFormData,
                        [field]:
                          (courseLandingFormData[field] || []).length ===
                          filterOptions[field].length
                            ? []
                            : filterOptions[field].map((option) => option.id),
                      })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  Select all
                </Label>
              )}
              {filterOptions[field].map((option) => {
                const selectedValues = courseLandingFormData[field] || [];
                const isSelected = selectedValues.includes(option.id);

                return (
                  <Label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-blue-200 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        setCourseLandingFormData({
                          ...courseLandingFormData,
                          [field]: isSelected
                            ? selectedValues.filter((value) => value !== option.id)
                            : [...selectedValues, option.id],
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    {option.label}
                  </Label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </CardContent>
    </Card>
  );
}

CourseLanding.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
};

export default CourseLanding;
