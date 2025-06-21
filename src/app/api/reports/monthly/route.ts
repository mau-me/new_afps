'use server';

import { v2 as cloudinary } from 'cloudinary';
import connectToDatabase from '@/lib/db';
import Transaction from '@/lib/models/Transaction';
import { revalidatePath } from 'next/cache';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function createTransaction(formData) {
  await connectToDatabase();

  const file = formData.get('receipt');
  let receiptUrl = null;

  if (file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) reject(error);
        resolve(result);
      });
      stream.end(file.buffer);
    });
    receiptUrl = uploadResult.secure_url;
  }

  const transaction = await Transaction.create({
    type: formData.get('type'),
    category: formData.get('category'),
    value: formData.get('value'),
    date: formData.get('date'),
    description: formData.get('description'),
    receiptUrl,
  });

  revalidatePath('/transactions');
  return { success: true, transactionId: transaction._id };
}
