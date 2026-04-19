import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(37,140,244,0.3)]">
              <span className="material-symbols-outlined text-2xl">movie_edit</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Creaolink</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Features</a>
            <a className="text-sm font-medium text-slate-400 hover:text-white transition-colors" href="#">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="bg-primary hover:bg-primary-glow text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,140,244,0.3)] hover:shadow-[0_0_30px_rgba(37,140,244,0.5)] border border-primary/50">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0">
              <span className="size-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-medium text-cyan-400 tracking-wide uppercase">New Version Available</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500">
              End the Client <br/>
              <span className="text-white neon-text">Chat Chaos</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop chasing clients on WhatsApp. Centralize feedback, files, and payments in one professional workspace built specifically for video editors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link to="/dashboard" className="bg-primary hover:bg-primary-glow text-white px-8 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_25px_rgba(37,140,244,0.4)] hover:shadow-[0_0_35px_rgba(37,140,244,0.6)] border border-primary/50 flex items-center justify-center gap-2 group">
                Start for Free
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <button className="glass-panel hover:bg-white/5 text-white px-8 py-4 rounded-xl text-base font-medium transition-all border border-white/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">play_circle</span>
                Watch Demo
              </button>
            </div>
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="h-6 w-auto flex items-center gap-2 text-slate-400 font-bold"><span className="material-symbols-outlined">verified</span> TRUSTED BY 2000+ EDITORS</div>
            </div>
          </div>
          <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center perspective-[1000px]">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full z-0"></div>
            <div className="relative z-10 w-full h-auto transform lg:rotate-y-[-12deg] lg:rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out preserve-3d">
              <div className="glass-panel rounded-2xl p-2 shadow-2xl border border-white/10 bg-[#0F0F0F]/80 backdrop-blur-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20 rounded-t-xl">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-500/80"></div>
                    <div className="size-3 rounded-full bg-yellow-500/80"></div>
                    <div className="size-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="flex-1 text-center text-xs text-slate-500 font-mono">creaolink.app/dashboard</div>
                </div>
                <div className="w-full h-full bg-[#050505] rounded-b-xl overflow-hidden relative min-h-[300px] lg:min-h-[400px]" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAR9Qub1WtcbEovHZkn9IH22glJ_38G_UCmy9NYXMqaQeSmYmcyrnHfOweuYB1Gz2-efa2KFsjBv4xWlZSvSOabX9FRxrvpo7NqITJkv92zUIlqRqb_zhffYEAWz8jnoCq9cdhYpA2A1RsbK42VJ7gjqotKmHBxlYuYut_9B_ZaEooYj1S3p3ryhd_utg10O1OEKtKYEKyd4OoGSTUzVaOVO3Ry_Y5DKqsqVDNE03km3KjFSzDCxtSGmuVWfDlQ4nt8X6bZxp_6IIc')", backgroundSize: "cover", backgroundPosition: "center" }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel rounded-lg border border-white/10 flex items-center gap-4">
                    <div className="size-10 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                      <span className="material-symbols-outlined">movie</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Project_Vlog_Edit_v3.mp4</div>
                      <div className="text-xs text-slate-400">Ready for review • 2.4 GB</div>
                    </div>
                    <div className="ml-auto px-3 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">Approved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem vs Solution Section */}
        <section className="w-full max-w-7xl px-6 py-20 border-t border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Old Way vs. The Creaolink Way</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">See the difference a dedicated tool makes for your peace of mind and client relationships.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="group relative rounded-2xl bg-[#0F0F0F] border border-red-500/20 overflow-hidden hover:border-red-500/40 transition-colors">
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
              <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="mb-6 flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                    <span className="material-symbols-outlined">warning</span>
                  </span>
                  <h3 className="text-xl font-bold text-white">The Chaos</h3>
                </div>
                <p className="text-slate-400 text-sm mb-8">Cluttered, stressful mobile chat interface with unread red bubbles, lost files, and endless scrolling to find feedback.</p>
                <div className="mt-auto relative h-48 w-full rounded-lg bg-[#050505] overflow-hidden border border-white/5 p-4">
                  <div className="absolute top-4 left-4 right-12 bg-[#1a1a1a] p-3 rounded-tl-xl rounded-tr-xl rounded-br-xl border border-white/5">
                    <div className="h-2 w-3/4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
                  </div>
                  <div class="absolute top-24 left-12 right-4 bg-red-900/20 p-3 rounded-tl-xl rounded-tr-xl rounded-bl-xl border border-red-500/20">
                    <div className="h-2 w-5/6 bg-red-900/40 rounded mb-2"></div>
                    <div className="h-2 w-2/3 bg-red-900/40 rounded"></div>
                  </div>
                  <div className="absolute top-[-10px] right-[-10px] size-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-[#0F0F0F]">9+</div>
                </div>
              </div>
            </div>
            <div className="group relative rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-primary/20 overflow-hidden hover:border-primary/50 transition-colors shadow-[0_0_30px_rgba(37,140,244,0.05)]">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
              <div className="relative z-10 p-8 flex flex-col h-full">
                <div className="mb-6 flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(37,140,244,0.2)]">
                    <span className="material-symbols-outlined">check_circle</span>
                  </span>
                  <h3 className="text-xl font-bold text-white">The Creaolink Way</h3>
                </div>
                <p className="text-slate-400 text-sm mb-8">Clean, organized project tab view with file categories, specific status labels, and clear actionable feedback.</p>
                <div className="mt-auto relative h-48 w-full rounded-lg bg-[#050505] overflow-hidden border border-primary/20 p-0 flex flex-col">
                  <div className="w-full h-8 border-b border-white/5 bg-white/5 flex items-center px-4 gap-4">
                    <div className="h-1.5 w-16 bg-primary rounded-full"></div>
                    <div className="h-1.5 w-16 bg-slate-700 rounded-full"></div>
                    <div className="h-1.5 w-16 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-4 grid grid-cols-2 gap-3">
                    <div className="rounded bg-primary/10 border border-primary/20 p-3 flex flex-col gap-2">
                      <div className="size-6 rounded bg-primary/20"></div>
                      <div className="h-1.5 w-full bg-primary/30 rounded"></div>
                    </div>
                    <div className="rounded bg-white/5 border border-white/5 p-3 flex flex-col gap-2 opacity-50">
                      <div className="size-6 rounded bg-white/10"></div>
                      <div className="h-1.5 w-full bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-7xl px-6 py-20">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Professional Editors</h2>
            <p className="text-slate-400 max-w-2xl">Everything you need to manage complex video projects without the administrative headache.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 hover:bg-white/5 transition-all hover:shadow-[0_0_30px_rgba(37,140,244,0.15)] hover:border-primary/30 group">
              <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">forum</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Project-Isolated Chats</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Keep conversations focused on specific projects. No more mixing personal messages with client feedback.</p>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 hover:bg-white/5 transition-all hover:shadow-[0_0_30px_rgba(37,140,244,0.15)] hover:border-primary/30 group">
              <div className="size-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">folder_managed</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Auto-Sorted Assets</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Files are automatically categorized by type and version. Stop searching through endless download folders.</p>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 hover:bg-white/5 transition-all hover:shadow-[0_0_30px_rgba(37,140,244,0.15)] hover:border-primary/30 group">
              <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-green-500/20 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Clear Quotations</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Generate professional quotes in seconds. Track approvals and get paid faster with integrated invoicing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-6 py-20 mt-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 -z-10"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Ready to streamline your workflow?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Join thousands of editors who have switched to Creaolink and reclaimed their time.</p>
            <Link to="/dashboard" className="inline-block bg-white text-black hover:bg-slate-200 px-10 py-4 rounded-xl text-lg font-bold transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]">
              Get Started for Free
            </Link>
            <p className="mt-6 text-sm text-slate-500">No credit card required • Cancel anytime</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <div className="size-6 text-white flex items-center justify-center border border-white rounded">
              <span className="material-symbols-outlined text-sm">movie_edit</span>
            </div>
            <span className="text-sm font-bold text-white">Creaolink</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">Support</a>
            <a className="hover:text-white transition-colors" href="#">Twitter</a>
            <a className="hover:text-white transition-colors" href="#">LinkedIn</a>
          </div>
          <div className="text-xs text-slate-600">
            © 2026 Creaolink Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;