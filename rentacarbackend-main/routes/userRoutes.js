const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.js");

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.get('/:id/isAdmin', userController.checkIsAdmin);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.put("/:id/verifyDriver", userController.verifyDriver);

module.exports = router;
