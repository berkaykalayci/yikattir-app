import pool from "../config/db.js";

// ✅ Yeni kullanıcı oluştur
export const createUser = async (name, email, phone, passwordHash, role) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING id, name, email, phone, role, created_at, updated_at`,
    [name, email, phone, passwordHash, role]
  );
  return result.rows[0];
};

// ✅ E-posta ile kullanıcı bul
export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

// ✅ Telefon ile kullanıcı bul
export const findUserByPhone = async (phone) => {
  const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
  return result.rows[0];
};

// ✅ ID ile kullanıcı bul
export const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
