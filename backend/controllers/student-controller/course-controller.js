const Course = require("../../models/Course");
const User = require("../../models/User");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      search = "",
      sortBy = "title-atoz",
    } = req.query;

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }
    if (typeof search === "string" && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchPattern = new RegExp(escapedSearch, "i");
      filters.$or = [
        { title: searchPattern },
        { subtitle: searchPattern },
        { description: searchPattern },
        { instructorName: searchPattern },
      ];
    }

    let sortParam = {};
    switch (sortBy) {
      case "title-atoz":
        sortParam.title = 1;

        break;
      case "title-ztoa":
        sortParam.title = -1;

        break;

      default:
        sortParam.title = 1;
        break;
    }

    if (req.user.role === "student") {
      const student = await User.findById(req.user._id).select("studentClass");
      if (!student?.studentClass) {
        return res.status(403).json({
          success: false,
          message: "Your account does not have a class or batch assigned.",
        });
      }
      filters.studentClass = student.studentClass;
    }
    const coursesList = await Course.find(filters).sort(sortParam);

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

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = { _id: id };
    if (req.user.role === "student") {
      const student = await User.findById(req.user._id).select("studentClass");
      if (!student?.studentClass) {
        return res.status(403).json({
          success: false,
          message: "Your account does not have a class or batch assigned.",
          data: null,
        });
      }
      filter.studentClass = student.studentClass;
    }
    const courseDetails = await Course.findOne(filter);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
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


module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
};
// 