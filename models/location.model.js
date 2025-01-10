import { Schema, model } from 'mongoose';

const locationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coordinates: { type: [Number], required: true },
  },
  { timestamps: true }
);

export const Location = model('Location', locationSchema);
