const express = require("express");
const {
  addDepartment,
  deleteDepartment,
  editDepartment,
  getDepartments,
} = require("../controllers/departmentController");
const authenticationMiddleware = require("../middlewares/authentication");
const authorizationMiddleware = require("../middlewares/authorization");

const app = express.Router();

app.post(
  "/add",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  addDepartment
);
app.get("/", getDepartments);

app.put(
  "/edit/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  editDepartment
);
app.delete(
  "/delete/:id",
  authenticationMiddleware,
  authorizationMiddleware("admin", "super_admin"),
  deleteDepartment
);
module.exports = app;
