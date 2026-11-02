import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Link2, ShieldCheck, Building, GraduationCap, Briefcase, FileCheck, CheckCircle2, Volume2, VolumeX, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext.js';
import { Button } from '../ui/Button.js';
import { DoodleCloud } from '../ui/DoodleCloud.js';
import { ShimmerBadge } from '../ui/ShimmerBadge.js';
import { sound } from '../../lib/sound.js';

export function Hero() {
  const { t, currentLang } = useLanguage();

  const getHeadline = () => {
    if (currentLang === 'hi') return 'जवाब देने से पहले जान लें कि यह वास्तविक है।';
    if (currentLang === 'kn') return 'ಪ್ರತಿಕ್ರಿಯಿಸುವ ಮುನ್ನ ಇದು ನೈಜವೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.';
    return "Know it's real before you reply.";
  };

  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const promise = videoRef.current.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    }
  }, []);

  const toggleSound = () => {
    try {
      if (!audioRef.current) {
        const audio = new Audio('/elevenlabs-voice.mp3');
        audio.onended = () => {
          setIsPlayingAudio(false);
          setIsMuted(true);
        };
        audioRef.current = audio;
      }

      if (isPlayingAudio) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
        setIsMuted(true);
        return;
      }

      // Reset and play ElevenLabs audio
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setIsPlayingAudio(true);
          setIsMuted(false);
        })
        .catch(() => {
          // Fallback to ogg format if mp3 playback is blocked
          const fallback = new Audio('/elevenlabs-voice.ogg');
          fallback.onended = () => {
            setIsPlayingAudio(false);
            setIsMuted(true);
          };
          fallback
            .play()
            .then(() => {
              setIsPlayingAudio(true);
              setIsMuted(false);
            })
            .catch(() => {});
        });
    } catch {
      // Audio autoplay policy fallback
    }

    if (videoRef.current) {
      videoRef.current.muted = false;
      const promise = videoRef.current.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    }
  };

  const handlePreviewAudit = () => {
    sound.playPreviewChime();
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCard = () => {
    const el = document.getElementById('submission-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full pt-20 sm:pt-24 lg:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Decorative MotherDuck Floating Clouds with Gentle Motion */}
      <DoodleCloud size={150} className="absolute right-8 top-12 opacity-80 hidden sm:block pointer-events-none select-none text-foreground animate-float" />
      <DoodleCloud size={95} className="absolute left-6 top-32 opacity-60 hidden md:block pointer-events-none select-none text-foreground animate-float-delayed" />
      <DoodleCloud size={70} className="absolute right-1/3 top-6 opacity-50 hidden lg:block pointer-events-none select-none text-foreground animate-float" />

      <div className="max-w-editorial mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-Column Layout: Left Column (~45%) + Right Column (~55%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (~45% width on desktop, full width stacked on mobile) */}
          <div className="lg:col-span-5">
            {/* Serif Headline (Two lines if naturally breaks, else one) */}
            <h1 className="font-serif font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl text-foreground leading-[1.15]">
              {getHeadline()}
            </h1>

            {/* Subtitle paragraph in --color-muted-foreground */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-normal">
              {t('hero.subtitle')}
            </p>

            {/* Two CTAs Side-by-Side: Solid Black Primary + White with border-pill Secondary */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={scrollToCard}
                className="inline-flex items-center justify-center font-bold tracking-wider uppercase text-xs sm:text-sm px-6 py-3.5 bg-primary text-white border-2 border-primary shadow-sm hover:opacity-90 active:translate-y-[1px] transition-all rounded-none cursor-pointer group"
              >
                <span>{t('hero.cta')}</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link to="/link-check">
                <button
                  type="button"
                  className="inline-flex items-center justify-center font-bold tracking-wider uppercase text-xs sm:text-sm px-6 py-3.5 bg-surface text-foreground border border-border-pill shadow-sm hover:bg-muted/10 active:translate-y-[1px] transition-all rounded-none cursor-pointer"
                >
                  <Link2 size={16} className="mr-2 text-foreground" />
                  <span>{t('hero.secondaryCta')}</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column (~55% width on desktop, full width stacked on mobile) */}
          <div className="lg:col-span-7">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border-2 border-neo-border shadow-neo-xl relative overflow-hidden flex flex-col justify-between p-4 sm:p-5"
            >
              <div>
                {/* Traffic Light Terminal Window Header */}
                <div className="flex items-center justify-between pb-2.5 border-b-2 border-neo-border mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-terracotta border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-yellow border border-neo-border" />
                    <div className="w-3 h-3 bg-neo-sky border border-neo-border" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    jaanch-audit
                  </span>
                </div>

                {/* Video Player Display Container */}
                <div className="relative w-full aspect-video bg-background border-2 border-neo-border overflow-hidden shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src="/whatsapp-demo.mp4"
                    poster="/poster.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* MotherDuck Style "TAP FOR SOUND" Yellow Button */}
              <div className="mt-4 pt-3 border-t-2 border-neo-border flex items-center justify-start gap-3">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="bg-neo-yellow text-foreground border-2 border-neo-border shadow-neo-sm px-3.5 py-2 font-mono font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-neo-yellow/90 hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all group cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Volume2 size={14} className="text-foreground shrink-0 group-hover:scale-110 transition-transform animate-pulse" />
                      <span>🔊 PLAYING SOUND</span>
                    </>
                  ) : (
                    <>
                      <VolumeX size={14} className="text-foreground shrink-0 group-hover:scale-110 transition-transform" />
                      <span>◀ TAP FOR SOUND</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Verified Portals Strip ("TRUSTED BY BUILDERS" Style from MotherDuck image) */}
        <div className="mt-12 pt-8 border-t-2 border-neo-border">
          <div className="flex items-center justify-between pb-3 mb-4">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Official Indian Verification Portals
            </span>
            <ShimmerBadge>
              GOVT VERIFIED
            </ShimmerBadge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <a
              href="https://www.mca.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Building size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>MCA Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">mca.gov.in</div>
              </div>
            </a>

            <a
              href="https://www.ncs.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <Briefcase size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>NCS India</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">ncs.gov.in</div>
              </div>
            </a>

            <a
              href="https://scholarships.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <GraduationCap size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>NSP Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">scholarships.gov.in</div>
              </div>
            </a>

            <a
              href="https://internship.aicte-india.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 border-2 border-neo-border shadow-neo-sm bg-background hover:bg-neo-sky hover:text-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-medium text-foreground group"
            >
              <ShieldCheck size={16} className="text-terracotta shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <div className="truncate">
                <div className="font-bold truncate flex items-center gap-1">
                  <span>AICTE Portal</span>
                  <ExternalLink size={10} className="text-muted-foreground group-hover:text-foreground shrink-0" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono">aicte-india.org</div>
              </div>
            </a>
          </div>
        </div>

        {/* 3-Card Pastel Feature Strip (MotherDuck 3-Card Layout: Peach, Sky, Mint) */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t-2 border-neo-border">
          {/* Card 1: Peach */}
          <div className="bg-neo-peach border-2 border-neo-border shadow-neo p-5 sm:p-6 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-xs font-bold uppercase bg-surface border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  01
                </span>
                <div className="w-8 h-8 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center text-foreground">
                  <ShieldCheck size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
                {t('features.zeroFeesTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-foreground/85 mt-2 leading-relaxed">
                {t('features.zeroFeesDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box (MotherDuck visual signature) */}
            <div className="mt-5 p-3.5 bg-surface border-2 border-neo-border shadow-neo-sm text-xs font-mono space-y-1.5">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard1Label1')}</span>
                <span className="text-status-likely-genuine-fg font-bold">{t('hero.featureCard1Val1')}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard1Label2')}</span>
                <span className="text-status-likely-genuine-fg font-bold">{t('hero.featureCard1Val2')}</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t-2 border-neo-border/20 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:translate-x-1 transition-transform cursor-pointer">
              <span>{t('hero.learnMore')}</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 2: Sky Blue */}
          <div className="bg-neo-blue border-2 border-neo-border shadow-neo p-5 sm:p-6 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-xs font-bold uppercase bg-surface border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  02
                </span>
                <div className="w-8 h-8 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center text-foreground">
                  <FileCheck size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
                {t('features.noOtpTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-foreground/85 mt-2 leading-relaxed">
                {t('features.noOtpDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box */}
            <div className="mt-5 p-3.5 bg-surface border-2 border-neo-border shadow-neo-sm text-xs font-mono space-y-1.5">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard2Label1')}</span>
                <span className="text-foreground font-semibold">{t('hero.featureCard2Val1')}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard2Label2')}</span>
                <span className="text-status-high-concern-fg font-bold">{t('hero.featureCard2Val2')}</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t-2 border-neo-border/20 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:translate-x-1 transition-transform cursor-pointer">
              <span>{t('hero.learnMore')}</span>
              <ArrowRight size={14} />
            </div>
          </div>

          {/* Card 3: Mint Green */}
          <div className="bg-neo-mint border-2 border-neo-border shadow-neo p-5 sm:p-6 flex flex-col justify-between hover:shadow-neo-lg hover:-translate-y-1 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="font-mono text-xs font-bold uppercase bg-surface border-2 border-neo-border px-2 py-0.5 shadow-neo-sm text-foreground">
                  03
                </span>
                <div className="w-8 h-8 bg-surface border-2 border-neo-border shadow-neo-sm flex items-center justify-center text-foreground">
                  <CheckCircle2 size={16} aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
                {t('features.officialDomainsTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-foreground/85 mt-2 leading-relaxed">
                {t('features.officialDomainsDesc')}
              </p>
            </div>
            {/* Inner Wireframe Preview Box */}
            <div className="mt-5 p-3.5 bg-surface border-2 border-neo-border shadow-neo-sm text-xs font-mono space-y-1.5">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard3Label1')}</span>
                <span className="text-status-likely-genuine-fg font-bold">{t('hero.featureCard3Val1')}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{t('hero.featureCard3Label2')}</span>
                <span className="text-status-high-concern-fg font-bold">{t('hero.featureCard3Val2')}</span>
              </div>
            </div>
            <div className="mt-4 pt-2.5 border-t-2 border-neo-border/20 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-foreground hover:translate-x-1 transition-transform cursor-pointer">
              <span>{t('hero.learnMore')}</span>
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
