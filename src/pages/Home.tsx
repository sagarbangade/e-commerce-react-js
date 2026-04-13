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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-dark-ink-swirling-in-water-4454-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-[#050505]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto"
          >
            <span className="inline-block px-6 py-2 mb-8 text-[10px] font-bold tracking-[0.3em] uppercase glass text-white rounded-full-custom">
              Lumina Collective • 2026
            </span>
            <h1 className="text-6xl md:text-[10vw] font-black text-white leading-[0.85] tracking-[-0.04em] uppercase mb-6 md:mb-8 mt-12 md:mt-0">
              Future <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
                Standard
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-xl mx-auto font-light leading-relaxed">
              Curating the world's most exceptional products for those who demand more than just the ordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Link to="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-indigo-600 hover:text-white px-8 md:px-12 h-14 md:h-16 rounded-full-custom text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-500 group shadow-2xl shadow-white/10">
                  Explore Collection <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/products?delivery=fast" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-yellow-400 text-black hover:bg-yellow-500 px-8 md:px-12 h-14 md:h-16 rounded-full-custom text-xs md:text-sm font-bold uppercase tracking-widest transition-all duration-500 shadow-2xl shadow-yellow-400/20">
                  15 Min Delivery <Clock className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 15 Min Delivery Section */}
      <section className="py-16 md:py-32 bg-[#050505] overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] opacity-50" />
              <h2 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter mb-6 md:mb-8">
                FAST <br/>
                <span className="text-yellow-400">15 MIN</span> <br/>
                DELIVERY
              </h2>
              <p className="text-xl text-slate-400 mb-12 max-w-md font-light">
                Why wait? Get your essentials delivered to your doorstep in under 15 minutes. Available for select pin codes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 md:gap-8">
                <div className="flex items-center gap-4 glass p-4 rounded-2xl">
                  <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
                    <Clock size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Ultra Fast</p>
                    <p className="text-sm text-slate-500">15 min average</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 glass p-4 rounded-2xl">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg shadow-white/10">
                    <Truck size={28} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Zero Cost</p>
                    <p className="text-sm text-slate-500">On orders over ₹999</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square"
            >
              <img 
                src="https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800&q=80" 
                alt="Fast Delivery" 
                className="w-full h-full object-cover rounded-[60px] shadow-2xl border border-white/10"
              />
              <div className="absolute -bottom-8 -right-8 glass-dark text-white p-10 rounded-[40px] shadow-2xl animate-bounce border border-white/10">
                <p className="text-5xl font-black text-yellow-400">15</p>
                <p className="text-xs font-bold uppercase tracking-[0.3em]">Minutes</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories - Brutalist Style */}
      <section className="py-16 md:py-32 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6">
            <div>
              <span className="text-indigo-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-4 block">Collections</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">SHOP BY CATEGORY</h2>
            </div>
            <Link to="/products" className="w-full md:w-auto text-center justify-center text-white hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-xs md:text-sm flex items-center glass px-6 py-3 md:py-4 rounded-full-custom">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link key={idx} to={`/products?category=${cat.name}`}>
                <motion.div 
                  whileHover={{ y: -15, scale: 1.02 }}
                  className="relative h-[500px] group cursor-pointer overflow-hidden rounded-[40px] border border-white/10"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 glass border-t border-white/10">
                    <p className="text-indigo-400 font-mono text-[10px] md:text-xs mb-2 md:mb-3">0{idx + 1}</p>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-32 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6">
            <div>
              <span className="text-indigo-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-4 block">Curated</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">The Spotlight</h2>
            </div>
            <Link to="/products" className="w-full md:w-auto text-center justify-center text-white hover:text-indigo-400 transition-colors font-bold uppercase tracking-widest text-xs md:text-sm flex items-center glass px-6 py-3 md:py-4 rounded-full-custom">
              Shop All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white/5 animate-pulse rounded-[32px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
