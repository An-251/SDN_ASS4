const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [
        {
          type: String,
          trim: true,
          required: true,
        },
      ],
      validate: {
        validator(options) {
          return options.length >= 2;
        },
        message: "A question must contain at least two options",
      },
    },
    keywords: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    correctAnswerIndex: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Correct answer index cannot be negative"],
      validate: {
        validator(index) {
          return Array.isArray(this.options) && index < this.options.length;
        },
        message: "Correct answer index must point to an existing option",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);
