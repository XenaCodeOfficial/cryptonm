// Load environment variables
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'nefta@nmcrypto.com'
  const password = 'admin123' // CAMBIAR ESTE PASSWORD
  const name = 'Neftali Manzambi'

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('❌ Admin already exists with email:', email)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
      avatar: '/assets/logos/profile-picture-nm.png',
    },
  })

  console.log('✅ Admin created successfully!')
  console.log('📧 Email:', email)
  console.log('🔑 Password:', password)
  console.log('⚠️  IMPORTANT: Change this password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
