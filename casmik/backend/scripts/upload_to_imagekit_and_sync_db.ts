import fs from 'fs';
import path from 'path';
import { uploadToImageKit } from '../src/lib/imagekit';
import { getDatabase } from '../src/lib/mongodb';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const full = path.join(dirPath, file);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, arrayOfFiles);
    } else {
      arrayOfFiles.push(full);
    }
  });
  return arrayOfFiles;
}

async function main() {
  console.log('--- 1. Scanning local image assets in public/assets/images ---');
  const baseDir = path.resolve('public/assets/images');
  const allFiles = getAllFiles(baseDir);
  console.log(`Found ${allFiles.length} files to upload to ImageKit.`);

  const urlMap: Record<string, string> = {};

  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const relPath = path.relative(path.resolve('public'), filePath); // e.g. "assets/images/refurbished/sony-a7.jpg"
    const fileName = path.basename(filePath);
    const subDir = path.dirname(relPath).replace(/\\/g, '/'); // e.g. "assets/images/refurbished"
    const folder = `casmik/${subDir.replace('assets/images', '').replace(/^\//, '')}`.replace(/\/$/, '');

    const fileBuffer = fs.readFileSync(filePath);
    console.log(`[${i + 1}/${allFiles.length}] Uploading ${fileName} to folder "${folder}"...`);

    try {
      const res = await uploadToImageKit({
        file: fileBuffer,
        fileName,
        folder,
        useUniqueFileName: false,
      });

      const slashRel = `/${relPath.replace(/\\/g, '/')}`; // e.g. "/assets/images/refurbished/sony-a7.jpg"
      urlMap[slashRel] = res.url;
      urlMap[slashRel.substring(1)] = res.url; // "assets/images/..."
      console.log(`   -> Uploaded: ${res.url}`);
    } catch (err: any) {
      console.error(`   -> Error uploading ${fileName}:`, err?.message || err);
    }
  }

  // Save mapping to JSON file for reference
  fs.writeFileSync(
    path.resolve('src/lib/imagekit_mapping.json'),
    JSON.stringify(urlMap, null, 2),
    'utf-8'
  );
  console.log('ImageKit mapping saved to src/lib/imagekit_mapping.json');

  console.log('\n--- 2. Updating MongoDB collections with ImageKit CDN URLs ---');
  const db = await getDatabase();

  // Helper to replace local URL with ImageKit URL
  const toImageKit = (urlStr: string | undefined): string | undefined => {
    if (!urlStr) return urlStr;
    if (urlMap[urlStr]) return urlMap[urlStr];
    // Check without leading slash
    if (urlMap[urlStr.replace(/^\//, '')]) return urlMap[urlStr.replace(/^\//, '')];
    // Check with leading slash
    if (!urlStr.startsWith('/') && urlMap[`/${urlStr}`]) return urlMap[`/${urlStr}`];
    return urlStr;
  };

  // A. rental_cameras
  const rentalCol = db.collection('rental_cameras');
  const rentalDocs = await rentalCol.find({}).toArray();
  console.log(`Updating ${rentalDocs.length} rental_cameras in MongoDB...`);
  for (const doc of rentalDocs) {
    const newImage = toImageKit(doc.image);
    const newGallery = Array.isArray(doc.gallery) ? doc.gallery.map(toImageKit) : doc.gallery;
    await rentalCol.updateOne(
      { _id: doc._id },
      {
        $set: {
          image: newImage,
          gallery: newGallery,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  // B. device_models
  const modelsCol = db.collection('device_models');
  const modelDocs = await modelsCol.find({}).toArray();
  console.log(`Updating ${modelDocs.length} device_models in MongoDB...`);
  for (const doc of modelDocs) {
    const newImage = toImageKit(doc.image);
    await modelsCol.updateOne(
      { _id: doc._id },
      {
        $set: {
          image: newImage,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  // C. refurbished_products
  const refurbCol = db.collection('refurbished_products');
  const refurbDocs = await refurbCol.find({}).toArray();
  console.log(`Updating ${refurbDocs.length} refurbished_products in MongoDB...`);
  for (const doc of refurbDocs) {
    const newImage = toImageKit(doc.image);
    const newGallery = Array.isArray(doc.gallery) ? doc.gallery.map(toImageKit) : doc.gallery;
    await refurbCol.updateOne(
      { _id: doc._id },
      {
        $set: {
          image: newImage,
          gallery: newGallery,
          updatedAt: new Date().toISOString(),
        },
      }
    );
  }

  console.log('\n--- 3. Verifying updated documents in MongoDB ---');
  const sampleRental = await rentalCol.findOne({});
  console.log('Sample rental_camera after update:');
  console.log(' - Model:', sampleRental?.model);
  console.log(' - Image:', sampleRental?.image);
  console.log(' - Gallery:', sampleRental?.gallery);

  const sampleModel = await modelsCol.findOne({ image: { $regex: '^https://ik.imagekit.io' } });
  console.log('Sample device_model after update:');
  console.log(' - Name:', sampleModel?.name);
  console.log(' - Image:', sampleModel?.image);

  console.log('\n=== ImageKit Upload and MongoDB Sync Complete! ===');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during upload and sync:', err);
  process.exit(1);
});
