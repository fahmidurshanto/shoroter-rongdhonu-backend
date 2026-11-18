const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./models/user.model');
const Post = require('./models/post.model');

let memoryServer = null;

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (process.env.USE_MEMORY_DB === 'true' || !uri) {
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log('Using in-memory MongoDB (no Atlas needed)');
  }

  await mongoose.connect(uri);
  console.log('MongoDB database connection established successfully');

  if (process.env.USE_MEMORY_DB === 'true') {
    // Seed admin demo user
    const email = 'demo@example.com';
    const exists = await User.findOne({ email });
    if (!exists) {
      await new User({ email, password: 'secret123' }).save();
      console.log(`Seeded demo user: ${email} / secret123`);
    }

    // Seed sample poems for poet Morshed Sakib if database is empty
    const postsCount = await Post.countDocuments();
    if (postsCount === 0) {
      await Post.create([
        {
          title: 'শরতের কাশফুল ও মঞ্চের আলো',
          content: `নীল আকাশের কোলে এক ফালি মেঘ,
কাশবনের ঢেউয়ে লাগে দোলা,
মঞ্চের নেপথ্যে বাজেরে বিউগল,
স্মৃতিরা যে আজও যায় না ভোলা।

আলোর রেখায় খুঁজি তোমার ছায়া,
নাটকের দৃশ্য যেন জীবন্ত এক মায়া।
শরতের স্নিগ্ধ হাওয়ায় ভেসে যায় মন,
কবিতায় বাঁধি তোমায় প্রতিটি ক্ষণ।`,
          contentType: 'poem',
          featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          tags: ['শরতের কবিতা', 'প্রেম', 'প্রকৃতি', 'মঞ্চ'],
          isDraft: false,
          isFeatured: true,
          likesCount: 12,
          viewsCount: 45,
          publishedAt: new Date(Date.now() - 86400000 * 2),
        },
        {
          title: 'তৃতীয় ঘণ্টার নীরবতা',
          content: `নাট্যকলা বিভাগের মহড়াকক্ষে আলো নিভে আসে।
দর্শকের আসনগুলো নীরব, কিন্তু শূন্যতায় ভরা নয়—
প্রতিটি শূন্য কাঠে লেগে আছে করতালি আর দীর্ঘশ্বাসের প্রতিধ্বনি।

চরিত্র থেকে যখন রক্ত-মাংসের মানুষে ফিরে আসি,
তখন বুকের ভেতর অদ্ভুত এক একাকিত্ব জেগে ওঠে।
মঞ্চ হয়তো শুধুই কাঠের পাটাতন,
কিন্তু জীবন? সে তো অনন্ত এক মহড়া।`,
          contentType: 'theatre',
          featuredImage: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
          tags: ['নাট্যভাবনা', 'রাবি নাট্যকলা', 'মঞ্চের গল্প', 'জীবনদর্শন'],
          isDraft: false,
          isFeatured: false,
          likesCount: 18,
          viewsCount: 62,
          publishedAt: new Date(Date.now() - 86400000),
        },
        {
          title: 'পদ্মাপাড়ের একাকী কথন',
          content: `টি-বাঁধে বসে যখন সূর্যাস্ত দেখি,
পদ্মার বুক চিরে বাতাস এসে কানে কানে বলে—
সব নাটক শেষ হয় না,
কিছু দৃশ্য শুধু অপলক চেয়ে থাকার জন্যই সৃষ্টি হয়।

হৃদয়ের ঘাটে নোঙর ফেলেছি বহুবার,
তবু এই নদী আমায় বারবার ডাক দেয়,
কবিতার ছন্দে ভাসিয়ে নেয় একাকী মন।`,
          contentType: 'poem',
          featuredImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
          tags: ['পদ্মা', 'রাজশাহী', 'স্মৃতি', 'একাকিত্ব'],
          isDraft: false,
          isFeatured: false,
          likesCount: 24,
          viewsCount: 89,
          publishedAt: new Date(),
        },
      ]);
      console.log('Seeded initial poems for Morshed Sakib');
    }
  }
}

module.exports = connectDB;
