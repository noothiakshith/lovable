import 'dotenv/config'
import { prisma } from './db.ts'
import bcrypt from 'bcrypt'

async function seed() {
  const email = 'test@example.com'
  const password = 'password123'
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('User already exists:', existingUser.id)
    return
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      id: 'd124a9e0-b23b-4819-89b1-289453f41371' // Use the ID from the logs for quick recovery
    }
  })

  console.log('User seeded successfully:', user.id)
}

seed()
  .catch((e) => {
    console.error('Seeding failed:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
