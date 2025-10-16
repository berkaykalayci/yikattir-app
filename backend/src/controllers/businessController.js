import {
    createBusiness,
    getAllBusinesses,
    getBusinessById,
    updateBusiness,
    deleteBusiness
  } from "../models/businessModel.js";
  
  export const addBusiness = async (req, res) => {
    try {
      const business = await createBusiness(req.body);
      res.status(201).json({ message: "İşletme eklendi.", business });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const listBusinesses = async (req, res) => {
    try {
      const businesses = await getAllBusinesses();
      res.json(businesses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const getBusiness = async (req, res) => {
    try {
      const business = await getBusinessById(req.params.id);
      if (!business) return res.status(404).json({ message: "İşletme bulunamadı." });
      res.json(business);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const editBusiness = async (req, res) => {
    try {
      const updated = await updateBusiness(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "İşletme bulunamadı." });
      res.json({ message: "Güncellendi.", business: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  
  export const removeBusiness = async (req, res) => {
    try {
      const deleted = await deleteBusiness(req.params.id);
      if (!deleted) return res.status(404).json({ message: "İşletme bulunamadı." });
      res.json({ message: "İşletme silindi.", business: deleted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Sunucu hatası." });
    }
  };
  