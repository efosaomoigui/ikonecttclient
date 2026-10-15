import React, {useLayoutEffect, useRef} from 'react';
import {mountSite, navigate} from '../../shared/public-site.js';
import '../../shared/public-site.css';
import {HomePage} from './components/pages/HomePage';
export default function App() {
  const root = useRef<HTMLDivElement>(null), home = useRef<HTMLElement>(null);
  useLayoutEffect(() => mountSite({root: root.current!, home: home.current!, template: 'a'}), []);
  return <div ref={root}><main ref={home}><HomePage onNavigate={(page, context) => navigate(page, context)} onViewPlans={audience => navigate(audience+'/plans')} onOpenMyIkonectt={() => navigate('my-ikonectt/sign-in')} /></main></div>;
}
