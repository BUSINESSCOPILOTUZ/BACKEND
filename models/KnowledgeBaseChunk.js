const mongoose = require("mongoose");

const knowledgeBaseChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["file", "text"],
      required: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    // Simple keyword-based chunks for RAG retrieval
    chunkIndex: {
      type: Number,
      default: 0,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

knowledgeBaseChunkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("KnowledgeBaseChunk", knowledgeBaseChunkSchema);
