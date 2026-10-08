import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    category: { type: String, enum: ['document', 'image', 'video', 'other'], default: 'other' }
  },
  { timestamps: true }
);

export default mongoose.model('File', fileSchema);