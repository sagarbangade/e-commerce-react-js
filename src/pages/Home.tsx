import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Truck, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/shared/ProductCard';

export const Home = () => {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const trendingProducts = products.slice(0, 8);

  const categories = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80' },
    { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Elevate Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Everyday Style
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-lg">
              Discover our curated collection of premium products designed for modern living. Quality meets aesthetics.
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 rounded-full text-base">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-indigo-600 text-white py-3 overflow-hidden">
        <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-8 text-sm font-medium tracking-wider uppercase">
          <span>🔥 Mega Sale: Up to 50% Off</span>
          <span>•</span>
          <span>🚚 Free Shipping on orders over ₹499</span>
          <span>•</span>
          <span>✨ New Arrivals Every Week</span>
          <span>•</span>
          <span>🔥 Mega Sale: Up to 50% Off</span>
          <span>•</span>
          <span>🚚 Free Shipping on orders over ₹499</span>
        </div>
      </div>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹499' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Clock, title: '24/7 Support', desc: 'Dedicated support' },
              { icon: CreditCard, title: 'Easy Returns', desc: '30-day return policy' },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Shop by Category</h2>
              <p className="text-slate-500">Find exactly what you're looking for</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} to={`/products?category=${cat.name}`}>
                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                    <span className="text-indigo-300 text-sm font-medium flex items-center group-hover:text-white transition-colors">
                      Explore <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Collection</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Handpicked items that represent the best of our catalog.</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
