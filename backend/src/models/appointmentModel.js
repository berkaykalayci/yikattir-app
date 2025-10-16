import pool from "../config/db.js";

export const createSmartAppointment = async ({
  businessId,
  customerId,
  serviceId,
  date,
  time,
  vehicleType,
  plate,
  notes,
  totalPrice,
  durationMin
}) => {
  // 1️⃣ İşletme kapasitesi
  const businessRes = await pool.query("SELECT capacity FROM businesses WHERE id=$1", [businessId]);
  if (!businessRes.rows[0]) throw new Error("İşletme bulunamadı.");
  const capacity = businessRes.rows[0].capacity;

  // 2️⃣ Çakışan randevular
  const overlapRes = await pool.query(
    `SELECT COUNT(*) FROM appointments 
     WHERE business_id=$1 AND date=$2 AND time=$3 AND status IN ('PENDING','CONFIRMED')`,
    [businessId, date, time]
  );
  if (parseInt(overlapRes.rows[0].count) >= capacity) throw new Error("Seçilen saatte kapasite dolu.");

  // 3️⃣ Çalışma saatleri
  const dayOfWeek = new Date(date).getDay() === 0 ? 7 : new Date(date).getDay();
  const workingRes = await pool.query(
    `SELECT * FROM working_hours 
     WHERE business_id=$1 AND day_of_week=$2 AND is_open=TRUE`,
    [businessId, dayOfWeek]
  );
  if (!workingRes.rows[0]) throw new Error("İşletme bu gün kapalı.");

  const wh = workingRes.rows[0];
  const [openH, openM] = wh.open_time.split(":").map(Number);
  const [closeH, closeM] = wh.close_time.split(":").map(Number);
  const [hour, min] = time.split(":").map(Number);
  const appointmentEnd = hour * 60 + min + durationMin;
  const openTimeMinutes = openH * 60 + openM;
  const closeTimeMinutes = closeH * 60 + closeM;

  if (hour * 60 + min < openTimeMinutes || appointmentEnd > closeTimeMinutes) throw new Error("Seçilen saat çalışma saatleri dışında.");

  // 4️⃣ Randevu oluştur
  const result = await pool.query(
    `INSERT INTO appointments
    (business_id, customer_id, service_id, date, time, vehicle_type, plate, notes, total_price, status, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    RETURNING *`,
    [businessId, customerId, serviceId, date, time, vehicleType, plate, notes, totalPrice]
  );
  return result.rows[0];
};
