// Seed 100 sample products for testing/demo
// Usage: node backend/scripts/seedProducts.js [count]
// Optionally set COUNT or SEED_FORCE env variables.

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Centralized Product model path
const Product = require('../models/Product');
const User = require('../models/User');

const DESCRIPTIONS = [
  'High quality item perfect for everyday use.',
  'A durable and reliable product loved by customers.',
  'Ergonomic design with premium materials.',
  'Limited edition sample product with great value.',
  'Lightweight, efficient, and built to last.',
  'Crafted with attention to detail and performance.',
  'An essential addition to your collection.',
  'Modern aesthetics combined with practical function.',
  'Test product seeded for development environments.',
  'Versatile item suitable for multiple scenarios.'
];

function randomFrom(arr){return arr[Math.floor(Math.random()*arr.length)];}
function randomPrice(){return +( (Math.random()*90)+10 ).toFixed(2);}
function randomStock(){return Math.floor(Math.random()*100)+1;}

async function ensureSeller(){
  let seller = await User.findOne({ role: 'seller' });
  if(!seller){
    seller = await User.create({
      name: 'Seed Seller',
      email: `seed_seller_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'seller'
    });
    console.log('✅ Created seller user', seller.email);
  } else {
    console.log('ℹ️  Using existing seller', seller.email);
  }
  return seller;
}

async function main(){
  const mongo = process.env.MONGO_URI;
  if(!mongo){
    console.error('❌ MONGO_URI missing. Aborting.');
    process.exit(1);
  }
  await mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected to MongoDB');

  const target = parseInt(process.env.COUNT || process.argv[2] || '100',10);
  const force = !!process.env.SEED_FORCE;
  const existing = await Product.countDocuments();
  if(existing >= target && !force){
    console.log(`ℹ️  Already have ${existing} products (>= target ${target}). Skipping (set SEED_FORCE=1 to override).`);
    await mongoose.disconnect();
    return;
  }

  const seller = await ensureSeller();

  if(force){
    await Product.deleteMany({});
    console.log('⚠️  Existing products cleared due to SEED_FORCE');
  }

  const toCreate = target - (force ? 0 : existing);
  if(toCreate <=0){
    console.log('ℹ️  Nothing to create.');
    await mongoose.disconnect();
    return;
  }

  console.log(`🚀 Creating ${toCreate} sample products...`);
  const batch = [];
  for(let i=1;i<=toCreate;i++){
    batch.push({
      name: `Sample Product #${existing + i}`,
      price: randomPrice(),
      description: randomFrom(DESCRIPTIONS),
      pictures: ['/uploads/sample.png'],
      stock: randomStock(),
      seller: seller._id
    });
  }
  await Product.insertMany(batch);
  const finalCount = await Product.countDocuments();
  console.log(`🎉 Seed complete. Total products: ${finalCount}`);
  await mongoose.disconnect();
}

main().catch(e=>{console.error('❌ Seed error', e); process.exit(1);});
