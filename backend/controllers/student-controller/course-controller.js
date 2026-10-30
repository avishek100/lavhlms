const Course = require("../../models/Course");
const publicCourseFilter = {
  $or: [
    { isPublised: true },
    { isPublished: true },
    { isPublised: { $exists: false }, isPublished: { $exists: false } },
  ],
};

function toPublicCourse(course) {
  const publicCourse = course.toObject();
  delete publicCourse.students;
  delete publicCourse.instructorId;
  let hasAssignedPreview = false;
  publicCourse.curriculum = (publicCourse.curriculum || []).map((lecture) => {
    if (!lecture.freePreview || hasAssignedPreview) {
      return {
        _id: lecture._id,
        title: lecture.title,
        freePreview: false,
      };
    }

    hasAssignedPreview = true;
    return {
      _id: lecture._id,
      title: lecture.title,
      freePreview: true,
      videoUrl: lecture.videoUrl,
      readingMaterialUrl: lecture.readingMaterialUrl,
      lessonContent: lecture.lessonContent,
    };
  });

  return publicCourse;
}

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      primaryLanguage = [],
      search = "",
      sortBy = "title-atoz",
    } = req.query;

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
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

    const coursesList = await Course.find({
      $and: [filters, publicCourseFilter],
    }).sort(sortParam);

    res.status(200).json({
      success: true,
      data: coursesList.map(toPublicCourse),
    });
  } catch (e) {
    console.error("Unable to load public courses:", e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const filter = {
      _id: id,
      ...publicCourseFilter,
    };
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
      data: toPublicCourse(courseDetails),
    });
  } catch (e) {
    console.error("Unable to load public course details:", e);
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