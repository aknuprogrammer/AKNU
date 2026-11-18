const mongoose = require("mongoose");
const { Schema } = mongoose;

const CoordinateSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const StopPointSchema = new Schema({
  name: { type: String },
  description: { type: String },
  location: { type: String },
  coordinates: { type: CoordinateSchema, required: true },
  images: [
    {
      data: { type: Buffer, required: true },
      contentType: { type: String, required: true },
      filename: { type: String },
    },
  ],
  time: { type: Date, default: Date.now },
});

const JourneySchema = new Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    purpose: { type: String, required: true },
    description: { type: String, required: true },

    fromLocation: { type: String, required: true },
    toLocation: { type: String, required: true },

    startCoordinates: { type: CoordinateSchema, required: true },
    endCoordinates: { type: CoordinateSchema, required: false },

    stopPoints: [StopPointSchema],

    currentLocation: {
      type: CoordinateSchema,
    },

    distance: { type: Number },
    duration: { type: Number },

    status: {
      type: String,
      enum: ["planned", "in-progress", "paused", "completed"],
      default: "planned",
    },

    endingNotes: {
      type: String,
    },

    travelExpense: {
      type: Number,
    },
    foodExpense: {
      type: Number,
    },
    accommodationExpense: {
      type: Number,
    },
    fuelExpense: {
      type: Number,
    },

    // Bill images array
    bills: [
      {
        data: { type: Buffer, required: true },
        contentType: { type: String, required: true },
        filename: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const JourneyModel = mongoose.model("facultyJourney", JourneySchema);
module.exports = JourneyModel;
