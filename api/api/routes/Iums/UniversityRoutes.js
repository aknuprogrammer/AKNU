const express = require("express");
const UniversityModal = require("../../models/Iums/UniversityModal");
const uploadDisk = require("../../middlewares/MulterDiskConfig");

const router = express.Router();

router.post(
  "/create-university",
  uploadDisk.single("image"),
  async (req, res) => {
    // console.log(req.file, "-------------");
    const { title } = req.body;

    try {
      if (!req.file) {
        return res.status(400).send({ message: "No image uploaded" });
      }

      console.log(req.file, "ABCD");

      const newUniversity = await UniversityModal.create({
        title,
        logo: `/uploads/${req.file.filename}`,
      });

      return res.status(200).send({ message: "New University Created" });
    } catch (e) {
      console.log(e);
      return res.status(500).send({ message: "Internal Server Error" });
    }
  }
);

router.get("/get-universities", async (req, res) => {
  try {
    const universitues = await UniversityModal.find({});

    return res.status(200).send(universitues);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/university/:id", async (req, res) => {
  try {
    const universitues = await UniversityModal.findById(req.params.id);

    return res.status(200).send(universitues);
  } catch (e) {
    console.log(e);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
