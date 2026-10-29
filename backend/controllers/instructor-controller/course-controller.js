const Course = require("../../models/Course");
const User = require("../../models/User");

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
    if (typeof courseData.studentClass !== "string" || !courseData.studentClass.trim()) {
      return res.status(400).json({
        success: false,
        message: "Select the class or batch for this course.",
      });
    }
    const classExists = await User.exists({
      role: "student",
      collegeIssued: true,
      active: true,
      studentClass: courseData.studentClass.trim(),
    });
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "The selected class or batch has no student accounts.",
      });
    }

    const newlyCreatedCourse = new Course({
      ...courseData,
      studentClass: courseData.studentClass.trim(),
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
    const filter =
      req.user.role === "admin" ? {} : { instructorId: String(req.user._id) };
    const coursesList = await Course.find(filter);

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
    const filter =
      req.user.role === "admin"
        ? { _id: id }
        : { _id: id, instructorId: String(req.user._id) };
    const courseDetails = await Course.findOne(filter);

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
    if (
      typeof updatedCourseData.studentClass !== "string" ||
      !updatedCourseData.studentClass.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Select the class or batch for this course.",
      });
    }
    const classExists = await User.exists({
      role: "student",
      collegeIssued: true,
      active: true,
      studentClass: updatedCourseData.studentClass.trim(),
    });
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: "The selected class or batch has no student accounts.",
      });
    }

    const filter =
      req.user.role === "admin"
        ? { _id: id }
        : { _id: id, instructorId: String(req.user._id) };
    const updatedCourse = await Course.findOne(filter);

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    const { instructorId, instructorName, ...editableCourseData } =
      updatedCourseData;
    editableCourseData.studentClass = updatedCourseData.studentClass.trim();
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

module.exports = {
  addNewCourse,
  getAllCourses,
  updateCourseByID,
  getCourseDetailsByID,
};
