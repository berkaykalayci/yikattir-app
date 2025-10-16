import { createSmartAppointment } from "../models/appointmentModel.js";

export const addSmartAppointment = async (req, res) => {
  console.log("POST Body:", req.body);
  try {
    const appointment = await createSmartAppointment(req.body);
    res.status(201).json({ message: "Randevu oluşturuldu.", appointment });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
