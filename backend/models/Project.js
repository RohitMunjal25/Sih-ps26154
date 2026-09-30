const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    sourceData: {
      inputType: { type: String, default: "text" },
      extractedText: { type: String, required: true },
    },
    params: { type: Object }, 
    brief: { type: Object, default: null }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);