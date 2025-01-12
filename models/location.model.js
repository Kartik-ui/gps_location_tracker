import { Schema, model } from 'mongoose';

const locationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coordinates: { type: [Number], required: true },
  },
  { timestamps: true }
);

locationSchema.index({ user: 1 });
locationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export const Location = model('Location', locationSchema);
