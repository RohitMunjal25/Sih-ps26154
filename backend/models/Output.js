const mongoose = require("mongoose");

const outputSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    outputType: { type: String, required: true },
    status: { type: String, enum: ["pending", "generating", "done", "failed"], default: "pending" },
    content: { type: Object, default: null }, 
    errorLog: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Output", outputSchema);