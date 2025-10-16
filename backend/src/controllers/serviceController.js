import {
    createService,
    getServicesByBusiness,
    getServiceById,
    updateService,
    deleteService
  } from "../models/serviceModel.js";
  
  export const addService = async (req, res) => {
    try {
      const service = await createService(req.body);
      res.status(201).json({ message: "Hizmet eklendi.", service });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const listServices = async (req, res) => {
    try {
      const services = await getServicesByBusiness(req.params.businessId);
      res.json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const getService = async (req, res) => {
    try {
      const service = await getServiceById(req.params.id);
      if (!service) return res.status(404).json({ message: "Hizmet bulunamadı." });
      res.json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const editService = async (req, res) => {
    try {
      const updated = await updateService(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Hizmet bulunamadı." });
      res.json({ message: "Güncellendi.", service: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const removeService = async (req, res) => {
    try {
      const deleted = await deleteService(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Hizmet bulunamadı." });
      res.json({ message: "Hizmet silindi.", service: deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  