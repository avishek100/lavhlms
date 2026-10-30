const Course = require("../../models/Course");
const CourseProgress = require("../../models/CourseProgress");
const Notice = require("../../models/Notice");
const StudentCourses = require("../../models/StudentCourses");
const mongoose = require("mongoose");
const verifyAdministratorPassword = require("../../utils/verify-administrator-password");

function hasInvalidCategory(category) {
  return (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 60
  );
}

function hasInvalidCourseFilters(courseData) {
  const allowedValues = {
    formats: ["full-course", "crash-course"],
    purposes: [
      "medical-professional",
      "permanent-residency",
      "college-university-admission",
    ],
    timeSlots: ["morning", "afternoon", "evening"],
  };

  return Object.entries(allowedValues).some(([field, values]) => {
    const selected = courseData[field];
    return (
      selected !== undefined &&
      (!Array.isArray(selected) || selected.some((value) => !values.includes(value)))
    );
  });
}

function hasInvalidReadingMaterial(curriculum) {
  if (!Array.isArray(curriculum)) return true;

  return curriculum.some((lecture) => {
    if (!lecture.readingMaterialUrl) return false;

    try {
      const url = new URL(lecture.readingMaterialUrl);
      return !["http:", "https:"].includes(url.protocol);
    } catch {
      return true;
    }
  });
}

function hasInvalidLessonContent(curriculum) {
  return (
    !Array.isArray(curriculum) ||
    curriculum.some(
      (lecture) =>
        lecture.lessonContent !== undefined &&
        (typeof lecture.lessonContent !== "string" ||
          lecture.lessonContent.length > 20000)
    )
  );
}

const addNewCourse = async (req, res) => {
  try {
    const courseData = req.body;
    if (hasInvalidCategory(courseData.category)) {
      return res.status(400).json({
        success: false,
        message: "Enter an exam program name up to 60 characters.",
      });
    }
    if (hasInvalidCourseFilters(courseData)) {
      return res.status(400).json({
        success: false,
        message: "Select valid course formats, purposes, and time slots.",
      });
    }
    if (hasInvalidLessonContent(courseData.curriculum)) {
      return res.status(400).json({
        success: false,
        message: "Written lesson content must be 20,000 characters or fewer.",
      });
    }
    if (hasInvalidReadingMaterial(courseData.curriculum)) {
      return res.status(400).json({
        success: false,
        message: "Reading material links must be valid HTTP or HTTPS URLs.",
      });
    }
    const newlyCreatedCourse = new Course({
      ...courseData,
      category: courseData.category.trim(),
      studentClass: undefined,
      instructorId: String(req.user._id),
      instructorName: req.user.userName,
    });
    const saveCourse = await newlyCreatedCourse.save();

    if (saveCourse) {
      res.status(201).json({
        success: true,
        message: "Course saved successfully",
        data: saveCourse,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const coursesList = await Course.find({});

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getCourseDetailsByID = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateCourseByID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourseData = req.body;
    if (hasInvalidCategory(updatedCourseData.category)) {
      return res.status(400).json({
        success: false,
        message: "Enter an exam program name up to 60 characters.",
      });
    }
    if (hasInvalidCourseFilters(updatedCourseData)) {
      return res.status(400).json({
        success: false,
        message: "Select valid course formats, purposes, and time slots.",
      });
    }
    if (hasInvalidLessonContent(updatedCourseData.curriculum)) {
      return res.status(400).json({
        success: false,
        message: "Written lesson content must be 20,000 characters or fewer.",
      });
    }
    if (hasInvalidReadingMaterial(updatedCourseData.curriculum)) {
      return res.status(400).json({
        success: false,
        message: "Reading material links must be valid HTTP or HTTPS URLs.",
      });
    }
    const updatedCourse = await Course.findById(id);

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    const editableCourseData = { ...updatedCourseData };
    delete editableCourseData.instructorId;
    delete editableCourseData.instructorName;
    delete editableCourseData.studentClass;
    updatedCourse.studentClass = undefined;
    editableCourseData.category = updatedCourseData.category.trim();
    Object.assign(updatedCourse, editableCourseData);
    await updatedCourse.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteCourseByID = async (req, res) => {
  let session;
  let courseDeleted = false;

  try {
    const adminPassword = req.body?.adminPassword;
    if (typeof adminPassword !== "string" || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: "Enter your administrator password to confirm deletion.",
      });
    }

    if (!(await verifyAdministratorPassword(req.user._id, adminPassword))) {
      return res.status(401).json({
        success: false,
        message: "Administrator password is incorrect.",
      });
    }

    session = await mongoose.startSession();
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID.",
      });
    }

    await session.withTransaction(async () => {
      const course = await Course.findById(id).session(session);
      if (!course) return;

      await Promise.all([
        StudentCourses.updateMany(
          { "courses.courseId": String(course._id) },
          { $pull: { courses: { courseId: String(course._id) } } },
          { session }
        ),
        CourseProgress.deleteMany(
          { courseId: String(course._id) },
          { session }
        ),
        Notice.updateMany(
          { courseId: course._id },
          { $unset: { courseId: 1 } },
          { session }
        ),
      ]);

      const result = await Course.deleteOne({ _id: course._id }, { session });
      if (result.deletedCount !== 1) {
        throw new Error("Course deletion did not remove exactly one course.");
      }
      courseDeleted = true;
    });

    if (!courseDeleted) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error("Unable to delete course:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete the course.",
    });
  } finally {
    if (session) await session.endSession();
  }
};

module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
  deleteCourseByID,
};
