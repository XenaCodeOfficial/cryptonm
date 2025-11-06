// Script para exportar datos de SQLite a JSON
// Ejecutar: node export-sqlite-data.js

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Temporalmente usar SQLite
process.env.DATABASE_URL = 'file:./dev.db'

const prisma = new PrismaClient()

async function exportData() {
  console.log('📦 Exportando datos de SQLite...\n')

  try {
    const data = {
      admins: await prisma.admin.findMany(),
      clients: await prisma.client.findMany(),
      transactions: await prisma.transaction.findMany(),
      clientStats: await prisma.clientStats.findMany(),
      globalStats: await prisma.globalStats.findMany(),
      priceHistory: await prisma.priceHistory.findMany(),
    }

    const counts = {
      admins: data.admins.length,
      clients: data.clients.length,
      transactions: data.transactions.length,
      clientStats: data.clientStats.length,
      globalStats: data.globalStats.length,
      priceHistory: data.priceHistory.length,
    }

    console.log('✅ Datos encontrados:')
    console.log(`   - Admins: ${counts.admins}`)
    console.log(`   - Clients: ${counts.clients}`)
    console.log(`   - Transactions: ${counts.transactions}`)
    console.log(`   - ClientStats: ${counts.clientStats}`)
    console.log(`   - GlobalStats: ${counts.globalStats}`)
    console.log(`   - PriceHistory: ${counts.priceHistory}`)
    console.log()

    const outputFile = path.join(__dirname, 'sqlite-backup.json')
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2))

    console.log(`✅ Datos exportados a: ${outputFile}`)
    console.log()
    console.log('Ahora puedes ejecutar: node import-to-postgres.js')

  } catch (error) {
    console.error('❌ Error al exportar datos:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportData()
