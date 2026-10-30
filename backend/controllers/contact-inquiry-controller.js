const ContactInquiry = require("../models/ContactInquiry");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedPreferences = {
  category: [
    "ielts-preparation",
    "pte-preparation",
    "duolingo-preparation",
    "celpip-preparation",
  ],
  formats: ["full-course", "crash-course"],
  purposes: [
    "medical-professional",
    "permanent-residency",
    "college-university-admission",
  ],
  timeSlots: ["morning", "afternoon", "evening"],
};

const createContactInquiry = async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email =
      typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const contactNumber =
      typeof req.body.contactNumber === "string"
        ? req.body.contactNumber.trim()
        : "";
    const message =
      typeof req.body.message === "string" ? req.body.message.trim() : "";
    const digitsInContactNumber = contactNumber.replace(/\D/g, "").length;
    const hasValidContactNumber =
      contactNumber.length >= 7 &&
      contactNumber.length <= 20 &&
      digitsInContactNumber >= 7 &&
      /^[+0-9 ().-]+$/.test(contactNumber) &&
      !contactNumber.slice(1).includes("+");
    const rawPreferences = req.body.preferences;
    const hasValidPreferences =
      rawPreferences === undefined ||
      (rawPreferences !== null &&
        typeof rawPreferences === "object" &&
        !Array.isArray(rawPreferences));
    const submittedPreferences = hasValidPreferences
      ? rawPreferences || {}
      : {};
    const preferences = {};
    const invalidPreferences =
      !hasValidPreferences ||
      Object.keys(submittedPreferences).some(
        (field) => !Object.hasOwn(allowedPreferences, field)
      ) ||
      Object.entries(allowedPreferences).some(([field, allowedValues]) => {
        const selected = submittedPreferences[field] ?? [];
        if (
          !Array.isArray(selected) ||
          selected.length > allowedValues.length ||
          selected.some((value) => !allowedValues.includes(value))
        ) {
          return true;
        }
        preferences[field] = [...new Set(selected)];
        return false;
      });
    const hasSelectedPreference = Object.values(preferences).some(
      (selected) => selected.length > 0
    );

    if (
      !name ||
      name.length > 100 ||
      (email && (!emailPattern.test(email) || email.length > 254)) ||
      !hasValidContactNumber ||
      !message ||
      message.length > 5000 ||
      invalidPreferences ||
      !hasSelectedPreference
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enter your name, a valid contact number, a message, and select at least one interest.",
      });
    }

    const inquiry = await ContactInquiry.create({
      name,
      email,
      contactNumber,
      message,
      preferences,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent.",
      data: { id: inquiry._id },
    });
  } catch (error) {
    console.error("Unable to save contact inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send your message. Please try again.",
    });
  }
};

const getContactInquiries = async (req, res) => {
  try {
    const inquiries = await ContactInquiry.find({})
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Unable to load contact inquiries:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load contact messages.",
    });
  }
};

const markContactInquiryRead = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true, runValidators: true }
    );
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found.",
      });
    }
    return res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    console.error("Unable to update contact inquiry:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update the contact message.",
    });
  }
};

module.exports = {
  createContactInquiry,
  getContactInquiries,
  markContactInquiryRead,
};
