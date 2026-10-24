import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Flame,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  ArrowRightCircle,
  Headphones,
  Watch,
  Layers,
  BatteryCharging,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/common/ProductCard';
import Meta from '../components/common/Meta';
import Loader from '../components/Loader';
import CategoryIcon from '../components/common/CategoryIcon';
import { useFilterStore } from '../store/useStore';
import { useDeviceStore } from '../store/useDeviceStore';

export const Home = () => {
  const navigate = useNavigate();
  const { setCategory, setSelectedDevice } = useFilterStore();
  const { selectedDevice, openModal: openDeviceModal } = useDeviceStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = heroBanners.length > 0 ? heroBanners.length : 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handlePrevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Phone Selector State (Dynamic DB-driven)
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('');
  const [phoneCatalog, setPhoneCatalog] = useState({
    Apple: [
      'iPhone 16 Pro Max',
      'iPhone 16 Pro',
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15',
      'iPhone 14',
    ],
    Samsung: [
      'Samsung Galaxy S24 Ultra',
      'Samsung Galaxy S24',
      'Samsung Galaxy S23 Ultra',
      'Samsung Galaxy Z Flip 5',
    ],
    OnePlus: [
      'OnePlus 12',
      'OnePlus 12R',
      'OnePlus 11',
      'OnePlus Nord CE 4',
    ],
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, devRes, bannerRes] = await Promise.allSettled([
          axiosInstance.get('/products?limit=24'),
          axiosInstance.get('/products/categories'),
          axiosInstance.get('/devices'),
          axiosInstance.get('/banners?type=HERO_BANNER'),
        ]);

        if (prodRes.status === 'fulfilled') {
          const list = prodRes.value.data.data?.products || [];
          setProducts(list);
        }

        if (catRes.status === 'fulfilled') {
          setCategories(catRes.value.data.data || []);
        }

        if (bannerRes.status === 'fulfilled') {
          const bList = bannerRes.value.data?.data || [];
          setHeroBanners(bList);
        }

        if (devRes.status === 'fulfilled' && devRes.value.data?.data?.length > 0) {
          const catalogMap = {};
          devRes.value.data.data.forEach((d) => {
            const b = d.brand || 'Other';
            if (!catalogMap[b]) catalogMap[b] = [];
            catalogMap[b].push(d.modelName);
          });
          setPhoneCatalog(catalogMap);
          const firstBrand = Object.keys(catalogMap)[0];
          if (firstBrand) {
            setSelectedBrand(firstBrand);
            setSelectedModel(catalogMap[firstBrand][0] || '');
          }
        }
      } catch (err) {
        console.error('Home data load:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleDeviceSearch = (e) => {
    e.preventDefault();
    if (selectedModel) {
      setSelectedDevice(selectedModel);
      navigate(`/shop?device=${encodeURIComponent(selectedModel)}`);
    }
  };

  // Feature priority sequence
  const screenshotOrder = [
    'chhotabhai frosted magsafe shockproof case',
    'chhotabhai 9h diamond privacy tempered glass',
    'chhotabhai 65w gan iii ultra fast wall charger',
    'chhotabhai 100w kevlar braided type-c to type-c cable',
    'chhotabhai sonic pods pro wireless earbuds',
    'chhotabhai sapphire individual camera lens protector',
    'chhotabhai n52 magsafe 15w wireless car mount',
  ];

  // Dynamic Crazy Deals: Checked in Admin panel, fallback to screenshotOrder
  const adminCrazyDeals = products.filter((p) => p.isCrazyDeal);
  const crazyDeals =
    adminCrazyDeals.length > 0
      ? adminCrazyDeals.slice(0, 8)
      : [...products]
          .sort((a, b) => {
            const aIdx = screenshotOrder.indexOf((a.title || '').toLowerCase());
            const bIdx = screenshotOrder.indexOf((b.title || '').toLowerCase());
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return 0;
          })
          .slice(0, 6);

  const displayDeals = crazyDeals;

  const [topDealTab, setTopDealTab] = useState('All Deals');

  const topDealTabs = [
    { label: 'All Deals', key: 'All Deals' },
    { label: 'True Wireless Earbuds', key: 'tws-earbuds' },
    { label: 'Smartwatches', key: 'smartwatches' },
    { label: 'Speakers And Soundbars', key: 'soundbars' },
    { label: 'Neckbands And Headphones', key: 'wireless-headphones' },
    { label: 'Drones & Gadgets', key: 'camera-drones' },
  ];

  const topDealsOrder = [
    'chhotabhai airdopes 161',
    'chhotabhai storm call 3',
    'chhotabhai nirvana ion',
    'chhotabhai rockerz 412',
    'chhotabhai aavante bar 480',
    'chhotabhai falcon 4k gps drone',
    'chhotabhai energyshroom pb300 pro',
    'chhotabhai sonic pods pro wireless earbuds',
  ];

  // Dynamic Top Deals: Filtered by category tab and isTopDeal from admin
  const categoryFiltered = products.filter((p) => {
    if (topDealTab === 'All Deals') return true;
    const catSlug = typeof p.category === 'object' ? p.category?.slug : p.category;
    if (topDealTab === 'soundbars') {
      return catSlug === 'soundbars' || catSlug === 'wireless-speakers';
    }
    if (topDealTab === 'wireless-headphones') {
      return catSlug === 'wireless-headphones' || catSlug === 'wireless-neckbands';
    }
    return catSlug === topDealTab;
  });

  const markedTopDeals = categoryFiltered.filter((p) => p.isTopDeal);
  const topDeals =
    markedTopDeals.length > 0
      ? markedTopDeals.slice(0, 6)
      : categoryFiltered
          .sort((a, b) => {
            const aIdx = topDealsOrder.indexOf((a.title || '').toLowerCase());
            const bIdx = topDealsOrder.indexOf((b.title || '').toLowerCase());
            if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
            if (aIdx !== -1) return -1;
            if (bIdx !== -1) return 1;
            return 0;
          })
          .slice(0, 6);
  const shopCategories = [
    { name: 'True Wireless Earbuds', slug: 'tws-earbuds' },
    { name: 'Smart Watches', slug: 'smartwatches' },
    { name: 'Wireless Neckbands', slug: 'wireless-neckbands' },
    { name: 'Wireless Headphones', slug: 'wireless-headphones' },
    { name: 'Wireless Speakers', slug: 'wireless-speakers' },
    { name: '4K Camera Drones', slug: 'camera-drones' },
    { name: 'Soundbars', slug: 'soundbars' },
    { name: 'Dashcams', slug: 'dashcams' },
    { name: 'Projectors', slug: 'projectors' },
    { name: 'Back Cases', slug: 'back-cases' },
    { name: 'Tempered Glass', slug: 'tempered-glass' },
    { name: 'Fast Wall Chargers', slug: 'fast-wall-chargers' },
    { name: 'Braided Data Cables', slug: 'braided-data-cables' },
    { name: 'Camera Lens Protectors', slug: 'camera-lens-protectors' },
    { name: 'MagSafe Mounts', slug: 'magsafe-mounts' },
  ];

  const categoryIcons = {
    'tws-earbuds': Headphones,
    'smartwatches': Watch,
    'wireless-neckbands': Headphones,
    'wireless-headphones': Headphones,
    'wireless-speakers': Sparkles,
    'camera-drones': Sparkles,
    'soundbars': Headphones,
    'dashcams': Sparkles,
    'projectors': Sparkles,
    'back-cases': Smartphone,
    'tempered-glass': Layers,
    'fast-wall-chargers': BatteryCharging,
    'braided-data-cables': Zap,
    'camera-lens-protectors': ShieldCheck,
    'magsafe-mounts': Sparkles,
  };

  return (
    <div className="pb-20 bg-white text-slate-900 font-sans">
      <Meta
        title="ChhotaBhai Lifestyle | India's #1 Earphones, Smartwatches & Accessories"
        description="Shop India's leading wireless earbuds, neckbands, smartwatches, speakers, and mobile accessories with extra festive discounts."
        keywords="ChhotaBhai earphones, ChhotaBhai airdopes, wireless earbuds, smartwatches, mobile accessories, festive sale"
      />

      {/* 1. FESTIVE HERO CAROUSEL BANNER (Full-bleed edge-to-edge width matching boAt screenshot) */}
      <section className="w-full relative overflow-hidden bg-[#600810]">
        <div className="relative w-full group">
          {/* DYNAMIC ADMIN BANNERS OR STATIC FALLBACK */}
          {heroBanners.length > 0 ? (
            (() => {
              const activeBanner = heroBanners[currentSlide % heroBanners.length];
              if (!activeBanner) return null;
              const isFullImage = activeBanner.bannerMode === 'FULL_IMAGE';

              if (isFullImage) {
                return (
                  <div className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] flex items-center justify-center overflow-hidden bg-black select-none animate-in fade-in duration-500">
                    <Link to={activeBanner.redirectUrl || '/shop'} className="w-full h-full block">
                      <img
                        src={activeBanner.imageUrl}
                        alt={activeBanner.title || 'ChhotaBhai Banner'}
                        className="w-full h-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] object-cover object-center"
                      />
                    </Link>
                  </div>
                );
              }

              return (
                <div className="relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] flex items-center overflow-hidden bg-black select-none animate-in fade-in duration-500">
                  <img
                    src={activeBanner.imageUrl}
                    alt={activeBanner.title || 'ChhotaBhai Offer'}
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.70]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

                  <div className="cb-container w-full py-12 sm:py-16 md:py-20 flex flex-col items-start justify-center gap-6 relative z-10 text-white">
                    <div className="max-w-xl space-y-4">
                      <div className="inline-flex items-center gap-2 bg-[#e11938] text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Exclusive Showcase</span>
                      </div>
                      {activeBanner.title && (
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
                          {activeBanner.title}
                        </h1>
                      )}
                      {activeBanner.subtitle && (
                        <p className="text-sm sm:text-base md:text-lg font-medium text-slate-200 max-w-lg drop-shadow">
                          {activeBanner.subtitle}
                        </p>
                      )}
                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          to={activeBanner.redirectUrl || '/shop'}
                          className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#e11938] hover:bg-[#c0132e] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <span>{activeBanner.ctaText || 'Shop Now'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <>
              {/* FALLBACK SLIDE 0: CELEBRATE THE MOMENTS */}
              {currentSlide === 0 && (
                <div className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] bg-gradient-to-r from-[#6e0712] via-[#8c0e1c] to-[#59050d] text-white flex items-center overflow-hidden select-none animate-in fade-in duration-500">
                  <svg
                    className="absolute top-0 left-0 right-0 w-full h-10 sm:h-16 pointer-events-none opacity-85 z-10"
                    viewBox="0 0 1000 60"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,10 Q250,35 500,10 Q750,35 1000,10"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                    />
                    {[60, 150, 240, 330, 420, 510, 600, 690, 780, 870, 950].map((cx, i) => (
                      <g key={i}>
                        <line x1={cx} y1="12" x2={cx} y2="28" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.6" />
                        <circle cx={cx} cy="30" r="5" fill="#fef08a" />
                        <circle cx={cx} cy="30" r="9" fill="#f59e0b" fillOpacity="0.35" filter="blur(2px)" />
                      </g>
                    ))}
                  </svg>

                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                  <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -left-20 -top-20 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

                  <div className="cb-container w-full py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative z-10">
                    <div className="max-w-xl space-y-5 text-center md:text-left pt-2 md:pt-0">
                      <div className="inline-flex items-center gap-2.5 bg-black/40 border border-amber-400/50 rounded-xl px-4 py-2 backdrop-blur-xs shadow-sm">
                        <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="leading-tight text-left">
                          <span className="block text-xs font-black uppercase tracking-widest text-amber-300">
                            Grand Festive Sale
                          </span>
                          <span className="block text-[10px] sm:text-[11px] font-bold text-amber-100/90 tracking-wider">
                            8th Oct – 15th Oct
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
                          Celebrate The Moments, <br />
                          <span className="text-amber-200">Make Them Personal</span>
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg font-semibold text-rose-100/90 pt-1">
                          A Special Gift For Every Festive
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-center md:justify-start gap-2">
                        <span className="text-lg sm:text-2xl font-black text-amber-300 tracking-wide drop-shadow-sm flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                          Custom Engraving @ ₹29
                        </span>
                      </div>

                      <div className="pt-2 flex items-center justify-center md:justify-start gap-3.5 flex-wrap">
                        <Link
                          to="/shop"
                          className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#fff8e7] hover:bg-white text-[#730814] font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <span>Shop Now</span>
                          <ArrowRight className="w-4 h-4 text-[#730814]" />
                        </Link>
                        <button
                          type="button"
                          onClick={openDeviceModal}
                          className="px-6 sm:px-7 py-3.5 sm:py-4 bg-black/35 hover:bg-black/50 border border-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all backdrop-blur-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4 text-amber-300" />
                          <span>Personalise Gear</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center justify-center flex-shrink-0">
                      <div className="relative group/showcase">
                        <img
                          src="/festive-banner-chhotabhai.jpg"
                          alt="ChhotaBhai Personalized Engraved Audio & Power Accessories"
                          className="w-[340px] sm:w-[460px] lg:w-[540px] xl:w-[580px] max-h-[440px] object-cover rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-300/20 transition-transform duration-700 group-hover/showcase:scale-102"
                        />
                        <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md border border-amber-400/40 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> STUTI ✦ Engraved Earbuds
                        </div>
                        <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-md border border-amber-400/40 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-sm">
                          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> YOGINI 20000mAh PowerBank
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FALLBACK SLIDE 1: EXTRA 50% OFF */}
              {currentSlide === 1 && (
                <div className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] bg-gradient-to-r from-[#8b0f1d] via-[#b51425] to-[#730814] text-white flex items-center overflow-hidden select-none animate-in fade-in duration-500">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="cb-container w-full py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl space-y-5 text-center md:text-left">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black uppercase tracking-wider">
                        Festive Mega Drop
                      </span>
                      <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-none drop-shadow-sm">
                        Extra 50% OFF
                      </h2>
                      <h3 className="text-xl sm:text-2xl font-black text-amber-200 uppercase tracking-wide">
                        GET BEST OF CHHOTABHAI AT EXTRA 50% OFF
                      </h3>
                      <div className="inline-block px-5 py-2.5 rounded-full bg-black/40 border border-white/30 text-white font-mono text-xs sm:text-sm font-black tracking-widest uppercase">
                        USE CODE : DROP50
                      </div>
                      <div className="pt-2">
                        <Link
                          to="/shop"
                          className="inline-flex items-center px-8 sm:px-10 py-3.5 sm:py-4 bg-white hover:bg-slate-100 text-[#8b0f1d] font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md"
                        >
                          Claim 50% Off Now
                        </Link>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center justify-center">
                      <div className="relative flex items-center">
                        <img
                          src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80"
                          alt="ChhotaBhai Headphones"
                          className="w-36 sm:w-52 md:w-60 h-36 sm:h-52 md:h-60 object-contain drop-shadow-2xl rounded-2xl mix-blend-screen"
                        />
                        <img
                          src="https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&auto=format&fit=crop&q=80"
                          alt="ChhotaBhai Earbuds"
                          className="w-40 sm:w-60 md:w-72 h-40 sm:h-60 md:h-72 object-contain drop-shadow-2xl -ml-8 z-10 rounded-2xl mix-blend-screen"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FALLBACK SLIDE 2: 65W GaN CHARGING */}
              {currentSlide === 2 && (
                <div className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[660px] xl:min-h-[700px] bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center overflow-hidden select-none animate-in fade-in duration-500">
                  <div className="cb-container w-full py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl space-y-5 text-center md:text-left">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider">
                        HyperSpeed & Military Protection
                      </span>
                      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
                        Next-Gen 65W GaN <br />
                        <span className="text-[#e11938]">& MagSafe Armor</span>
                      </h2>
                      <p className="text-sm sm:text-base md:text-lg text-slate-300">
                        Engineered precision covers, 9H privacy glass, and ultra-fast GaN chargers for Apple iPhone 16/15, Samsung Galaxy S24, and OnePlus.
                      </p>
                      <div className="pt-2 flex items-center justify-center md:justify-start gap-3.5 flex-wrap">
                        <Link
                          to="/shop?category=fast-wall-chargers"
                          className="px-7 sm:px-8 py-3.5 sm:py-4 bg-[#e11938] hover:bg-[#c0132e] text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md"
                        >
                          Shop 65W Chargers
                        </Link>
                        <Link
                          to="/shop?category=back-cases"
                          className="px-6 sm:px-7 py-3.5 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all border border-slate-700"
                        >
                          Explore Cases
                        </Link>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=480&auto=format&fit=crop&q=80"
                        alt="ChhotaBhai High Performance Accessories"
                        className="w-60 sm:w-80 md:w-96 lg:w-[440px] max-h-[440px] object-contain drop-shadow-2xl rounded-2xl mix-blend-screen"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CAROUSEL LEFT ARROW BUTTON */}
          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-110 active:scale-95"
            title="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* CAROUSEL RIGHT ARROW BUTTON */}
          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 w-11 sm:w-12 h-11 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all z-20 cursor-pointer shadow-lg hover:scale-110 active:scale-95"
            title="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* CAROUSEL PAGINATION DOTS */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-black/35 backdrop-blur-xs px-3.5 py-1.5 rounded-full">
            {Array.from({ length: totalSlides }).map((_, dotIdx) => {
              const isActive = (currentSlide % totalSlides) === dotIdx;
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentSlide(dotIdx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-7 sm:w-9 h-2 bg-amber-300 shadow-xs'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. TRUST & VALUE STRIP (Attached directly flush to the banner, edge-to-edge, matching boAt reference) */}
      <section className="w-full bg-[#f2f6fa] border-b border-slate-200/80 py-3.5 sm:py-4 select-none">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-4 sm:gap-6 lg:gap-8 w-full">
            {/* 1. 12+3 Months Warranty */}
            <div className="flex items-center gap-3 sm:gap-3.5 justify-start">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-9 h-10 sm:w-10 sm:h-11 relative flex items-center justify-center">
                  <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-2xs" fill="none">
                    <path
                      d="M20 2L36 7.5V20.5C36 30.5 29.2 39.5 20 44C10.8 39.5 4 30.5 4 20.5V7.5L20 2Z"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M20 5L33 9.5V20C33 28.5 27.5 36.5 20 40.5C12.5 36.5 7 28.5 7 20V9.5L20 5Z"
                      fill="#1e293b"
                    />
                    <text x="20" y="21" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">
                      25%
                    </text>
                    <rect x="9" y="27" width="22" height="7" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
                    <text x="20" y="32.5" textAnchor="middle" fill="#f8fafc" fontSize="5.5" fontWeight="900" letterSpacing="0.8" fontFamily="sans-serif">
                      EXTRA
                    </text>
                  </svg>
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] sm:text-[14.5px] font-bold text-slate-900 tracking-tight">12+3 Months</div>
                <div className="text-xs sm:text-[12.5px] font-normal text-slate-700 flex items-center gap-1">
                  <span>Warranty</span>
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-400 text-[9px] font-bold text-slate-600 leading-none">
                    i
                  </span>
                </div>
              </div>
            </div>

            {/* 2. GST Billing */}
            <div className="flex items-center gap-3 sm:gap-3.5 justify-start md:justify-center">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-9 h-10 sm:w-10 sm:h-11 relative flex items-center justify-center">
                  <svg viewBox="0 0 42 46" className="w-full h-full drop-shadow-2xs" fill="none">
                    <path
                      d="M8 6C8 4.34 9.34 3 11 3H26L34 11V40C34 41.66 32.66 43 31 43H11C9.34 43 8 41.66 8 40V6Z"
                      fill="#e2e8f0"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />
                    <path d="M26 3V11H34" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" strokeLinejoin="round" />
                    <rect x="14" y="15" width="13" height="2.5" rx="1.25" fill="#475569" />
                    <rect x="14" y="21" width="13" height="2.5" rx="1.25" fill="#475569" />
                    <rect x="18" y="27" width="9" height="2.5" rx="1.25" fill="#475569" />
                    <circle cx="12" cy="33" r="7" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="12" y="36" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="900" fontFamily="sans-serif">
                      %
                    </text>
                  </svg>
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] sm:text-[14.5px] font-bold text-slate-900 tracking-tight">GST</div>
                <div className="text-xs sm:text-[12.5px] font-normal text-slate-700">Billing</div>
              </div>
            </div>

            {/* 3. Free Express Delivery */}
            <div className="flex items-center gap-3 sm:gap-3.5 justify-start md:justify-center">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-10 h-9 sm:w-11 sm:h-10 relative flex items-center justify-center">
                  <svg viewBox="0 0 50 38" className="w-full h-full drop-shadow-2xs" fill="none">
                    <rect x="4" y="8" width="28" height="19" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                    <text x="18" y="21" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="900" fontFamily="sans-serif">
                      FREE
                    </text>
                    <path
                      d="M32 15H40L45 20V27H32V15Z"
                      fill="#334155"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                    <path d="M34 17H39.5L42.5 20.5H34V17Z" fill="#e2e8f0" />
                    <circle cx="13" cy="27" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="39" cy="27" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="13" cy="27" r="1.5" fill="#ffffff" />
                    <circle cx="39" cy="27" r="1.5" fill="#ffffff" />
                  </svg>
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] sm:text-[14.5px] font-bold text-slate-900 tracking-tight">Free Express</div>
                <div className="text-xs sm:text-[12.5px] font-normal text-slate-700">Delivery*</div>
              </div>
            </div>

            {/* 4. 7-day Replacement */}
            <div className="flex items-center gap-3 sm:gap-3.5 justify-start md:justify-end">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-9 h-10 sm:w-10 sm:h-11 relative flex items-center justify-center">
                  <svg viewBox="0 0 42 46" className="w-full h-full drop-shadow-2xs" fill="none">
                    <rect x="6" y="8" width="28" height="28" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
                    <rect x="17" y="8" width="6" height="11" fill="#334155" />
                    <path d="M17 19L20 16L23 19V8H17V19Z" fill="#334155" />
                    <circle cx="30" cy="31" r="7.5" fill="#334155" stroke="#ffffff" strokeWidth="1.5" />
                    <path
                      d="M32.5 28.5C31.8 27.6 30.5 27 29 27C26.8 27 25 28.8 25 31C25 33.2 26.8 35 29 35C30.8 35 32.3 33.8 32.8 32.2"
                      stroke="#ffffff"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path d="M33 26L33 29L30 29" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="leading-tight">
                <div className="text-[13px] sm:text-[14.5px] font-bold text-slate-900 tracking-tight">7-day</div>
                <div className="text-xs sm:text-[12.5px] font-normal text-slate-700">Replacement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CRAZY DEALS SECTION (Exact replica of boAt screenshot) */}
      <section className="cb-container space-y-3.5 mt-5 sm:mt-6">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
              Crazy{' '}
              <span className="relative inline-block border-b-[2.5px] border-[#e11938] pb-0.5">
                Deals
              </span>
            </h2>
          </div>

          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#0066cc] hover:text-[#0052cc] transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRightCircle className="w-4 h-4 text-[#0066cc]" />
          </Link>
        </div>

        {/* Product Deals Grid (Exact 6-column layout matching boAt desktop) */}
        {loading ? (
          <Loader text="Loading Crazy Deals..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5 xl:gap-4">
            {(displayDeals || []).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. TOP DEALS SECTION (Exact boAt replica with Category Filter Tabs & 6 Cards) */}
      <section className="cb-container space-y-3.5 mt-8 sm:mt-10">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Top{' '}
            <span className="relative inline-block border-b-[2.5px] border-[#e11938] pb-0.5">
              Deals
            </span>
          </h2>

          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#0066cc] hover:text-[#0052cc] transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRightCircle className="w-4 h-4 text-[#0066cc]" />
          </Link>
        </div>

        {/* Category Filter Pills (Exact boAt navigation) */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {topDealTabs.map((tab) => {
            const isActive = topDealTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTopDealTab(tab.key)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Top Deals Product Grid */}
        {loading ? (
          <Loader text="Loading Top Deals..." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-3.5 xl:gap-4">
            {(topDeals || []).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. SHOP BY CATEGORIES (Exact boAt 2-line circular avatar showcase) */}
      <section className="cb-container space-y-5 mt-10 sm:mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 tracking-tight">
            Shop by{' '}
            <span className="relative inline-block border-b-[2.5px] border-[#e11938] pb-0.5">
              Categories
            </span>
          </h2>

          <Link
            to="/shop"
            className="text-xs sm:text-sm font-bold text-[#0066cc] hover:text-[#0052cc] transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRightCircle className="w-4 h-4 text-[#0066cc]" />
          </Link>
        </div>

        {/* Strict 2-line layout on desktop: 8 cols = 8 items on Row 1, 7 items on Row 2 */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-y-7 gap-x-2 sm:gap-x-3 md:gap-x-4">
          {shopCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setCategory(cat.slug);
                navigate(`/shop?category=${cat.slug}`);
              }}
              className="group flex flex-col items-center text-center cursor-pointer transition-transform hover:-translate-y-1 select-none"
            >
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full bg-[#f4f6f8] group-hover:bg-[#fee2e2]/60 border border-slate-200/60 group-hover:border-[#e11938] flex items-center justify-center p-2.5 sm:p-3 transition-all shadow-2xs group-hover:shadow-md overflow-hidden">
                <CategoryIcon
                  slug={cat.slug}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="mt-2 sm:mt-2.5 text-[11px] sm:text-[12px] font-bold text-slate-800 group-hover:text-[#e11938] leading-tight text-center max-w-[95px] line-clamp-2 transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. SMARTPHONE COMPATIBILITY / PERSONALISATION FUNNEL */}
      <section className="cb-container pt-2">
        <div className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="text-xs font-black uppercase text-[#e11938] tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> ChhotaBhai Personalisation & Device Studio
            </span>
            <h2 className="text-xl sm:text-3xl font-black uppercase text-slate-900 tracking-tight">
              Find Precision Accessories For <span className="text-[#e11938]">Your Smartphone</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Select your smartphone brand and exact model to view tailor-made MagSafe cases, liquid silicone covers, and 9D privacy tempered glass.
            </p>

            <form onSubmit={handleDeviceSearch} className="space-y-3.5 pt-2">
              {/* Brand Pills */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(phoneCatalog).map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setSelectedBrand(brand);
                      setSelectedModel(phoneCatalog[brand]?.[0] || '');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      selectedBrand === brand
                        ? 'bg-[#1a1a1a] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>

              {/* Model Dropdown & Action CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#e11938] flex-1 shadow-xs"
                >
                  <option value="">Select Phone Model...</option>
                  {phoneCatalog[selectedBrand]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!selectedModel}
                  className="px-5 py-2.5 bg-[#e11938] hover:bg-[#c0132e] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" /> Find Compatible Gear
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
