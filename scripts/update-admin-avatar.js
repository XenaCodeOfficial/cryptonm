// Load environment variables
require('dotenv').config()

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'nefta@nmcrypto.com'
  const avatar = '/assets/logos/profile-picture-nm.png'

  // Update admin avatar
  const admin = await prisma.admin.update({
    where: { email },
    data: { avatar },
  })

  console.log('✅ Admin avatar updated successfully!')
  console.log('📧 Email:', admin.email)
  console.log('🖼️  Avatar:', admin.avatar)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
