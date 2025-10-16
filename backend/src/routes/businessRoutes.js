import express from "express";
import {
  addBusiness,
  listBusinesses,
  getBusiness,
  editBusiness,
  removeBusiness
} from "../controllers/businessController.js";

const router = express.Router();

router.post("/", addBusiness);
router.get("/", listBusinesses);
router.get("/:id", getBusiness);
router.put("/:id", editBusiness);
router.delete("/:id", removeBusiness);

export default router;
