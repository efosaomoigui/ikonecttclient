import React, {useLayoutEffect, useRef} from 'react';
import {mountSite, navigate} from '../../shared/public-site.js';
import '../../shared/public-site.css';
import './inner-pages-hybrid.css';
import '../../shared/visuals.css';
import {mountVisuals} from '../../shared/visuals.js';
import '../../shared/campaign.css';
import {mountCampaign} from '../../shared/campaign.js';
import '../../shared/homepage-sections.css';
import {mountHomepageSections} from '../../shared/homepage-sections.js';
import '../../shared/brand-signature.css';
import {mountBrandSignature} from '../../shared/brand-signature.js';
import '../../shared/connectivity-story.css';
import {mountConnectivityStory} from '../../shared/connectivity-story.js';
import {HomePage} from './components/pages/HomePage';
export default function App() {
  const root = useRef<HTMLDivElement>(null), home = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const site = mountSite({root: root.current!, home: home.current!, template: 'a'});
    const visuals = mountVisuals({root: root.current!, home: home.current!, template: 'a'});
    const campaign = mountCampaign({root: root.current!, home: home.current!});
    const extras = mountHomepageSections({root: root.current!, home: home.current!});
    const signature = mountBrandSignature({root: root.current!, home: home.current!});
    const story = mountConnectivityStory({root: root.current!, home: home.current!});
    return () => {story(); signature(); extras.destroy(); campaign(); visuals(); site();};
  }, []);
  return <div ref={root}><main ref={home}><HomePage onNavigate={(page, context) => navigate(page, context)} onViewPlans={audience => navigate(audience+'/plans')} onOpenMyIkonectt={() => navigate('my-ikonectt/sign-in')} /></main></div>;
}
