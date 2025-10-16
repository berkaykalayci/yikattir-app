const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const owner = await prisma.user.upsert({
    where: { email: 'owner@yikattir.com' },
    update: {},
    create: { email: 'owner@yikattir.com', name: 'Owner', role: 'BUSINESS' }
  });

  const biz1 = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: 'Berber Ahmet',
      type: 'Berber',
      city: 'İstanbul',
      district: 'Kadıköy',
      address: 'Örnek Mah. No:1',
      rating: 4.6,
      services: { create: [
        { name: 'Saç Kesimi', price: 120, durationMin: 30 },
        { name: 'Sakal Tıraşı', price: 80, durationMin: 20 }
      ]}
    },
    include: { services: true }
  });

  const biz2 = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: 'Güzellik Merkezi Ayşe',
      type: 'Güzellik',
      city: 'Ankara',
      district: 'Çankaya',
      address: 'Deneme Cad. No:5',
      rating: 4.5,
      services: { create: [
        { name: 'Manikür', price: 150, durationMin: 45 },
        { name: 'Cilt Bakımı', price: 300, durationMin: 90 }
      ]}
    },
    include: { services: true }
  });

  console.log('Seed ok:', { biz1: biz1.id, biz2: biz2.id });
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
