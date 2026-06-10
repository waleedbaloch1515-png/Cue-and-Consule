/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Menu, 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  BookOpen, 
  CheckCircle, 
  Info, 
  Star,
  Pocket,
  Flame,
  Award,
  DollarSign,
  ChevronUp
} from 'lucide-react';

// Color palette definitions - Alexander Theme
const THEMES = {
  dark: {
    bg: '#0a0a0f',
    primary: '#c9a84c', // gold
    secondary: '#1a1a2e', // deep navy
    card: '#12121f',
    textPrimary: '#f0e6d3', // warm cream
    textMuted: '#8a7a6a',
    ctaHover: '#e8c56a',
    whatsapp: '#25D366',
    overlay: 'rgba(0, 0, 0, 0.75)'
  },
  light: {
    bg: '#fcfaf2', // luxury warm ivory
    primary: '#8c6812', // deep rich gold for readable elegance on warm off-white
    secondary: '#f2ecd9', // soft cream-gold slate
    card: '#ffffff', // pure white card
    textPrimary: '#1a140b', // deep charcoal bronze
    textMuted: '#715d48', // warm gold-brown slate
    ctaHover: '#b38b25', // hover gold
    whatsapp: '#25D366',
    overlay: 'rgba(252, 250, 242, 0.75)' // lighter luxury overlay
  }
};

const ThemeContext = React.createContext({
  isDarkMode: true,
  colors: THEMES.dark
});


// Rates definition
const RATES: Record<string, number> = {
  snooker: 150,
  billiards: 100,
  century: 600
};

