import pool from "../config/db.js";

export const createService = async ({
  businessId,
  name,
  price,
  durationMin,
  vehicleType,
  addons
}) => {
  const result = await pool.query(
    `INSERT INTO services
    (business_id, name, price, duration_min, vehicle_type, addons, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    RETURNING *`,
    [businessId, name, price, durationMin, vehicleType, addons]
  );
  return result.rows[0];
};

export const getServicesByBusiness = async (businessId) => {
  const result = await pool.query(
    "SELECT * FROM services WHERE business_id=$1 ORDER BY created_at DESC",
    [businessId]
  );
  return result.rows;
};

export const getServiceById = async (id) => {
  const result = await pool.query("SELECT * FROM services WHERE id=$1", [id]);
  return result.rows[0];
};

export const updateService = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    fields.push(`${key}=$${idx}`);
    values.push(data[key]);
    idx++;
  }

  values.push(id);
  const query = `UPDATE services SET ${fields.join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=$${idx} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteService = async (id) => {
  const result = await pool.query("DELETE FROM services WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
};
