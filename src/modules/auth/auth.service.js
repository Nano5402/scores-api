const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../../config/db')
const mailer = require('../../config/mailer')
const { generateOTP } = require('../../utils/otp')

// ── Helper interno ────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign({ id: user.id, rol: user.rol || 'miembro' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const publicUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido: user.apellido,
  email: user.email,
  numero_documento: user.numero_documento,
  rol: user.rol || 'miembro',
  telefono: user.telefono || null,
  avatar: user.avatar || null,
})

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async ({ numero_documento, password }) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE numero_documento = ? AND activo = TRUE LIMIT 1',
    [numero_documento]
  )

  if (!rows.length) {
    throw { status: 401, message: 'Documento o contraseña incorrectos' }
  }

  const user = rows[0]
  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    throw { status: 401, message: 'Documento o contraseña incorrectos' }
  }

  return { token: signToken(user), user: publicUser(user) }
}

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async ({ numero_documento, nombre, apellido, email, password, telefono }) => {
  const [existing] = await db.query(
    'SELECT id FROM users WHERE numero_documento = ? OR email = ? LIMIT 1',
    [numero_documento, email]
  )

  if (existing.length) {
    throw { status: 409, message: 'El documento o correo ya está registrado' }
  }

  const hashed = bcrypt.hashSync(password, 10)

  // El primer usuario en registrarse es admin automáticamente
  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users')
  const rol = total === 0 ? 'admin' : 'miembro'

  const [result] = await db.query(
    `INSERT INTO users (numero_documento, nombre, apellido, email, password, telefono, rol, activo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
    [numero_documento, nombre, apellido, email, hashed, telefono || null, rol]
  )

  const userId = result.insertId
  const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId])

  return { token: signToken(newUser[0]), user: publicUser(newUser[0]) }
}

// ── Forgot password (enviar OTP) ──────────────────────────────────────────────
exports.forgotPassword = async ({ email }) => {
  const [rows] = await db.query(
    'SELECT id, nombre FROM users WHERE email = ? AND activo = TRUE LIMIT 1',
    [email]
  )

  // Por seguridad respondemos igual aunque no exista el email
  if (!rows.length) return

  const user = rows[0]
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // +15 minutos

  // Invalidar OTPs anteriores no usados del mismo usuario
  await db.query('UPDATE password_resets SET used = TRUE WHERE user_id = ? AND used = FALSE', [
    user.id,
  ])

  await db.query(
    `INSERT INTO password_resets (user_id, otp_code, expires_at, used, created_at)
     VALUES (?, ?, ?, FALSE, NOW())`,
    [user.id, otp, expiresAt]
  )

  // Enviar correo
  await mailer.sendMail({
    from: `"ScoreApp" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'Código de recuperación de contraseña — ScoreApp',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1d4ed8">ScoreApp</h2>
        <p>Hola <strong>${user.nombre}</strong>,</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;margin:24px 0">
          ${otp}
        </div>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p style="color:#6b7280;font-size:13px">Si no solicitaste este código, ignora este mensaje.</p>
      </div>
    `,
  })
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
exports.verifyOTP = async ({ email, otp_code }) => {
  const [rows] = await db.query(
    `SELECT pr.id FROM password_resets pr
     INNER JOIN users u ON u.id = pr.user_id
     WHERE u.email = ?
       AND pr.otp_code = ?
       AND pr.used = FALSE
       AND pr.expires_at > NOW()
     ORDER BY pr.created_at DESC
     LIMIT 1`,
    [email, otp_code]
  )

  if (!rows.length) {
    throw { status: 400, message: 'Código inválido o expirado' }
  }
}

// ── Reset password ────────────────────────────────────────────────────────────
exports.resetPassword = async ({ email, otp_code, password }) => {
  // Volver a verificar el OTP antes de actualizar
  const [rows] = await db.query(
    `SELECT pr.id, pr.user_id FROM password_resets pr
     INNER JOIN users u ON u.id = pr.user_id
     WHERE u.email = ?
       AND pr.otp_code = ?
       AND pr.used = FALSE
       AND pr.expires_at > NOW()
     ORDER BY pr.created_at DESC
     LIMIT 1`,
    [email, otp_code]
  )

  if (!rows.length) {
    throw { status: 400, message: 'Código inválido o expirado' }
  }

  const { id: resetId, user_id } = rows[0]
  const hashed = bcrypt.hashSync(password, 10)

  await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [
    hashed,
    user_id,
  ])

  await db.query('UPDATE password_resets SET used = TRUE WHERE id = ?', [resetId])
}