// Custom Hook to trace screen width dynamically to support inline responsive styles
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function App() {
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  // Theme states
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cue_console_theme');
      return saved !== 'light'; // defaults to true (dark mode) unless explicitly set to 'light'
    }
    return true;
  });

  const COLORS = isDarkMode ? THEMES.dark : THEMES.light;

  // Navigation states
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Floating back to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    startTime: '18:00',
    endTime: '19:00',
    duration: 1,
    category: 'snooker' as 'snooker' | 'billiards' | 'century'
  });

  const [total, setTotal] = useState(0);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Initialize Date Input Default
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, date: `${yyyy}-${mm}-${dd}` }));
  }, []);

  // Sync dynamic stylesheet rules for body, html, scrollbars, etc.
  useEffect(() => {
    const existingStyle = document.getElementById('cue-console-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'cue-console-theme-styles';
    style.type = 'text/css';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Georgia:ital,wght@0,400;0,700;1,400&display=swap');
      
      html {
        scroll-behavior: smooth;
        background-color: ${COLORS.bg};
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      body {
        margin: 0;
        padding: 0;
        background-color: ${COLORS.bg};
        color: ${COLORS.textPrimary};
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* Custom premium scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#050508' : '#ebdcb9'};
      }
      ::-webkit-scrollbar-thumb {
        background: ${COLORS.primary};
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${COLORS.ctaHover};
      }

      /* Selection highlights */
      ::selection {
        background-color: ${COLORS.primary};
        color: ${COLORS.bg};
      }

      /* Form input field resets */
      input, select {
        color-scheme: ${isDarkMode ? 'dark' : 'light'};
      }
    `;
    document.head.appendChild(style);

    return () => {
      const el = document.getElementById('cue-console-theme-styles');
      if (el) el.remove();
    };
  }, [isDarkMode, COLORS]);

  // Update duration dynamically based on Start Time and End Time
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      
      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes <= 0) {
        // Assume next day booking if end time is earlier or equal (e.g. 11 PM to 1 AM)
        diffMinutes += 24 * 60;
      }
      
      const hours = diffMinutes / 60;
      const roundedHours = Math.round(hours * 10) / 10;
      
      setFormData(prev => {
        if (prev.duration !== roundedHours) {
          return { ...prev, duration: roundedHours };
        }
        return prev;
      });
    }
  }, [formData.startTime, formData.endTime]);

  // Update total calculation live whenever duration or category shifts
  useEffect(() => {
    const currentRate = RATES[formData.category];
    const calculated = formData.duration * currentRate;
    setTotal(calculated);
    setIsCalculated(false); // Reset confirmation state on values change to enforce "Calculate"
  }, [formData.duration, formData.category]);

  // Track active section to underline in Navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      const sections = ['home', 'booking', 'about', 'gallery'];
      
      for (const sect of sections) {
        const el = document.getElementById(sect);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sect);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form handle changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIsCalculated(false);
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Math.max(1, Math.min(8, Number(value) || 1)) : value
    }));
  };

  // Explicit calculation button handler
  const handleCalculateTotal = (e: React.FormEvent) => {
    e.preventDefault();
    const currentRate = RATES[formData.category];
    const calculated = formData.duration * currentRate;
    setTotal(calculated);
    setIsCalculated(true);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  // Nav scroll handler
  const scrollToSection = (id: string) => {
    setNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of fixed navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Generate WhatsApp message and URL
  const getWhatsAppUrl = () => {
    const rate = RATES[formData.category];
    const categoryLabel = formData.category.charAt(0).toUpperCase() + formData.category.slice(1);
    
    const message = `Booking Request:
Name: ${formData.name || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Date: ${formData.date || 'Not provided'}
Start Time: ${formData.startTime || 'Not provided'}
End Time: ${formData.endTime || 'Not provided'}
Duration: ${formData.duration} hour(s)
Game: ${categoryLabel}
Total: Rs. ${total}`;

    return `https://wa.me/923213111360?text=${encodeURIComponent(message)}`;
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors: COLORS }}>
      <div 
        id="app-container"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: COLORS.bg,
          color: COLORS.textPrimary,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflowX: 'hidden',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        
        {/* 1. NAVBAR */}
        <nav 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '80px',
            backgroundColor: isDarkMode ? 'rgba(10, 10, 15, 0.96)' : 'rgba(252, 250, 242, 0.96)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.15)' : 'rgba(140, 104, 18, 0.15)'}`,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 20px' : '0 60px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Logo Left */}
          <div 
            onClick={() => scrollToSection('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
              fontWeight: 'bold',
              fontSize: isMobile ? '20px' : '26px',
              color: COLORS.primary,
              letterSpacing: '1px',
              userSelect: 'none'
            }}
          >
            <span style={{ fontSize: isMobile ? '24px' : '28px' }}>🎱</span>
            <span>Cue & Console</span>
          </div>
  
          {/* Links Right - Desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              {['home', 'booking', 'about', 'gallery'].map((section) => {
                const isActive = activeSection === section;
                const label = section.charAt(0).toUpperCase() + section.slice(1);
                return (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '15px',
                      fontWeight: 500,
                      color: isActive ? COLORS.primary : COLORS.textPrimary,
                      padding: '8px 4px',
                      position: 'relative',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {label}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: COLORS.primary,
                        transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'center',
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </button>
                );
              })}

              {/* Dynamic Theme Switcher */}
              <button
                onClick={() => {
                  const checked = !isDarkMode;
                  setIsDarkMode(checked);
                  localStorage.setItem('cue_console_theme', checked ? 'dark' : 'light');
                }}
                style={{
                  background: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  color: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? 'rgba(201, 168, 76, 0.08)' : 'rgba(140, 104, 18, 0.08)',
                  fontSize: '20px',
                  width: '38px',
                  height: '38px',
                  border: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.15)' : 'rgba(140, 104, 18, 0.15)'}`,
                  transition: 'all 0.3s ease'
                }}
                title={isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          )}
  
          {/* Hamburger Icon - Mobile */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  const checked = !isDarkMode;
                  setIsDarkMode(checked);
                  localStorage.setItem('cue_console_theme', checked ? 'dark' : 'light');
                }}
                style={{
                  background: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  color: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: isDarkMode ? 'rgba(201, 168, 76, 0.08)' : 'rgba(140, 104, 18, 0.08)',
                  fontSize: '18px',
                  width: '34px',
                  height: '34px',
                  border: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.15)' : 'rgba(140, 104, 18, 0.15)'}`,
                  transition: 'all 0.3s ease'
                }}
                title={isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setNavOpen(!navOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  color: COLORS.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: isDarkMode ? 'rgba(201, 168, 76, 0.05)' : 'rgba(140, 104, 18, 0.05)'
                }}
              >
                {navOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
  
          {/* Slide-down mobile nav links */}
          <AnimatePresence>
            {isMobile && navOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  top: '80px',
                  left: 0,
                  right: 0,
                  backgroundColor: isDarkMode ? 'rgba(10, 10, 15, 0.98)' : 'rgba(252, 250, 242, 0.98)',
                  borderBottom: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.2)' : 'rgba(140, 104, 18, 0.2)'}`,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px 0',
                  gap: '15px',
                  zIndex: 999
                }}
              >
                {['home', 'booking', 'about', 'gallery'].map((section) => {
                  const isActive = activeSection === section;
                  const label = section.charAt(0).toUpperCase() + section.slice(1);
                  return (
                    <button
                      key={section}
                      onClick={() => scrollToSection(section)}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '18px',
                        fontWeight: 500,
                        color: isActive ? COLORS.primary : COLORS.textPrimary,
                        padding: '10px 40px',
                        textAlign: 'left',
                        backgroundColor: isActive 
                          ? (isDarkMode ? 'rgba(201, 168, 76, 0.08)' : 'rgba(140, 104, 18, 0.08)') 
                          : 'transparent',
                        borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

      {/* Spacer to push below navbar */}
      <div style={{ height: '80px' }} />

      {/* 2. HERO SECTION */}
      <section 
        id="home"
        style={{
          position: 'relative',
          height: 'calc(100vh - 80px)',
          minHeight: '600px',
          backgroundImage: 'url("/image/image 4.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 20px'
        }}
      >
        {/* Dark overlay */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.overlay,
            zIndex: 1
          }}
        />

        {/* Content Box */}
        <div 
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: "'Georgia', serif",
              fontWeight: 'bold',
              fontSize: isMobile ? '42px' : isTablet ? '60px' : '72px',
              color: COLORS.primary,
              letterSpacing: isMobile ? '3px' : '6px',
              margin: 0,
              textShadow: '0 0 40px rgba(201,168,76,0.6)',
              lineHeight: 1.1
            }}
          >
            Cue & Console
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontFamily: "'Georgia', serif",
              fontStyle: 'italic',
              fontSize: isMobile ? '18px' : '22px',
              color: COLORS.textPrimary,
              margin: 0,
              letterSpacing: '1px'
            }}
          >
            "Where Champions Play"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ marginTop: '12px' }}
          >
            <button
              onClick={() => scrollToSection('booking')}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: COLORS.primary,
                color: COLORS.bg,
                padding: '14px 36px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(201, 168, 76, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.ctaHover;
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(201, 168, 76, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(201, 168, 76, 0.4)';
              }}
            >
              Book a Table
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US SECTION (About) */}
      <section 
        id="about"
        style={{
          padding: isMobile ? '60px 20px' : '100px 60px',
          backgroundColor: COLORS.card,
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: isMobile ? '28px' : '38px',
                color: COLORS.primary,
                marginBottom: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Why Choose Cue & Console
            </h2>
            <div 
              style={{
                width: '60px',
                height: '3px',
                backgroundColor: COLORS.primary,
                margin: '0 auto'
              }}
            />
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: '30px'
            }}
          >
            {/* Feature 1 */}
            <FeatureCard 
              icon="🎱"
              title="Premium Tables"
              desc="Our snooker and billiards tables are brand new, competition-grade, maintained daily for a perfect play surface."
            />
            {/* Feature 2 */}
            <FeatureCard 
              icon="🥢"
              title="Professional Cues"
              desc="Every cue in our rack is new, straight, and chalk-ready. No bent sticks, no excuses."
            />
            {/* Feature 3 */}
            <FeatureCard 
              icon="⏱ Flexible Hours"
              title="Flexible Hours"
              desc="Open 10AM–2AM daily. Book by the hour or half-hour. Walk-ins welcome when tables are free."
            />
            {/* Feature 4 */}
            <FeatureCard 
              icon="🏆"
              title="Expert Staff"
              desc="Our staff are trained players who can guide beginners and respect serious players' space."
            />
            {/* Feature 5 */}
            <FeatureCard 
              icon="📍"
              title="Prime Location"
              desc="Centrally located with ample parking. Easy to find, hard to leave."
            />
            {/* Feature 6 */}
            <FeatureCard 
              icon="💰"
              title="Best Rates"
              desc="Transparent pricing — no hidden charges. Best value snooker in the city."
            />
          </div>
        </div>
      </section>

      {/* 4. GALLERY SECTION */}
      <section 
        id="gallery"
        style={{
          padding: isMobile ? '60px 20px' : '100px 60px',
          backgroundColor: COLORS.bg,
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: isMobile ? '28px' : '38px',
                color: COLORS.primary,
                marginBottom: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Our Tables
            </h2>
            <div 
              style={{
                width: '60px',
                height: '3px',
                backgroundColor: COLORS.primary,
                margin: '0 auto'
              }}
            />
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '30px'
            }}
          >
            <GalleryItem 
              imgUrl="/image/pic 1.jfif"
              title="Imperial Grand Match Table"
            />
            <GalleryItem 
              imgUrl="/image/pic 2.jfif"
              title="Alexander Navy Snooker Lounge (Lounge Arena)"
            />
            <GalleryItem 
              imgUrl="/image/pic1.jfif"
              title="Alexander Navy Snooker Lounge (Classic Match)"
            />
            <GalleryItem 
              imgUrl="/image/image 4.jfif"
              title="Billiards & Private Arena Room"
            />
          </div>
        </div>
      </section>

      {/* 5. BOOKING SECTION */}
      <section 
        id="booking"
        style={{
          padding: isMobile ? '60px 20px' : '100px 60px',
          backgroundColor: COLORS.card,
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: isMobile ? '28px' : '38px',
                color: COLORS.primary,
                marginBottom: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              Reserve Your Table
            </h2>
            <div 
              style={{
                width: '60px',
                height: '3px',
                backgroundColor: COLORS.primary,
                margin: '0 auto'
              }}
            />
          </div>

          {/* Toast Notification for manual calculation confirmation */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                style={{
                  position: 'fixed',
                  top: '100px',
                  alignSelf: 'center',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: COLORS.secondary,
                  border: `1.5px solid ${COLORS.primary}`,
                  borderRadius: '6px',
                  padding: '16px 24px',
                  zIndex: 9999,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  color: COLORS.textPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <CheckCircle size={22} color={COLORS.primary} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 500 }}>
                  Total rate recalculated successfully for your request!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two-column layout */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile || isTablet ? '1fr' : '1.3fr 1fr',
              gap: '40px',
              alignItems: 'start'
            }}
          >
            
            {/* LEFT - Form */}
            <form 
              onSubmit={handleCalculateTotal}
              style={{
                backgroundColor: COLORS.bg,
                padding: isMobile ? '24px' : '36px',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '1px solid rgba(201, 168, 76, 0.1)'
              }}
            >
              <h3 
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: '22px',
                  color: COLORS.primary,
                  marginBottom: '24px',
                  marginTop: 0,
                  fontWeight: 'bold',
                  borderBottom: '1px solid rgba(201,168,76,0.15)',
                  paddingBottom: '12px'
                }}
              >
                Booking Form
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <FormInput
                  label="Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="E.g., Waleed Ahmed"
                  required
                />
                
                <FormInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="E.g., 0321-3111360"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <FormInput
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                
                <FormInput
                  label="Game Category"
                  as="select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="snooker">Snooker (Rs. 150/hr)</option>
                  <option value="billiards">Billiards (Rs. 100/hr)</option>
                  <option value="century">Century Ultra Premium (Rs. 600/hr)</option>
                </FormInput>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <FormInput
                  label="Start Time"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
                
                <FormInput
                  label="End Time"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <FormInput
                  label="Calculated Duration (Hours)"
                  type="text"
                  name="duration"
                  value={`${formData.duration} hour(s)`}
                  onChange={() => {}}
                  disabled
                  style={{ opacity: 0.8, cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: COLORS.primary,
                    color: COLORS.bg,
                    padding: '14px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(201, 168, 76, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.ctaHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(201, 168, 76, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(201, 168, 76, 0.25)';
                  }}
                >
                  Calculate Total
                </button>
              </div>
            </form>

            {/* RIGHT - Sticky Summary Panel */}
            <div 
              style={{
                position: isMobile || isTablet ? 'relative' : 'sticky',
                top: isMobile || isTablet ? '0px' : '120px',
                zIndex: 10
              }}
            >
              <div 
                style={{
                  backgroundColor: COLORS.bg,
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                  border: `2px solid ${COLORS.primary}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Accent ribbon */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    width: '50px',
                    height: '50px',
                    backgroundColor: COLORS.primary,
                    transform: 'rotate(45deg)',
                    opacity: 0.15
                  }}
                />

                <h3 
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: '22px',
                    color: COLORS.primary,
                    margin: '0 0 24px 0',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span>📋</span> Booking Summary
                </h3>

                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} /> 📛 Name:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.name || <em style={{ opacity: 0.5 }}>Pending</em>}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} /> 📞 Phone:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.phone || <em style={{ opacity: 0.5 }}>Pending</em>}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} /> 📅 Date:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.date || <em style={{ opacity: 0.5 }}>Pending</em>}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} /> 🕐 Start Time:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.startTime || <em style={{ opacity: 0.5 }}>Pending</em>}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} /> 🕐 End Time:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.endTime || <em style={{ opacity: 0.5 }}>Pending</em>}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} /> ⏳ Duration:
                    </span>
                    <span style={{ fontWeight: 600 }}>{formData.duration} hour(s)</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(240, 230, 211, 0.08)', paddingBottom: '10px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎮 Game Category:
                    </span>
                    <span style={{ fontWeight: 600, color: COLORS.primary }}>
                      {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed rgba(240, 230, 211, 0.15)', paddingBottom: '12px' }}>
                    <span style={{ color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      💵 Base Rate:
                    </span>
                    <span style={{ fontWeight: 600 }}>Rs. {RATES[formData.category]}/hr</span>
                  </div>

                  {/* Total pricing container */}
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(201, 168, 76, 0.04)',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid rgba(201, 168, 76, 0.15)',
                      marginTop: '10px'
                    }}
                  >
                    <span style={{ fontSize: '13px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      Estimated Amount
                    </span>
                    <div 
                      key={total} // Triggers react redraw for animation
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: COLORS.primary,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      Rs. {total}
                    </div>
                  </div>

                  {/* Confirm via WhatsApp CTA */}
                  <div style={{ marginTop: '16px' }}>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: COLORS.whatsapp,
                        color: '#ffffff',
                        padding: '14px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1ebe56';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 211, 102, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.whatsapp;
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.25)';
                      }}
                    >
                      <MessageCircle size={20} />
                      Confirm via WhatsApp
                    </a>
                  </div>

                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: COLORS.textMuted,
                      textAlign: 'center',
                      justifyContent: 'center',
                      marginTop: '8px'
                    }}
                  >
                    <Info size={14} color={COLORS.primary} />
                    <span>Table held for 15 mins past booked slot time.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>



      {/* 6. TESTIMONIALS SECTION */}
      <section 
        id="testimonials"
        style={{
          padding: isMobile ? '60px 20px' : '100px 60px',
          backgroundColor: isDarkMode ? '#0e0e1a' : '#f4edf0' /* premium warm ivory shader */,
          borderBottom: '1px solid rgba(201,168,76,0.1)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: isMobile ? '28px' : '38px',
                color: COLORS.primary,
                marginBottom: '16px',
                fontWeight: 'bold',
                letterSpacing: '1px'
              }}
            >
              What Our Players Say
            </h2>
            <div 
              style={{
                width: '60px',
                height: '3px',
                backgroundColor: COLORS.primary,
                margin: '0 auto'
              }}
            />
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: '30px'
            }}
          >
            <TestimonialCard 
              rating={5}
              quote="Best snooker tables in the city. Perfectly leveled and fast cloth. Come here every weekend."
              author="Ahmed K."
            />
            
            <TestimonialCard 
              rating={5}
              quote="Loved the atmosphere. The century table is worth every rupee. Will be back!"
              author="Bilal R."
            />

            <TestimonialCard 
              rating={4}
              quote="Good cues, great staff, fair prices. The booking system on WhatsApp is super convenient."
              author="Usman T."
            />

            <TestimonialCard 
              rating={5}
              quote="Took my friends here for a tournament night. Staff set everything up perfectly. Highly recommend."
              author="Hamza M."
            />

            <TestimonialCard 
              rating={5}
              quote="Clean, professional, and affordable. This is our go-to spot now. Tables are always in great shape."
              author="Sara N."
            />

            <TestimonialCard 
              rating={4}
              quote="The century table plays incredibly. Lighting is perfect, no glare. Exactly what serious players need."
              author="Zain A."
            />
          </div>

        </div>
      </section>

       {/* 7. FOOTER */}
      <footer 
        style={{
          backgroundColor: isDarkMode ? '#07070d' : '#ebdfc4',
          padding: '60px 20px 30px 20px',
          borderTop: `1px solid ${isDarkMode ? 'rgba(201, 168, 76, 0.15)' : 'rgba(140, 104, 18, 0.15)'}`,
          color: COLORS.textPrimary,
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '30px'
          }}
        >
          {/* Logo Name */}
          <div 
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: '24px',
              fontWeight: 'bold',
              color: COLORS.primary,
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>🎱</span> Cue & Console
          </div>

          {/* Quick links */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '30px'
            }}
          >
            {['home', 'booking', 'about', 'gallery'].map((sectionID) => {
              const label = sectionID.charAt(0).toUpperCase() + sectionID.slice(1);
              return (
                <button
                  key={sectionID}
                  onClick={() => scrollToSection(sectionID)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    color: COLORS.textMuted,
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'color 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = COLORS.textMuted}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Contact Details */}
          <div style={{ textAlign: 'center' }}>
            <a 
              href="https://wa.me/923213111360"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: COLORS.whatsapp,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
                padding: '10px 20px',
                borderRadius: '30px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(37, 211, 102, 0.1)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <MessageCircle size={18} />
              Chat with us: 0321-3111360
            </a>
          </div>

          <div 
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: isDarkMode ? 'rgba(240, 230, 211, 0.08)' : 'rgba(26, 20, 11, 0.12)',
              marginTop: '10px'
            }}
          />

          {/* Copyright copy */}
          <div 
            style={{
              color: COLORS.textMuted,
              fontSize: '13px',
              textAlign: 'center'
            }}
          >
            🎱 Cue & Console — © 2025 All Rights Reserved
          </div>

        </div>
      </footer>

      {/* FLOATING ACTION: BACK TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="back-to-top"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            whileHover={{ 
              scale: 1.1,
              backgroundColor: COLORS.ctaHover,
              boxShadow: `0 12px 24px rgba(0, 0, 0, 0.35), 0 0 15px ${COLORS.primary}80` 
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: 'smooth'
              });
              setActiveSection('home');
            }}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              zIndex: 9999,
              backgroundColor: COLORS.primary,
              color: isDarkMode ? '#0a0a0f' : '#fcfaf2',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              outline: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
            title="Scroll back to top"
          >
            <ChevronUp size={24} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
    </ThemeContext.Provider>
  );
}

/* HELPER COMPONENTS */

// 1. Feature Card Component
interface FeatureCardProps {
  icon: string;
  title: string;
  desc: string;
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false);
  const { colors } = React.useContext(ThemeContext);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.card,
        borderTop: `3px solid ${colors.primary}`,
        padding: '28px',
        borderRadius: '8px',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
        boxShadow: hovered 
          ? `0 15px 30px rgba(0,0,0,0.3), 0 5px 15px ${colors.primary}20` 
          : '0 4px 15px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ fontSize: '30px' }}>{icon}</div>
      <h3 
        style={{
          fontFamily: "'Georgia', serif",
          color: colors.primary,
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0
        }}
      >
        {title}
      </h3>
      <p 
        style={{
          fontFamily: "'Inter', sans-serif",
          color: colors.textPrimary,
          lineHeight: 1.6,
          fontSize: '14px',
          margin: 0
        }}
      >
        {desc}
      </p>
    </div>
  );
}

// 2. Gallery Item Component
interface GalleryItemProps {
  imgUrl: string;
  title: string;
}

function GalleryItem({ imgUrl, title }: GalleryItemProps) {
  const [hovered, setHovered] = useState(false);
  const { colors, isDarkMode } = React.useContext(ThemeContext);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: `1px solid ${colors.primary}`,
        backgroundColor: colors.card,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        boxShadow: hovered 
          ? `0 12px 28px rgba(0, 0, 0, 0.4), 0 5px 15px ${colors.primary}30` 
          : '0 4px 12px rgba(0,0,0,0.2)',
        cursor: 'pointer'
      }}
    >
      <div style={{ overflow: 'hidden', height: '240px' }}>
        <img
          src={imgUrl}
          alt={title}
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
      </div>
      <div 
        style={{
          fontFamily: "'Georgia', serif",
          color: colors.primary,
          fontSize: '15px',
          padding: '14px',
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: isDarkMode ? '#0c0c16' : '#ede7d4',
          borderTop: `1px solid ${colors.primary}15`
        }}
      >
        {title}
      </div>
    </div>
  );
}

// 3. Form Input Field Component
interface FormInputProps {
  label: string;
  as?: 'input' | 'select';
  type?: string;
  name?: string;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  required?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

function FormInput({ label, as = 'input', children, style, ...props }: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = React.useContext(ThemeContext);

  const containerStyle: React.CSSProperties = {
    marginBottom: '16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: colors.primary,
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: colors.secondary,
    border: focused ? `1.5px solid ${colors.primary}` : `1px solid ${colors.primary}45`,
    color: colors.textPrimary,
    borderRadius: '4px',
    padding: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: focused ? `0 0 10px ${colors.primary}40` : 'none',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>{label}</label>
      {as === 'select' ? (
        <select
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, ...style } as React.CSSProperties}
        >
          {children}
        </select>
      ) : (
        <input
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...inputStyle, ...style } as React.CSSProperties}
        />
      )}
    </div>
  );
}

// 4. Testimonial Card Component
interface TestimonialCardProps {
  quote: string;
  author: string;
  rating: number;
}

function TestimonialCard({ quote, author, rating }: TestimonialCardProps) {
  const [hovered, setHovered] = useState(false);
  const { colors } = React.useContext(ThemeContext);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.card,
        borderLeft: `4px solid ${colors.primary}`,
        padding: '24px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: hovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 25px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.15)'
      }}
    >
      <div>
        <div style={{ color: colors.primary, marginBottom: '12px', fontSize: '18px' }}>
          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </div>
        <p 
          style={{
            fontFamily: "'Georgia', serif",
            fontStyle: 'italic',
            color: colors.textPrimary,
            fontSize: '14.5px',
            lineHeight: 1.6,
            margin: '0 0 16px 0'
          }}
        >
          "{quote}"
        </p>
      </div>
      <p 
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 'bold',
          color: colors.textMuted,
          textAlign: 'right',
          margin: 0
        }}
      >
        — {author}
      </p>
    </div>
  );
}
