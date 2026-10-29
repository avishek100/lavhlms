const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      userName,
      userEmail,
      orderStatus,
      paymentMethod,
      paymentStatus,
      orderDate,
      paymentId,
      payerId,
      courseId,
    } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course could not be found.",
      });
    }

    const coursePricing = Number(course.pricing);

    if (!Number.isFinite(coursePricing) || coursePricing <= 0) {
      return res.status(400).json({
        success: false,
        message: "Course price is invalid.",
      });
    }

    const courseTitle = course.title;
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_URL}/payment-return`,
        cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: courseTitle,
                sku: course._id.toString(),
                price: coursePricing.toFixed(2),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: coursePricing.toFixed(2),
          },
          description: courseTitle,
        },
      ],
    };

    let paymentInfo;
    try {
      paymentInfo = await new Promise((resolve, reject) => {
        paypal.payment.create(create_payment_json, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error("PayPal checkout creation failed:", {
        message: error.message,
        statusCode: error.httpStatusCode,
        providerName: error.response?.name,
      });
      return res.status(502).json({
        success: false,
        message: "PayPal could not create checkout. Check the server logs and try again.",
      });
    }

    const approveUrl = paymentInfo?.links?.find(
      (link) => link.rel === "approval_url"
    )?.href;

    if (!approveUrl) {
      console.error("PayPal checkout response did not include an approval URL.");
      return res.status(502).json({
        success: false,
        message: "PayPal returned an invalid checkout response.",
      });
    }

    const newlyCreatedCourseOrder = new Order({
      userId,
      userName,
      userEmail,
      orderStatus: orderStatus || "pending",
      paymentMethod: "paypal",
      paymentStatus: paymentStatus || "initiated",
      orderDate: orderDate || new Date(),
      paymentId: paymentId || "",
      payerId: payerId || "",
      instructorId: course.instructorId,
      instructorName: course.instructorName,
      courseImage: course.image,
      courseTitle,
      courseId: course._id.toString(),
      coursePricing: coursePricing.toFixed(2),
    });

    await newlyCreatedCourseOrder.save();

    res.status(201).json({
      success: true,
      data: {
        approveUrl,
        orderId: newlyCreatedCourseOrder._id,
      },
    });
  } catch (err) {
    console.error("Unable to create course order:", err.message);
    res.status(500).json({
      success: false,
      message: "Unable to create the course order.",
    });
  }
};

const capturePaymentAndFinalizeOrder = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = paymentId;
    order.payerId = payerId;

    await order.save();

    //update out student course model
    const studentCourses = await StudentCourses.findOne({
      userId: order.userId,
    });

    if (studentCourses) {
      studentCourses.courses.push({
        courseId: order.courseId,
        title: order.courseTitle,
        instructorId: order.instructorId,
        instructorName: order.instructorName,
        dateOfPurchase: order.orderDate,
        courseImage: order.courseImage,
      });

      await studentCourses.save();
    } else {
      const newStudentCourses = new StudentCourses({
        userId: order.userId,
        courses: [
          {
            courseId: order.courseId,
            title: order.courseTitle,
            instructorId: order.instructorId,
            instructorName: order.instructorName,
            dateOfPurchase: order.orderDate,
            courseImage: order.courseImage,
          },
        ],
      });

      await newStudentCourses.save();
    }

    //update the course schema students
    await Course.findByIdAndUpdate(order.courseId, {
      $addToSet: {
        students: {
          studentId: order.userId,
          studentName: order.userName,
          studentEmail: order.userEmail,
          paidAmount: order.coursePricing,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { createOrder, capturePaymentAndFinalizeOrder };
