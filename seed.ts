import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const configPath = './firebase-applet-config.json';
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
    price: 14999,
    discountPrice: 12999,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    stock: 45,
    rating: 4.8,
    reviewCount: 124,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Minimalist Leather Watch",
    description: "Classic design with genuine leather strap and water resistance.",
    price: 4999,
    discountPrice: 3499,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    stock: 12,
    rating: 4.5,
    reviewCount: 89,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Smart Fitness Tracker",
    description: "Track your steps, heart rate, and sleep patterns with this sleek device.",
    price: 3999,
    discountPrice: null,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
    stock: 150,
    rating: 4.2,
    reviewCount: 45,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Organic Cotton T-Shirt",
    description: "Ultra-soft, breathable, and sustainably sourced cotton t-shirt.",
    price: 999,
    discountPrice: 799,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    stock: 200,
    rating: 4.6,
    reviewCount: 210,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic mug, perfect for your morning brew.",
    price: 599,
    discountPrice: null,
    category: "Home & Living",
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    stock: 80,
    rating: 4.9,
    reviewCount: 56,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Yoga Mat with Alignment Lines",
    description: "Eco-friendly, non-slip yoga mat with alignment markers for perfect posture.",
    price: 1999,
    discountPrice: 1499,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
    stock: 30,
    rating: 4.7,
    reviewCount: 112,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Hydrating Face Serum",
    description: "Hyaluronic acid serum for deep hydration and glowing skin.",
    price: 1299,
    discountPrice: 999,
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    stock: 60,
    rating: 4.4,
    reviewCount: 78,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "The Art of Thinking Clearly",
    description: "A fascinating book about cognitive biases and how to avoid them.",
    price: 499,
    discountPrice: null,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    stock: 100,
    rating: 4.8,
    reviewCount: 340,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Wireless Charging Pad",
    description: "Fast wireless charger compatible with all Qi-enabled devices.",
    price: 1499,
    discountPrice: 1199,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&q=80",
    stock: 85,
    rating: 4.3,
    reviewCount: 67,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket with a comfortable, relaxed fit.",
    price: 2999,
    discountPrice: 2499,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
    stock: 25,
    rating: 4.6,
    reviewCount: 92,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Aromatherapy Essential Oil Diffuser",
    description: "Ultrasonic diffuser with 7 color LED lights and auto shut-off.",
    price: 1899,
    discountPrice: 1599,
    category: "Home & Living",
    imageUrl: "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80",
    stock: 40,
    rating: 4.5,
    reviewCount: 150,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Adjustable Dumbbell Set",
    description: "Space-saving adjustable dumbbells for home workouts.",
    price: 8999,
    discountPrice: 7999,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1586401700818-1025f36e9e09?w=800&q=80",
    stock: 15,
    rating: 4.8,
    reviewCount: 205,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Vitamin C Brightening Moisturizer",
    description: "Daily moisturizer to brighten and even out skin tone.",
    price: 899,
    discountPrice: null,
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80",
    stock: 75,
    rating: 4.2,
    reviewCount: 64,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Atomic Habits",
    description: "An easy and proven way to build good habits and break bad ones.",
    price: 599,
    discountPrice: 450,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
    stock: 120,
    rating: 4.9,
    reviewCount: 850,
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Noise Cancelling Earbuds",
    description: "Compact wireless earbuds with active noise cancellation.",
    price: 7999,
    discountPrice: 6499,
    category: "Electronics",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    stock: 50,
    rating: 4.5,
    reviewCount: 180,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Polarized Sunglasses",
    description: "Stylish polarized sunglasses with UV400 protection.",
    price: 1499,
    discountPrice: 999,
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
    stock: 65,
    rating: 4.4,
    reviewCount: 110,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Linen Throw Blanket",
    description: "Lightweight, breathable linen throw for your sofa or bed.",
    price: 2499,
    discountPrice: 1999,
    category: "Home & Living",
    imageUrl: "https://images.unsplash.com/photo-1580828369019-2238f6982ce1?w=800&q=80",
    stock: 35,
    rating: 4.7,
    reviewCount: 42,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Resistance Band Set",
    description: "Set of 5 resistance bands with different tension levels.",
    price: 999,
    discountPrice: 699,
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80",
    stock: 90,
    rating: 4.6,
    reviewCount: 320,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Matte Liquid Lipstick",
    description: "Long-lasting, smudge-proof matte liquid lipstick.",
    price: 799,
    discountPrice: null,
    category: "Beauty",
    imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
    stock: 110,
    rating: 4.3,
    reviewCount: 88,
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    name: "Sapiens: A Brief History of Humankind",
    description: "A groundbreaking narrative of humanity's creation and evolution.",
    price: 699,
    discountPrice: 550,
    category: "Books",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    stock: 80,
    rating: 4.8,
    reviewCount: 620,
    featured: true,
    createdAt: new Date().toISOString()
  }
];

async function run() {
  const productsRef = collection(db, 'products');
  console.log('Seeding database...');
  for (const product of sampleProducts) {
    await addDoc(productsRef, product);
  }
  console.log('Database seeded successfully!');
  process.exit(0);
}

run().catch(console.error);
