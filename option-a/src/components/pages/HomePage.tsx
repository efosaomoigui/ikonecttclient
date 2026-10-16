import React, { useState } from 'react';
import { PageId } from '../../types';
import { HOMEPAGE_CONTENT as C } from '../../content';
import { ChevronRight, MapPin } from 'lucide-react';
import {HeroSlideshow} from '../ui/HeroSlideshow';

interface HomePageProps {
  onNavigate: (page: PageId, options?: { plan?: string; address?: string }) => void;
  onOpenMyIkonectt?: () => void;
  onViewPlans?: (audience: 'residential' | 'business') => void;
}

const IMAGES = {
  residential: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?auto=format&fit=crop&w=1600&q=80',
  business: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1600&q=80',
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenMyIkonectt, onViewPlans }) => {
  const [address, setAddress] = useState('');

  const submitCoverage = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('coverage', address.trim() ? { address: address.trim() } : undefined);
  };

  const scrollToPlans = () => onViewPlans ? onViewPlans('residential') : document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Approved responsive photography; stable copy and CTA destinations. */}
      <HeroSlideshow>
        <div className="relative ik-container pb-20 lg:pb-28 pt-32">
          <div className="max-w-[620px] flex flex-col gap-6">
            <p className="ik-eyebrow ik-eyebrow-on-dark">{C.hero.eyebrow}</p>
            <h1 className="font-hero-display text-white">{C.hero.headline}</h1>
            <p className="font-lead-airy text-white/90 max-w-[520px]">{C.hero.body}</p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button id="hero-check-coverage" type="button" className="ik-btn-primary" onClick={() => onNavigate('coverage')}>
                {C.hero.primaryCta}
              </button>
              <button id="hero-explore-plans" type="button" className="ik-btn-on-dark" onClick={scrollToPlans}>
                {C.hero.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </HeroSlideshow>

      {/* 2. Coverage launcher */}
      <section id="home-coverage" className="w-full bg-[#f5f5f7] ik-section">
        <div className="ik-container">
          <div className="max-w-[720px] mx-auto text-center flex flex-col items-center gap-4">
            <h2 className="font-display-md text-[#1d1d1f]">{C.coverage.heading}</h2>
            <p className="font-body text-[#333333]">{C.coverage.body}</p>
            <form onSubmit={submitCoverage} className="ik-search mt-4 max-w-[600px]">
              <MapPin className="w-5 h-5 text-[#7a7a7a] shrink-0" aria-hidden="true" />
              <input
                id="home-coverage-input"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={C.coverage.placeholder}
                aria-label={C.coverage.placeholder}
              />
              <button id="home-coverage-submit" type="submit" className="ik-btn-primary shrink-0">
                {C.coverage.cta}
              </button>
            </form>
            <p className="font-caption text-[#7a7a7a]">{C.coverage.helper}</p>
          </div>
        </div>
      </section>

      {/* 3. Audience introductions — edge-to-edge photographic tiles */}
      <section id="home-audiences" className="w-full grid grid-cols-1 lg:grid-cols-2">
        {([
          { key: 'residential', data: C.audiences.residential, image: IMAGES.residential, page: 'residential' as PageId },
          { key: 'business', data: C.audiences.business, image: IMAGES.business, page: 'business' as PageId },
        ]).map(({ key, data, image, page }) => (
          <article
            key={key}
            className="relative min-h-[520px] lg:min-h-[600px] flex items-end text-white overflow-hidden group"
          >
            <img
              src={image}
              loading="lazy" decoding="async"
              alt={`${data.label} customers connected with Ikonectt`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative w-full p-8 sm:p-12 lg:p-16 flex flex-col gap-4 max-w-[560px]">
              <p className="ik-eyebrow ik-eyebrow-on-dark">{data.label}</p>
              <h2 className="font-display-lg text-white">{data.heading}</h2>
              <p className="font-body text-white/85">{data.body}</p>
              <div className="pt-2">
                <button
                  id={`home-explore-${key}`}
                  type="button"
                  onClick={() => onNavigate(page)}
                  className="ik-link ik-link-on-dark"
                >
                  {data.cta}
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 4. Featured plans — shared published preview catalogue */}
      <section id="plans" className="w-full bg-white ik-section">
        <div className="ik-container">
          <div className="max-w-[720px] mx-auto text-center flex flex-col gap-4 mb-12">
            <h2 className="font-display-lg text-[#1d1d1f]">{C.plans.heading}</h2>
            <p className="font-body text-[#333333]">{C.plans.body}</p>
          </div>

          <div data-home-plan-carousel />

        </div>
      </section>

      {/* 5. Company confidence — dark tile */}
      <section id="home-company" className="w-full bg-[#272729] text-white ik-section">
        <div className="ik-container">
          <div className="max-w-[760px] mx-auto text-center flex flex-col items-center gap-5">
            <h2 className="font-display-lg text-white">{C.company.heading}</h2>
            <p className="font-lead-airy text-[#cccccc]">{C.company.body}</p>
            <button id="home-about" type="button" className="ik-link ik-link-on-dark mt-2" onClick={() => onNavigate('about')}>
              {C.company.cta}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Portal panel */}
      <section id="home-portal" className="w-full bg-[#f5f5f7] ik-section">
        <div className="ik-container">
          <div className="max-w-[720px] mx-auto text-center flex flex-col items-center gap-5">
            <h2 className="font-display-md text-[#1d1d1f]">{C.portal.heading}</h2>
            <p className="font-body text-[#333333]">{C.portal.body}</p>
            <button id="home-my-ikonectt" type="button" className="ik-btn-primary mt-2" onClick={onOpenMyIkonectt}>
              {C.portal.cta}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
