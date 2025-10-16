import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  createUser,
  findUserByEmail,
  findUserByPhone,
} from "../models/userModel.js";

dotenv.config();

// ✅ Kullanıcı Kaydı
export const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password)
    return res.status(400).json({ message: "Tüm alanlar zorunludur." });

  try {
    const existingEmail = await findUserByEmail(email);
    const existingPhone = await findUserByPhone(phone);

    if (existingEmail)
      return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
    if (existingPhone)
      return res.status(400).json({ message: "Bu telefon numarası zaten kayıtlı." });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, phone, passwordHash, role || "CUSTOMER");

    res.status(201).json({
      message: "Kayıt başarılı.",
      user: newUser,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};

// ✅ Kullanıcı Girişi
export const login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  if (!emailOrPhone || !password)
    return res.status(400).json({ message: "E-posta/telefon ve şifre zorunludur." });

  try {
    // Kullanıcıyı e-posta ya da telefonla bul
    let user = await findUserByEmail(emailOrPhone);
    if (!user) user = await findUserByPhone(emailOrPhone);
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: "Şifre hatalı." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Giriş başarılı.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};
