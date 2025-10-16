import pool from "../config/db.js";

export const createBusiness = async ({
  ownerId,
  name,
  type,
  city,
  district,
  address,
  capacity,
  imageUrl,
  logoUrl
}) => {
  const result = await pool.query(
    `INSERT INTO businesses
    (owner_id, name, type, city, district, address, capacity, image_url, logo_url, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    RETURNING *`,
    [ownerId, name, type, city, district, address, capacity, imageUrl, logoUrl]
  );
  return result.rows[0];
};

export const getAllBusinesses = async () => {
  const result = await pool.query("SELECT * FROM businesses ORDER BY created_at DESC");
  return result.rows;
};

export const getBusinessById = async (id) => {
  const result = await pool.query("SELECT * FROM businesses WHERE id=$1", [id]);
  return result.rows[0];
};

export const updateBusiness = async (id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key in data) {
    fields.push(`${key}=$${idx}`);
    values.push(data[key]);
    idx++;
  }

  values.push(id);
  const query = `UPDATE businesses SET ${fields.join(", ")}, updated_at=CURRENT_TIMESTAMP WHERE id=$${idx} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteBusiness = async (id) => {
  const result = await pool.query("DELETE FROM businesses WHERE id=$1 RETURNING *", [id]);
  return result.rows[0];
};
