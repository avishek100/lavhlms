const Course = require("../../models/Course");

const getCoursesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (studentId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own course list.",
      });
    }

    const courses = await Course.find({});

    res.status(200).json({
      success: true,
      data: courses.map((course) => ({
        courseId: course._id,
        title: course.title,
        instructorName: course.instructorName,
        courseImage: course.image,
      })),
    });
  } catch (error) {
    console.error("Unable to load student courses:", error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { getCoursesByStudentId };
// 