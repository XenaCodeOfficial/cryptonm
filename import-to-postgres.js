// Script para importar datos a PostgreSQL
// Ejecutar: node import-to-postgres.js

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function importData() {
  console.log('📥 Importando datos a PostgreSQL...\n')

  try {
    const backupFile = path.join(__dirname, 'sqlite-backup.json')

    if (!fs.existsSync(backupFile)) {
      console.error('❌ No se encontró sqlite-backup.json')
      console.log('Primero ejecuta: node export-sqlite-data.js')
      process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'))

    console.log('📊 Datos a importar:')
    console.log(`   - Admins: ${data.admins.length}`)
    console.log(`   - Clients: ${data.clients.length}`)
    console.log(`   - Transactions: ${data.transactions.length}`)
    console.log(`   - ClientStats: ${data.clientStats.length}`)
    console.log(`   - GlobalStats: ${data.globalStats.length}`)
    console.log(`   - PriceHistory: ${data.priceHistory.length}`)
    console.log()

    // Importar en orden (respetando relaciones)

    console.log('⏳ Importando Admins...')
    for (const admin of data.admins) {
      await prisma.admin.create({ data: admin })
    }
    console.log('✅ Admins importados')

    console.log('⏳ Importando Clients...')
    for (const client of data.clients) {
      await prisma.client.create({ data: client })
    }
    console.log('✅ Clients importados')

    console.log('⏳ Importando Transactions...')
    for (const transaction of data.transactions) {
      await prisma.transaction.create({ data: transaction })
    }
    console.log('✅ Transactions importadas')

    console.log('⏳ Importando ClientStats...')
    for (const stats of data.clientStats) {
      await prisma.clientStats.create({ data: stats })
    }
    console.log('✅ ClientStats importados')

    console.log('⏳ Importando GlobalStats...')
    for (const stats of data.globalStats) {
      await prisma.globalStats.create({ data: stats })
    }
    console.log('✅ GlobalStats importados')

    console.log('⏳ Importando PriceHistory...')
    for (const price of data.priceHistory) {
      await prisma.priceHistory.create({ data: price })
    }
    console.log('✅ PriceHistory importado')

    console.log()
    console.log('🎉 IMPORTACIÓN COMPLETADA CON ÉXITO!')
    console.log()
    console.log('Tu base de datos PostgreSQL ya tiene todos los datos.')

  } catch (error) {
    console.error('❌ Error al importar datos:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
