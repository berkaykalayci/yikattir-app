import express from "express";
import {
  addService,
  listServices,
  getService,
  editService,
  removeService
} from "../controllers/serviceController.js";

const router = express.Router();

router.post("/", addService);
router.get("/business/:businessId", listServices);
router.get("/:id", getService);
router.put("/:id", editService);
router.delete("/:id", removeService);

export default router;
