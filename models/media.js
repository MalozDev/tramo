import mongoose from 'mongoose';

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    filename: { type: String, required: true, trim: true, unique: true, index: true },
    originalName: { type: String, default: '', maxlength: 200 },
    contentType: { type: String, required: true },
    size: { type: Number, required: true, min: 1, max: 8 * 1024 * 1024 },
    data: { type: Schema.Types.Buffer, required: true },
  },
  { timestamps: true },
);

export const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);
