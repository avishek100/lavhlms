const CourseProgress = require("../../models/CourseProgress");
const Course = require("../../models/Course");

//mark current lecture as viewed
const markCurrentLectureAsViewed = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;
    const userId = req.user._id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const lectureExists = course.curriculum.some(
      (lecture) => lecture._id.toString() === lectureId
    );
    if (!lectureExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found in this course.",
      });
    }

    let progress = await CourseProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new CourseProgress({
        userId,
        courseId,
        lecturesProgress: [
          {
            lectureId,
            viewed: true,
            dateViewed: new Date(),
          },
        ],
      });
      await progress.save();
    } else {
      const lectureProgress = progress.lecturesProgress.find(
        (item) => item.lectureId === lectureId
      );

      if (lectureProgress) {
        lectureProgress.viewed = true;
        lectureProgress.dateViewed = new Date();
      } else {
        progress.lecturesProgress.push({
          lectureId,
          viewed: true,
          dateViewed: new Date(),
        });
      }
      await progress.save();
    }

    const allLecturesViewed =
      progress.lecturesProgress.length === course.curriculum.length &&
      course.curriculum.every((lecture) =>
        progress.lecturesProgress.some(
          (item) => item.lectureId === lecture._id.toString() && item.viewed
        )
      );

    if (allLecturesViewed) {
      progress.completed = true;
      progress.completionDate = new Date();

      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: "Lecture marked as viewed",
      data: progress,
    });
  } catch (error) {
    console.error("Unable to update course progress:", error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//get current course progress
const getCurrentCourseProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    if (userId !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own course progress.",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const currentUserCourseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (
      !currentUserCourseProgress ||
      currentUserCourseProgress?.lecturesProgress?.length === 0
    ) {
      return res.status(200).json({
        success: true,
        message: "You can start learning this course.",
        data: {
          courseDetails: course,
          progress: [],
          hasAccess: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        courseDetails: course,
        progress: currentUserCourseProgress.lecturesProgress,
        completed: currentUserCourseProgress.completed,
        completionDate: currentUserCourseProgress.completionDate,
        hasAccess: true,
      },
    });
  } catch (error) {
    console.error("Unable to load course progress:", error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

//reset course progress

const resetCurrentCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found!",
      });
    }

    progress.lecturesProgress = [];
    progress.completed = false;
    progress.completionDate = null;

    await progress.save();

    res.status(200).json({
      success: true,
      message: "Course progress has been reset",
      data: progress,
    });
  } catch (error) {
    console.error("Unable to reset course progress:", error);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  markCurrentLectureAsViewed,
  getCurrentCourseProgress,
  resetCurrentCourseProgress,
};
// 