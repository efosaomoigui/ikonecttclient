import React, {useLayoutEffect, useRef} from 'react';
import {mountSite, navigate} from '../../shared/public-site.js';
import '../../shared/public-site.css';
import {HeroSection} from './components/HeroSection';
import {ChooseConnectionSection} from './components/ChooseConnectionSection';
import {PlansSection} from './components/PlansSection';
import {ResidentialEditorialSection} from './components/ResidentialEditorialSection';
import {BusinessEditorialSection} from './components/BusinessEditorialSection';
import {CoverageActionSection} from './components/CoverageActionSection';
import {MyIkonecttSection} from './components/MyIkonecttSection';
import {SupportSection} from './components/SupportSection';

export const App: React.FC = () => {
  const root=useRef<HTMLDivElement>(null),home=useRef<HTMLElement>(null);
  useLayoutEffect(() => mountSite({root:root.current!,home:home.current!,template:'c'}),[]);
  return <div ref={root}><main ref={home}>
    <HeroSection onExploreResidential={() => navigate('residential')} onExploreBusiness={() => navigate('business')} />
    <ChooseConnectionSection onExploreResidential={() => navigate('residential')} onExploreBusiness={() => navigate('business')} />
    <PlansSection onSelectAudience={audience => navigate(audience+'/plans')} onOpenCoverage={() => navigate('coverage')} />
    <ResidentialEditorialSection onExploreResidential={() => navigate('residential')} />
    <BusinessEditorialSection onExploreBusiness={() => navigate('business')} />
    <CoverageActionSection onCheckCoverage={() => navigate('coverage')} />
    <MyIkonecttSection onOpenMyIkonectt={() => navigate('my-ikonectt/sign-in')} />
    <SupportSection onOpenSupport={() => navigate('support')} />
  </main></div>;
};
