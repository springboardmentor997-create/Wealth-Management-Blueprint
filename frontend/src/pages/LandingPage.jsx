import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const FeatureCard = ({ icon: Icon, title, desc, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-8 hover:-translate-y-2 transition-transform duration-300 group ring-1 ring-white/5 hover:ring-primary/20"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-gold/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h4 className="font-display text-xl font-bold mb-3">{title}</h4>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 overflow-x-hidden">
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-b border-white/5 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            {/* Logo Image */}
            <motion.img 
              whileHover={{ scale: 1.05 }}
              src="/logo.jpg" 
              alt="PennyWise Logo" 
              className="h-12 w-auto rounded-lg"
            />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors hover:scale-105 transform">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors hover:scale-105 transform">How it Works</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium px-5 py-2 rounded-full text-sm"
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <motion.div 
             animate={{ 
               y: [0, -50, 0],
               opacity: [0.3, 0.6, 0.3], 
               scale: [1, 1.2, 1]
             }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               y: [0, 50, 0],
               opacity: [0.2, 0.5, 0.2],
               scale: [1, 1.1, 1]
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]" 
           />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative max-w-7xl mx-auto px-6 text-center z-10"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-muted-foreground">Trusted by 50,000+ investors worldwide</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="font-display text-5xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
            Your Wealth, <br />
            <span className="text-gradient inline-block">Intelligently Managed</span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed">
            Set financial goals, track investments, and simulate your future wealth with smart financial insights and beautiful analytics.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium px-8 py-4 rounded-full text-lg shadow-glow-primary flex items-center gap-2 group cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
            
            <Link to="/login">
              <motion.div 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.95 }}
                className="btn-ghost px-8 py-4 rounded-full text-lg hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
              >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  Sign In
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            variants={fadeInUp}
            className="mt-24 flex flex-wrap justify-center gap-12 border-t border-white/5 pt-12"
          >
            {[
              { label: "Uptime Security", value: "99.9%" },
              { label: "Real-time Updates", value: "24/7" },
              { label: "Data Encryption", value: "256-bit" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-3xl font-display font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider text-[10px]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-primary font-medium tracking-wide uppercase text-sm mb-2">Features</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-4">Everything you need to grow</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Powerful tools designed to give you complete control over your financial future.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              delay={0.1}
              icon={Target} 
              title="Goal Tracking" 
              desc="Set and track multiple financial goals with visual progress indicators and smart milestones." 
            />
            <FeatureCard 
              delay={0.2}
              icon={PieChart} 
              title="Portfolio Analytics" 
              desc="Real-time portfolio breakdown with asset allocation insights and performance metrics." 
            />
            <FeatureCard 
              delay={0.3}
              icon={TrendingUp} 
              title="What-If Simulations" 
              desc="Run powerful Monte Carlo simulations to project your wealth under various market scenarios." 
            />
            <FeatureCard 
              delay={0.4}
              icon={Zap} 
              title="AI Recommendations" 
              desc="Get personalized investment recommendations based on your risk profile and goals." 
            />
            <FeatureCard 
              delay={0.5}
              icon={ShieldCheck} 
              title="Bank-Grade Security" 
              desc="Your data is protected with 256-bit encryption, 2FA, and SOC 2 compliance." 
            />
            <FeatureCard 
              delay={0.6}
              icon={Smartphone} 
              title="Mobile First" 
              desc="Access your wealth dashboard anywhere with our responsive, native-feel interface." 
            />
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section id="how-it-works" className="py-32 bg-secondary/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-primary font-medium tracking-wide uppercase text-sm mb-2">How It Works</h2>
            <h3 className="font-display text-4xl lg:text-5xl font-bold mb-4">Start in 4 simple steps</h3>
            <p className="text-muted-foreground text-lg">Getting started with WealthTrack is easy. Here's how to begin.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Answer a few questions about your financial situation." },
              { step: "02", title: "Set Goals", desc: "Define what you're saving for—retirement, home, etc." },
              { step: "03", title: "Simulate", desc: "Connect accounts and run simulations for outcomes." },
              { step: "04", title: "Optimize", desc: "Receive AI-powered recommendations to grow." },
            ].map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="relative group p-6 rounded-2xl hover:bg-white/5 transition-colors"
              >
                <div className="text-7xl font-display font-bold text-white/5 mb-6 group-hover:text-primary/20 transition-colors duration-500">{item.step}</div>
                <h4 className="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                 {idx !== 3 && <div className="hidden md:block absolute top-[20%] right-0 w-[1px] h-[60%] bg-gradient-to-b from-transparent via-white/10 to-transparent translate-x-4" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-premium" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="max-w-5xl mx-auto px-6 relative z-10 text-center glass-card p-12 md:p-20 border border-primary/20 shadow-glow-accent"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Ready to take control?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join thousands of investors who trust WealthTrack to manage their wealth. Start your journey today.</p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <Link to="/register">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-premium px-10 py-5 rounded-full text-lg shadow-glow-primary w-full sm:w-auto font-bold tracking-wide"
                >
                Start Free Trial
                </motion.button>
            </Link>
            <div className="flex flex-col items-start gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Cancel anytime</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Full feature access</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 pt-16 pb-8 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                 <img src="/logo.jpg" alt="PennyWise Logo" className="h-8 w-auto rounded-lg" />
                 {/* <span className="font-display font-bold text-xl">PennyWise</span> */}
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your intelligent wealth management companion. Track, simulate, and grow your financial future.
              </p>
            </div>
            
            {[
              { head: "Product", links: ["Features", "Security", "Roadmap"] },
              { head: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { head: "Resources", links: ["Documentation", "Help Center", "API", "Status"] },
            ].map((col, idx) => (
              <div key={idx}>
                <h5 className="font-bold mb-4 text-foreground">{col.head}</h5>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="hover:text-primary transition-colors flex items-center gap-1 group">
                        <ChevronRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {link}
                    </a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Cookies</a>
              <a href="#" className="hover:text-foreground">Licenses</a>
            </div>
            <p>© 2026 PennyWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
