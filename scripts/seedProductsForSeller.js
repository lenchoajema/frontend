const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/productModel');
const User = require('../models/User');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function randFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

async function main(){
  const MONGO = process.env.MONGO_URI;
  if(!MONGO){
    console.error('❌ MONGO_URI not set.');
    process.exit(1);
  }
  await mongoose.connect(MONGO, {});
  console.log('✅ Connected to MongoDB');

  const sellerEmail = process.env.SELLER_EMAIL || process.argv[2] || 'seller123@example.com';
  const count = parseInt(process.env.COUNT || process.argv[3] || '100', 10);
  const force = process.env.FORCE === 'true' || process.argv.includes('--force');

  let seller = await User.findOne({ email: sellerEmail });
  if(!seller){
    console.log(`ℹ️  Seller ${sellerEmail} not found. Creating.`);
    seller = await User.create({ name: 'Seeded Seller', email: sellerEmail, password: 'Password123!', role: 'seller' });
  } else {
    console.log('ℹ️  Using seller:', seller.email);
  }

  // Gather image files
  let files = [];
  try{
    files = fs.readdirSync(UPLOAD_DIR).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
  }catch(e){
    console.warn('⚠️  Could not read uploads directory:', UPLOAD_DIR, e.message);
  }
  if(files.length === 0){
    console.warn('⚠️  No image files found in uploads. Products will reference a placeholder.');
    files = ['sample.png'];
  }

  if(force){
    const del = await Product.deleteMany({ seller: seller._id });
    console.log(`⚠️  Deleted ${del.deletedCount} existing products for seller ${seller.email}`);
  }

  const existing = await Product.countDocuments({ seller: seller._id });
  const toCreate = Math.max(0, count - existing);
  console.log(`🚀 Creating ${toCreate} products for ${seller.email} (target ${count}, existing ${existing})`);

  const DESCRIPTIONS = [
    'High quality item perfect for everyday use.',
    'A durable and reliable product loved by customers.',
    'Ergonomic design with premium materials.',
    'Limited edition sample product with great value.',
    'Lightweight, efficient, and built to last.',
  ];

  const batch = [];
  for(let i=1;i<=toCreate;i++){
    // pick 5 distinct images (or repeat if not enough)
    const pics = [];
    const picked = new Set();
    for(let j=0;j<5;j++){
      if(files.length === 0) { pics.push('/uploads/sample.png'); continue; }
      let attempt = 0;
      let f;
      do{ f = randFrom(files); attempt++; } while(picked.has(f) && attempt < 10);
      picked.add(f);
      pics.push(`/uploads/${f}`);
    }

    batch.push({
      name: `Seller ${seller.email} Product #${existing + i}`,
      price: +( (Math.random()*90)+10 ).toFixed(2),
      description: DESCRIPTIONS[Math.floor(Math.random()*DESCRIPTIONS.length)],
      pictures: pics,
      stock: Math.floor(Math.random()*100)+1,
      seller: seller._id
    });
  }

  if(batch.length>0){
    await Product.insertMany(batch);
    console.log(`🎉 Inserted ${batch.length} products.`);
  } else {
    console.log('ℹ️  No new products to insert.');
  }

  const final = await Product.countDocuments({ seller: seller._id });
  console.log(`✅ Seller ${seller.email} now has ${final} products.`);
  await mongoose.disconnect();
}

if(require.main === module) main().catch(e=>{ console.error('❌ Seed error', e); process.exit(1); });
