// Script para crear usuario admin
// Ejecutar: node create-admin.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👤 Creando usuario admin...\n')

    const email = 'nefta@cryptonm.ch'
    const password = 'NeftaTelcoin2025*'
    const name = 'Nefta'

    // Verificar si ya existe
    const existing = await prisma.admin.findUnique({
      where: { email }
    })

    if (existing) {
      console.log('⚠️  El admin ya existe')
      console.log(`   Email: ${email}`)
      console.log('\n¿Quieres actualizar la contraseña? (Ctrl+C para cancelar)')

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword }
      })

      console.log('✅ Contraseña actualizada')
    } else {
      // Crear nuevo admin
      const hashedPassword = await bcrypt.hash(password, 10)

      const admin = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
        }
      })

      console.log('✅ Admin creado exitosamente!')
      console.log(`   ID: ${admin.id}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Name: ${admin.name}`)
    }

    console.log('\n🎉 Ya puedes hacer login con:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\nAccede a: http://localhost:3000/admin/login')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
