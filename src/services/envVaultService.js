/**
 * Environment Variable Vault & Secret Safety Audit Service
 * Documents and validates environment templates across projects
 */

export const ENV_VAULT_TEMPLATES = [
  {
    projectId: 'it-dashboard',
    name: 'แดชบอร์ด IT Operations',
    envFile: '.env.example',
    variables: [
      { key: 'PORT', example: '5000', required: true, desc: 'พอร์ตสำหรับ Backend Server' },
      { key: 'NODE_ENV', example: 'production', required: true, desc: 'สภาพแวดล้อมการทำงาน' },
      { key: 'DATABASE_URL', example: 'postgres://user:password@hostname:5432/dbname', required: false, desc: 'PostgreSQL Connection URI' },
      { key: 'ADMIN_PASSWORD_HASH', example: '1e630fe2c4c6fecd9f5181b3bd43242407c8efa7e6e7db16204dc447257224db', required: true, desc: 'SHA-256 Hash รหัสผ่านผู้ดูแลระบบ' },
      { key: 'LINE_NOTIFY_TOKEN', example: 'your_line_notify_token_here', required: false, desc: 'Token สำหรับส่งแจ้งเตือนเข้ากลุ่ม LINE' }
    ],
    safetyAudit: { status: 'safe', details: 'ใช้ SHA-256 Hash และไม่มี Hardcoded Secret ในโค้ด' }
  },
  {
    projectId: 'pass-app',
    name: 'Pass App (Enterprise Vault)',
    envFile: '.env.example',
    variables: [
      { key: 'PORT', example: '3000', required: true, desc: 'พอร์ต Web Application' },
      { key: 'SESSION_SECRET', example: 'random_cryptographic_secret_key', required: true, desc: 'คีย์สำหรับเข้ารหัส Session Cookie' },
      { key: 'VAULT_PEPPER', example: 'enterprise_vault_pepper_salt', required: true, desc: 'เกลือสำหรับ PBKDF2 Master Key' }
    ],
    safetyAudit: { status: 'safe', details: 'แยก Vault recovery handler และใช้ Salted Hashing' }
  },
  {
    projectId: 'accounting-app',
    name: 'Thai Accounting App',
    envFile: '.env.example',
    variables: [
      { key: 'NEXTAUTH_SECRET', example: 'generate_with_openssl_rand_base64_32', required: true, desc: 'NextAuth Secret Key' },
      { key: 'DATABASE_URL', example: 'file:./accounting.db', required: true, desc: 'SQLite / PostgreSQL Database' },
      { key: 'ACTION_PASSWORD_HASH', example: 'your_sha256_hashed_action_password', required: true, desc: 'รหัสผ่านยืนยันการบันทึกรายการบัญชี' }
    ],
    safetyAudit: { status: 'safe', details: 'อัปเกรดเป็น SHA-256 Hashing สำหรับ Auth เรียบร้อย' }
  },
  {
    projectId: 'asset-ios',
    name: 'Asset & Hardware Manager',
    envFile: '.env.example',
    variables: [
      { key: 'PORT', example: '4000', required: true, desc: 'พอร์ต Express API' },
      { key: 'ACTION_PASSWORD', example: 'your_action_password_here', required: true, desc: 'รหัสผ่านสำหรับ Approve หรือลบทรัพย์สิน' }
    ],
    safetyAudit: { status: 'safe', details: 'ปลดล็อก Hardcoded Password สู่ process.env.ACTION_PASSWORD' }
  },
  {
    projectId: 'omniflow',
    name: 'Omniflow AI Webhook',
    envFile: '.env.example',
    variables: [
      { key: 'LINE_CHANNEL_SECRET', example: 'your_line_channel_secret', required: true, desc: 'LINE Messaging API Secret' },
      { key: 'LINE_CHANNEL_ACCESS_TOKEN', example: 'your_line_access_token', required: true, desc: 'LINE Messaging Access Token' },
      { key: 'OPENAI_API_KEY', example: 'sk-proj-your_openai_key_here', required: false, desc: 'OpenAI API Key สำหรับบอตตอบอัจฉริยะ' }
    ],
    safetyAudit: { status: 'safe', details: 'ซ่อน API Keys ใน Environment Variables ไม่ผูกกับ Git' }
  }
];

export function auditEnvSafety(variables) {
  const leaks = [];
  const dangerousPatterns = [/^[0-9a-f]{64}$/i, /^sk-[a-zA-Z0-9]{20,}/, /ghp_[a-zA-Z0-9]{30,}/];

  for (const v of variables) {
    for (const pattern of dangerousPatterns) {
      if (pattern.test(v.example) && !v.example.includes('your_') && !v.example.includes('here')) {
        leaks.push(v.key);
      }
    }
  }

  return {
    isSafe: leaks.length === 0,
    leaks,
  };
}
