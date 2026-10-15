import React, {useLayoutEffect, useRef} from 'react';
import {mountSite, navigate} from '../../shared/public-site.js';
import '../../shared/public-site.css';
import {HomePage} from './components/option2/HomePage';
export default function App() {
  const root = useRef<HTMLDivElement>(null), home = useRef<HTMLElement>(null);
  useLayoutEffect(() => mountSite({root: root.current!, home: home.current!, template: 'b'}), []);
  return <div ref={root}><main ref={home}><HomePage onNavigate={page => navigate(page)} onViewPlans={audience => navigate(audience+'/plans')} onSelectPlan={() => navigate('residential/plans/demo-1')} onOpenMyIkonectt={() => navigate('my-ikonectt/sign-in')} /></main></div>;
}
