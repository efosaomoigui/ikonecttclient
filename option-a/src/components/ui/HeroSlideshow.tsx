import React, {useEffect, useRef} from 'react';
import {ChevronLeft, ChevronRight, Pause, Play} from 'lucide-react';
import {heroSlides} from './hero-slides.js';
import {mountHeroSlideshow} from './hero-slideshow.js';
import './hero-slideshow.css';
import {connectivityURL,connectivitySrcSet} from '../../../../shared/connectivity-assets.js';

export function HeroSlideshow({children}: {children: React.ReactNode}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => mountHeroSlideshow(root.current!, heroSlides), []);
  const first = heroSlides[0];
  return <section ref={root} id="home-hero" className="ik-cinematic-hero relative w-full min-h-[600px] lg:min-h-[720px] flex items-end text-white overflow-hidden" aria-label="Ikonectt connected life" aria-roledescription="carousel">
    <div className="ik-hero-images" data-hero-images aria-hidden="true">
      <picture className="ik-hero-picture" data-slide="0" data-current="" style={{opacity:1}}>
        <source media="(min-width:1024px)" srcSet={first.desktop.srcSet} sizes="100vw" width={first.desktop.width} height={first.desktop.height}/>
        <source media="(min-width:768px)" srcSet={first.medium.srcSet} sizes="66vw" width={first.medium.width} height={first.medium.height}/>
        <img src={first.mobile.src} srcSet={first.mobile.srcSet} sizes="100vw" width={first.mobile.width} height={first.mobile.height} alt="" loading="eager" decoding="async" fetchPriority="high"/>
      </picture>
      <div className="ik-hero-city-intro" data-hero-city-intro>
        <picture className="ik-hero-city-photo">
          <img src={connectivityURL('city')} srcSet={connectivitySrcSet('city')} sizes="100vw" width="832" height="306" alt="" loading="eager" decoding="async"/>
        </picture>
        <svg className="ik-hero-city-signals" viewBox="0 0 832 306" preserveAspectRatio="xMaxYMax slice" aria-hidden="true">
          <g className="ik-city-routes"><path d="M830 296C730 258 658 222 570 209S433 190 340 169"/><path d="M570 209 555 178 555 142"/><path d="M660 236 701 206 737 160"/></g>
          <g className="ik-city-pulses"><path data-city-route="0" pathLength="1" d="M830 296C730 258 658 222 570 209S433 190 340 169"/><path data-city-route="1" pathLength="1" d="M570 209 555 178 555 142"/><path data-city-route="2" pathLength="1" d="M660 236 701 206 737 160"/></g>
          <circle data-city-node="0" cx="555" cy="142" r="3"/><circle data-city-node="1" cx="737" cy="160" r="3"/>
        </svg>
        <div className="ik-hero-city-blend"/>
      </div>
    </div>
    <div className="ik-hero-scrim" aria-hidden="true"/>
    {children}
    <div className="ik-hero-controls" data-hero-controls role="group" aria-label="Hero slideshow controls">
      <button type="button" data-hero-step="-1" aria-label="Previous slide"><ChevronLeft size={20} aria-hidden="true"/></button>
      <button type="button" data-hero-step="1" aria-label="Next slide"><ChevronRight size={20} aria-hidden="true"/></button>
      <button type="button" className="ik-hero-toggle" data-hero-toggle aria-label="Pause slideshow" aria-pressed="true">
        <svg className="ik-hero-ring" viewBox="0 0 44 44" aria-hidden="true"><circle className="ik-hero-ring-track" cx="22" cy="22" r="19"/><circle className="ik-hero-ring-value" cx="22" cy="22" r="19" pathLength="1"/></svg>
        <Pause className="ik-hero-pause" size={15} aria-hidden="true"/><Play className="ik-hero-play" size={15} aria-hidden="true"/>
      </button>
    </div>
    <span className="ik-hero-announcement" aria-live="polite" aria-atomic="true" data-hero-announcement/>
  </section>;
}
