import { WalletApi } from './wallet-api';
import { WalletUi } from './wallet-ui';
import './style.css';
import './acceptance.css';
import './readability.css';
import './wallet.css';
import './theme.css';
import { bindThemeControls, themeControl, themeLogo } from './theme';
import { integrationState } from './integrations';
import { STANDALONE_DEMO } from './runtime';
import { createIcons, ArrowDown, ArrowRight, ArrowUpRight, Building2, CalendarDays, ChartNoAxesColumn, ChartNoAxesCombined, ChevronDown, ChevronLeft, ChevronRight, Contact, CreditCard, Eye, EyeOff, FlaskConical, Headphones, Layers, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut, MapPin, Menu, Moon, Sun, Network, Pencil, Plug, Plus, RadioTower, ReceiptText, RefreshCw, ScrollText, Search, SearchX, Settings2, ShieldAlert, ShieldCheck, ShoppingBag, UserPlus, Users, X } from 'lucide';
const icons = { ArrowDown, ArrowRight, ArrowUpRight, Building2, CalendarDays, ChartNoAxesColumn, ChartNoAxesCombined, ChevronDown, ChevronLeft, ChevronRight, Contact, CreditCard, Eye, EyeOff, FlaskConical, Headphones, Layers, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut, MapPin, Menu, Moon, Sun, Network, Pencil, Plug, Plus, RadioTower, ReceiptText, RefreshCw, ScrollText, Search, SearchX, Settings2, ShieldAlert, ShieldCheck, ShoppingBag, UserPlus, Users, X };
import * as C from '../vendor/contracts';
import { ROLE_PERMISSIONS, type StaffRole } from '../vendor/permissions';
import { WorkspaceApi } from './api';
import { modules, labels, can, type Field, type RecordData } from './modules';
declare const __IKONECTT_PREVIEW__: boolean;
const api = new WorkspaceApi();
const walletApi = new WalletApi(api);
const app = document.querySelector<HTMLDivElement>('#app')!;
let route = 'dashboard', rows: RecordData[] = [], query = '', filter = '', page = 0, viewVersion = 0;
let cache: Record<string, RecordData[]> = {};
let lastFocus: HTMLElement | null = null;
let expandedNavGroup: string | null = null;
let navigationStarted = false;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const pretty = (v: unknown) => String(v ?? '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const icon = (name: string) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const money = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n / 100);
const date = (v: string) => v ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeZone: 'Africa/Lagos' }).format(new Date(v)) : '—';
const button = (label: string, action: string, style = '', i = '') => `<button class="btn ${style}" data-action="${action}">${i ? icon(i) : ''}${label}</button>`;
const badge = (v: unknown) => `<span data-status="${esc(v)}" class="badge ${['ACTIVE', 'AVAILABLE', 'CONFIRMED', 'COMPLETED', 'CONNECTED', 'RESOLVED', true].includes(v as any) ? 'good' : ['REJECTED', 'FAILED', 'ERROR', 'CLOSED', 'SUSPENDED', false].includes(v as any) ? 'bad' : ['NEW', 'OPEN', 'PENDING_PAYMENT', 'REPORTED', 'REQUIRES_REVIEW'].includes(v as any) ? 'warn' : ''}"><span></span>${esc(typeof v === 'boolean' ? (v ? 'Enabled' : 'Disabled') : pretty(v))}</span>`;
const refreshIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.65 } });
bindThemeControls(refreshIcons);
const toast = (message: string, error = false) => { document.querySelector('#toast')?.remove(); const el = document.createElement('div'); el.id = 'toast'; el.className = error ? 'toast error' : 'toast'; el.role = error ? 'alert' : 'status'; el.textContent = message; document.body.append(el); setTimeout(() => el.remove(), 6500); };
const errorText = (e: unknown) => e instanceof Error ? e.message : 'The operation could not be completed.';
function friendly(e: any) { if(e?.details&&Array.isArray(e.details))return e.details.map((x:any)=>`${x.path||'Request'}: ${x.message||'Invalid value'}`).join(' / '); return e?.issues ? e.issues.map((x: any) => `${x.path.join('.')}: ${x.message}`).join(' · ') : errorText(e); }
api.onExpired = () => { cache = {}; closeModal(); login('Your session has expired. Please sign in again.'); };
function login(message = '') {
    expandedNavGroup = null;
    navigationStarted = false;
    rows=[];cache={};
    viewVersion++;
    app.innerHTML = `<main class="login"><section class="login-story"><img src="/admin/logo-white.png" alt="Ikonectt"><div><span class="eyebrow">THE STAFF WORKSPACE</span><h1>Connections begin<br>with people.</h1><p>One place to care for customers, move work forward and keep Ikonectt connected.</p><div class="signal"><span></span><span></span><span></span><b>${icon('network')}</b></div></div><footer>IKONECTT ADMIN <span>Authorized personnel only</span></footer></section><section class="login-panel">${themeControl()}<div class="login-box"><img class="mobile-logo" data-theme-logo src="${themeLogo()}" alt="Ikonectt"><span class="eyebrow red">STAFF ACCESS</span><h2>Staff sign-in</h2><p>${STANDALONE_DEMO ? 'Choose a sample staff role below. No credentials are required.' : 'Use your authorized staff account.'}</p><form id="login-form"><label>Staff email<input name="email" type="email" ${STANDALONE_DEMO ? 'disabled autocomplete="off"' : 'autocomplete="username"'} required placeholder="you@ikonectt.com"></label><label>Password<div class="password"><input name="password" type="password" ${STANDALONE_DEMO ? 'disabled autocomplete="off"' : 'autocomplete="current-password"'} required placeholder="Enter your password"><button type="button" aria-label="Show password" data-action="password">${icon('eye')}</button></div></label><div id="login-error" role="alert" class="form-error">${esc(message)}</div><button class="btn primary full" type="submit"${STANDALONE_DEMO ? ' disabled' : ''}>${STANDALONE_DEMO ? 'Staff sign-in unavailable in demo' : 'Sign in to workspace'} ${icon('arrow-right')}</button></form><div class="login-help"><a class="auth-link" href="#/recovery" data-action="recovery">Forgot password?</a><a class="auth-link" href="#/reset-password" data-action="reset-password">Set password</a></div><p class="secure">${icon('lock-keyhole')} ${STANDALONE_DEMO ? 'Independent fictional records. No real account access.' : 'Your access is managed by your administrator.'}</p>${__IKONECTT_PREVIEW__?`<details class="preview-box"><summary><strong>Review the application</strong><span class="preview-toggle"><span class="preview-show">Show</span><span class="preview-hide">Hide</span>${icon('chevron-down')}</span></summary><div class="preview-content"><p>${STANDALONE_DEMO ? 'Explore fictional sample records. Exit or reload to reset this independent demo.' : 'Explore a temporary workspace with labeled sample records. No production data is connected.'}</p><label class="sr-only" for="preview-role">Preview staff role</label><select id="preview-role">${Object.keys(ROLE_PERMISSIONS).map(r => `<option value="${r}">${pretty(r)}</option>`).join('')}</select>${button('Open simulated workspace', 'preview', 'full', 'arrow-up-right')}</div></details>`:""}<small>© ${new Date().getFullYear()} Ikonectt</small></div></section></main>`;
    refreshIcons();
    document.querySelector<HTMLFormElement>('#login-form')!.onsubmit = async (e) => { e.preventDefault(); if(STANDALONE_DEMO){document.querySelector('#login-error')!.textContent='Real sign-in is unavailable in this standalone demo. Use Review the application.';return;} const form = e.currentTarget as HTMLFormElement; const b = form.querySelector('button[type=submit]') as HTMLButtonElement; b.disabled = true; b.textContent = 'Signing in…'; try {
        const data = new FormData(form);
        await api.login(String(data.get('email')), String(data.get('password')));
        form.reset();
        cache = {};
        await navigate();
    }
    catch (err) {
        document.querySelector('#login-error')!.textContent = friendly(err);
    }
    finally {
        b.disabled = false;
        b.innerHTML = `Sign in to workspace ${icon('arrow-right')}`;
        refreshIcons();
    } };
}
function navigationEntries() {
    return [{ key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', group: 'Overview', permission: null }, ...Object.entries(modules).map(([key, m]) => ({ key, ...m })), { key: 'reports', label: 'Reports', icon: 'chart-no-axes-combined', group: 'Intelligence', permission: 'reports.read' }, { key: 'integrations', label: 'Integrations', icon: 'plug', group: 'Administration', permission: 'integrations.read' }, { key: 'settings', label: 'Settings', icon: 'settings-2', group: 'Administration', permission: 'staff.manage' }];
}
function nav() {
    const entries = navigationEntries();
    const groups = ['Overview', 'Customers & sales', 'Services & operations', 'Customer support', 'Intelligence', 'Administration'];
    return groups.map((g, index) => {
        const items = entries.filter(e => e.group === g && (!e.permission || can(api.permissions, e.permission)));
        const expanded = expandedNavGroup === g;
        return items.length ? `<div class="nav-group"><button type="button" class="nav-group-toggle" data-action="nav-group" data-group="${esc(g)}" aria-expanded="${expanded}" aria-controls="nav-group-${index}"><span>${g}</span>${icon('chevron-down')}</button><div id="nav-group-${index}"${expanded ? '' : ' hidden'}>${items.map(e => `<a href="#/${e.key}" class="nav-link ${route === e.key ? 'active' : ''}" ${route === e.key ? 'aria-current="page"' : ''}>${icon(e.icon)}${e.label}${e.key === 'dashboard' ? '<b></b>' : ''}</a>`).join('')}</div></div>` : '';
    }).join('');
}
function revealActiveNavigation() {
    const navigation = document.querySelector<HTMLElement>('.sidebar nav');
    const active = navigation?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!navigation || !active || active.closest('[hidden]')) return;
    const frame = navigation.getBoundingClientRect(), item = active.getBoundingClientRect();
    if (item.bottom > frame.bottom) navigation.scrollTop += item.bottom - frame.bottom;
    else if (item.top < frame.top) navigation.scrollTop -= frame.top - item.top;
}
const simulationBanner = () => `<div class="demo-banner"><strong>Simulation mode</strong><span>${STANDALONE_DEMO ? 'Fictional, independent sample state. Actions do not affect real customers or the separate portal demo. Exit or reload to reset.' : 'Viewing simulated development records. Simulation actions are not real customer operations; simulation data may reset.'}</span></div>`;
const sidebarScrollTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
document.addEventListener('scroll', event => {
    const navigation = event.target;
    if (!(navigation instanceof HTMLElement) || !navigation.matches('.sidebar nav')) return;
    navigation.classList.add('is-scrolling');
    clearTimeout(sidebarScrollTimers.get(navigation));
    sidebarScrollTimers.set(navigation, setTimeout(() => navigation.classList.remove('is-scrolling'), 700));
}, { capture: true, passive: true });
function shell() { const title = modules[route]?.label || pretty(route); app.innerHTML = `<div class="workspace"><aside class="sidebar" id="sidebar"><a class="brand" href="#/dashboard"><img data-theme-logo src="${themeLogo()}" alt="Ikonectt"><span>STAFF WORKSPACE</span></a><nav aria-label="Main navigation" tabindex="0">${nav()}</nav><div class="sidebar-bottom"><div class="workspace-label">${icon('building-2')} Ikonectt Operations</div><small>Connected people. Better service.</small></div></aside><div class="main-shell"><header class="topbar"><button class="icon-btn mobile-menu" aria-label="Toggle navigation" aria-expanded="false" data-action="menu">${icon('menu')}</button><div class="breadcrumb">Workspace ${icon('chevron-right')} <strong>${title}</strong></div><div class="top-right">${themeControl()}<span class="environment">${icon(api.mode === 'mock' ? 'flask-conical' : 'lock-keyhole')}${api.mode === 'mock' ? 'SIMULATED WORKSPACE' : 'SHARED BACKEND'}</span><button class="profile" data-action="account" aria-label="Account and sign out"><span>${api.session!.principal.roles[0].slice(0, 2)}</span><div><b>${pretty(api.session!.principal.roles.join(' · '))}</b><small>Staff account</small></div>${icon('chevron-down')}</button></div></header>${api.mode === 'mock' ? simulationBanner() : ''}<main id="content" tabindex="-1"><div class="loading">${icon('loader-circle')} Loading workspace…</div></main><footer class="app-footer"><span>© ${new Date().getFullYear()} Ikonectt</span><span>All times WAT</span></footer></div></div>`; refreshIcons(); revealActiveNavigation(); }
const content = () => document.querySelector<HTMLElement>('#content')!;
const heading = (title: string, description: string, action = '') => `<div class="page-heading"><div><div class="eyebrow">IKONECTT / ${route === 'dashboard' ? 'OVERVIEW' : esc(modules[route]?.group || 'WORKSPACE').toUpperCase()}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
function summaryCards(summary:C.Input<typeof C.Report>){
    const items:[string,string,string,number,boolean?][]=[
        ['customers','Total customers','users',summary.customers],['leads','Leads','contact',summary.leads],
        ['orders','Orders','shopping-bag',summary.orders],['tickets','Open support tickets','headphones',summary.openTickets],
        ['subscriptions','Active subscriptions','radio-tower',summary.subscriptionsByStatus.find(s=>s.status==='ACTIVE')?.count||0],
        ['payments','Verified payment total','credit-card',summary.confirmedPaymentsMinor,true]
    ];
    return items.map(([key,label,i,n,isMoney])=>`<a href="#/${can(api.permissions,modules[key].permission)?key:'reports'}" class="metric"><div><span>${label}</span>${icon(i)}</div><strong${isMoney?' class="metric-amount"':''}>${isMoney?money(n):n.toLocaleString()}</strong><small>${summary.includesSimulatedData?'Includes simulated data':'Backend summary'} ${icon('arrow-up-right')}</small></a>`).join('');
}
function authDialog(kind:'recovery'|'reset'){
    const isReset=kind==='reset';
    if(STANDALONE_DEMO){openModal(modalHeader('Account access unavailable','Standalone demonstration')+'<div class="modal-body"><p>Real sign-in, password setup and recovery are unavailable in this independent demonstration. No request is sent. Use Review the application to select a sample staff role.</p></div><footer class="modal-footer">'+button('Close','close')+'</footer>');return;}
    openModal(modalHeader(isReset?'Set your password':'Recover staff access','Shared identity service')+`<form id="auth-help-form"><div class="modal-body">${isReset?'<p>Enter your one-time setup or recovery code. Codes are not saved in this browser.</p><label>Setup or recovery code<input name="token" required minlength="32" maxlength="200" autocomplete="off" type="password"></label><label>New password<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label><label>Confirm new password<input name="confirmPassword" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label>':'<p>Enter your staff email. The response does not reveal whether an account exists or confirm message delivery.</p><label>Staff email<input name="email" type="email" required autocomplete="username"></label>'}<div class="form-error" role="alert"></div></div><footer class="modal-footer">${button('Cancel','close')}${!isReset?button('Use recovery code','reset-password'):''}<button class="btn primary" type="submit">${isReset?'Set password':'Request recovery'}</button></footer></form>`);
    document.querySelector<HTMLFormElement>('#auth-help-form')!.onsubmit=async e=>{
        e.preventDefault();const form=e.currentTarget as HTMLFormElement;const data=new FormData(form);const submit=form.querySelector<HTMLButtonElement>('button[type=submit]')!;submit.disabled=true;
        try{
            if(isReset){if(data.get('password')!==data.get('confirmPassword'))throw new Error('The new passwords do not match.');await api.resetPassword(String(data.get('token')),String(data.get('password')))}
            else await api.recover(String(data.get('email')));
            form.reset();closeModal();login(isReset?'Password set. Sign in with your new password.':'Recovery request acknowledged. Follow your approved recovery channel; contact your administrator if instructions do not arrive.');
        }catch(error){form.querySelector('.form-error')!.textContent=friendly(error)}finally{submit.disabled=false}
    };
}
async function issueCredentials(id:string){
    openModal(modalHeader('Issue a new setup token','Customer account security')+`<form id="credentials-form"><div class="modal-body"><p>This generates a new single-use setup token. Verify the customer’s identity and deliver it through an approved secure channel.</p><label class="check-label"><input type="checkbox" required>I have verified the customer and authorize this credential setup.</label><div class="form-error" role="alert"></div></div><footer class="modal-footer">${button('Cancel','close')}<button class="btn primary" type="submit">Issue token</button></footer></form>`);
    document.querySelector<HTMLFormElement>('#credentials-form')!.onsubmit=async e=>{e.preventDefault();const form=e.currentTarget as HTMLFormElement;const submit=form.querySelector<HTMLButtonElement>('button[type=submit]')!;submit.disabled=true;try{const result=await api.credentials(id);form.reset();openModal(modalHeader('Customer setup token','Shown once')+`<div class="modal-body"><p>Expires in ${result.setupExpiresInMinutes} minutes. Deliver through your approved secure channel. Closing this dialog removes the token from this page.</p><code class="secret">${esc(result.setupToken)}</code></div><footer class="modal-footer">${button('Done','close','primary')}</footer>`)}catch(error){form.querySelector('.form-error')!.textContent=friendly(error)}finally{submit.disabled=false}};
}
async function navigate() {
    if (!api.session) {
        login();
        if(location.hash==='#/reset-password')authDialog('reset');
        if(location.hash==='#/recovery')authDialog('recovery');
        return;
    }
    const hash = location.hash.replace(/^#\//, '');
    const next = hash.split('/')[0] || 'dashboard';
    // Fresh dashboard sessions start collapsed. Deep links and subsequent page changes
    // reveal their active parent, without forcing a group open after the user closes it.
    if ((!navigationStarted && next !== 'dashboard') || (navigationStarted && next !== route))
        expandedNavGroup = navigationEntries().find(entry => entry.key === next)?.group || null;
    navigationStarted = true;
    if (next !== route) {
        query = '';
        filter = '';
        page = 0;
    }
    route = next;
    const version = ++viewVersion;
    shell();
    try {
        if(api.mode==='live'){await api.validateSession();if(version!==viewVersion)return;shell()}
        if (api.session!.principal.mustChangePassword) {
            passwordSetup();
            return;
        }
        if (modules[route]) {
            api.assert(modules[route].permission);
            rows = await api.list(route);
            cache[route] = rows;
            if (version !== viewVersion)
                return;
            renderList();
        }
        else if (route === 'dashboard')
            await dashboard(version);
        else if (route === 'reports')
            await reports(version);
        else if (route === 'integrations')
            await integrations(version);
        else if (route === 'settings') {
            api.assert('staff.manage');
            settings();
        }
        else
            throw new Error('This page could not be found.');
        if (version === viewVersion) {
            refreshIcons();
            content().focus({ preventScroll: true });
        }
    }
    catch (e) {
        if (version === viewVersion && api.session) {
            content().innerHTML = heading('Unable to open this view', '') + `<div class="empty error-state">${icon('shield-alert')}<h2>${esc(friendly(e))}</h2><p>Your access and the service response determine which actions are available.</p>${button('Try again', 'refresh', '', 'refresh-cw')}<a href="#/dashboard" class="btn">Back to dashboard</a></div>`;
            refreshIcons();
        }
    }
}
async function loadRelated(key: string) {if(!can(api.permissions,modules[key].permission))return [];if(cache[key])return cache[key];return cache[key]=await api.list(key)}
function value(key: string, v: any) { if (v === null || v === undefined || v === '')
    return '<span class="muted">—</span>'; if (['priceMinor', 'renewalPriceMinor', 'amountMinor', 'confirmedPaymentsMinor'].includes(key))
    return `<strong class="money">${money(v)}</strong>`; if (key.endsWith('At'))
    return esc(date(v)); if (['status', 'eligibility', 'enabled'].includes(key))
    return badge(v); if (key === 'published')
    return badge(v ? 'PUBLISHED' : 'DRAFT'); if (key === 'accountNumberSimulated')return badge(v?'SIMULATED':'OFFICIAL'); if (key === 'simulated')
    return badge(v ? 'SIMULATED' : 'NATIVE'); if (key === 'speedMbps')
    return `${v} <span class="muted">Mbps</span>`; if (key === 'billingDays')
    return `${v} days`; if (key === 'roles')
    return esc(v.map(pretty).join(', ')); if (key === 'id')
    return `<code title="${esc(v)}">${esc(v.slice(0, 8))}…${esc(v.slice(-4))}</code>`; if (key.endsWith('Id')) {
    const ref = Object.values(cache).flat().find(r => r.id === v);
    return esc(ref?.name || ref?.subject || `${v.slice(0, 8)}…${v.slice(-4)}`);
} return esc(Array.isArray(v) ? v.join(', ') : typeof v === 'object' ? JSON.stringify(v) : v); }
async function dashboard(version: number) {
    const keys = Object.keys(modules).filter(k => !['audit', 'staff', 'provisioning','notifications'].includes(k) && can(api.permissions, modules[k].permission));
    const results = await Promise.allSettled(keys.map(k => loadRelated(k)));
    if (version !== viewVersion)
        return;
    const failures = results.flatMap((r, i) => r.status === 'rejected' ? [modules[keys[i]].label] : []);
    const defs = [['customers', 'Total customers', 'users', undefined], ['leads', 'New leads', 'contact', 'NEW'], ['orders', 'Pending orders', 'shopping-bag', 'PENDING_PAYMENT'], ['tickets', 'Open support tickets', 'headphones', 'OPEN'], ['subscriptions', 'Active subscriptions', 'radio-tower', 'ACTIVE'], ['payments', 'Payments to review', 'credit-card', 'REPORTED']] as const;
    let cards = defs.filter(([k]) => cache[k]&&can(api.permissions,modules[k].permission)).map(([k, label, i, status]) => { const count = status ? cache[k].filter(x => x.status === status).length : cache[k].length; return `<a href="#/${k}" class="metric"><div><span>${label}</span>${icon(i)}</div><strong>${count.toLocaleString()}</strong><small>${api.mode === 'mock' ? 'Sample records' : 'Backend records'} ${icon('arrow-up-right')}</small></a>`; }).join('');
    if(can(api.permissions,'reports.read')){try{const summary=await api.report();if(version!==viewVersion)return;cards=summaryCards(summary);if(summary.includesSimulatedData&&!document.querySelector('.demo-banner'))content().insertAdjacentHTML('beforebegin',simulationBanner());}catch(e){failures.push('Operational summary')}}
    const tasks = [['payments', 'payments.verify', 'Review reported payments', 'Verify transfer evidence before confirmation.', 'credit-card'], ['leads', 'leads.write', 'Follow up with new leads', 'Review enquiries awaiting follow-up.', 'contact'], ['tickets', 'support.write', 'Work the support queue', 'Review open requests and assignments.', 'headphones'], ['coverage', 'coverage.write', 'Review location eligibility', 'Resolve unknown or unverified addresses.', 'map-pin']].filter(([, p]) => can(api.permissions, p));
    const leads = can(api.permissions,'leads.read')?cache.leads?.slice(0, 4):undefined;
    content().innerHTML = heading('Operational Overview', `Current customers, orders and service activity.`, button('Refresh overview', 'refresh', '', 'refresh-cw')) + `<div class="overview-date">${icon('calendar-days')}<time>${new Intl.DateTimeFormat('en-NG', { dateStyle: 'full', timeZone: 'Africa/Lagos' }).format(new Date())}</time><span aria-hidden="true">•</span><small class="overview-context">${api.mode === 'mock' ? 'Sample workspace' : 'Current operational records'}</small></div>${failures.length ? `<div class="notice" role="alert">Could not load: ${esc(failures.join(', '))}. ${button('Retry', 'refresh')}</div>` : ''}${cards ? (cards.startsWith('<div class="notice">')?cards:`<section class="metrics">${cards}</section>`) : '<div class="notice">Your role has access to reporting. Open Reports for operational summaries.</div>'}<section class="dashboard-grid"><div class="panel queue-panel"><div class="panel-title"><div><span class="eyebrow">OPERATIONS</span><h2>Pending Actions</h2></div>${icon('arrow-up-right')}</div>${tasks.length ? tasks.map(([key, , title, desc, i], n) => `<a class="task" href="#/${key}"><span class="task-icon">${icon(i)}</span><div><strong>${title}</strong><p>${desc}</p></div><span class="task-number">0${n + 1}</span>${icon('chevron-right')}</a>`).join('') : '<p class="panel-pad">Operational actions are limited by your assigned role.</p>'}</div><div class="panel health-panel"><span class="eyebrow">FULFILLMENT</span><h2>Service Workflow</h2><p>Payment approval and service activation are separate steps.</p><ol class="workflow"><li><span>1</span><div><strong>Customer request</strong><small>Review plan and address eligibility</small></div></li><li><span>2</span><div><strong>Payment verification</strong><small>Authorized staff check the evidence</small></div></li><li><span>3</span><div><strong>Service fulfillment</strong><small>Confirmed through provisioning</small></div></li></ol><div class="quiet-note">${icon('shield-check')} Each sensitive action is permission controlled.</div></div></section>${leads ? `<section class="panel"><div class="panel-title"><div><span class="eyebrow">CUSTOMERS & SALES</span><h2>Recent leads</h2></div><a class="text-link" href="#/leads">View all leads ${icon('arrow-right')}</a></div>${table('leads', leads)}</section>` : ''}<section class="workspace-note">${icon('network')}<div><strong>${STANDALONE_DEMO ? 'Demonstration records' : 'Shared customer records'}</strong><p>${STANDALONE_DEMO ? 'This independent example does not synchronize with the separate customer portal.' : 'Customer and service records are shared across Ikonectt applications.'}</p></div></section>`;
}
function filtered() { return rows.filter(r => (!query || Object.values(r).some(v => String(v ?? '').toLowerCase().includes(query.toLowerCase()))) && (!filter || String(r[modules[route].status!]) === filter)); }
function table(key: string, data: RecordData[]) { const m = modules[key]; const numeric = new Set(['priceMinor', 'renewalPriceMinor', 'amountMinor', 'speedMbps', 'billingDays', 'attempts']); return `<div class="table-scroll" tabindex="0" role="region" aria-label="${esc(m.label)} table"><table><thead><tr>${m.columns.map(k => `<th scope="col" class="${numeric.has(k) ? 'numeric' : ''}">${labels[k] || pretty(k)}</th>`).join('')}<th scope="col"><span class="sr-only">Open details</span></th></tr></thead><tbody>${data.map(r => `<tr>${m.columns.map((k, i) => `<td class="${numeric.has(k) ? 'numeric' : ''}">${i === 0 ? `<button class="record-link" data-detail="${esc(r.id)}" data-module="${key}">${value(k, r[k])}</button>` : value(k, r[k])}</td>`).join('')}<td><button class="icon-btn" data-detail="${esc(r.id)}" data-module="${key}" aria-label="Open ${esc(r.name || r.subject || m.singular)}">${icon('arrow-up-right')}</button></td></tr>`).join('')}</tbody></table></div>`; }
function renderList() {
    const m = modules[route];
    const data = filtered();
    page = Math.min(page, Math.max(0, Math.ceil(data.length / 10) - 1));
    const statuses = m.status ? [...new Set(rows.map(r => String(r[m.status!])))].sort() : [];
    content().innerHTML = heading(m.label, m.description, m.input && can(api.permissions, m.write) ? button(`Create ${m.singular.toLowerCase()}`, 'create', 'primary', 'plus') : button('Refresh', 'refresh', '', 'refresh-cw')) + (route === 'coverage' ? '<div class="notice">Unknown coverage requires verification. Eligibility is managed at each location; a map is optional.</div>' : '') + `<section class="panel list-panel"><div class="list-toolbar"><label class="search">${icon('search')}<input id="search" type="search" placeholder="Search ${m.label.toLowerCase()}…" value="${esc(query)}" aria-label="Search ${m.label}"></label><div class="list-controls">${statuses.length ? `<label class="sr-only" for="status-filter">Filter status</label><select id="status-filter"><option value="">All ${m.status === 'eligibility' ? 'eligibilities' : m.status === 'published' ? 'availability' : m.status === 'enabled' ? 'access' : 'statuses'}</option>${statuses.map(s => `<option value="${esc(s)}" ${s === filter ? 'selected' : ''}>${s === 'true' ? 'Enabled / published' : s === 'false' ? 'Disabled / draft' : pretty(s)}</option>`).join('')}</select>` : ''}<span class="record-count">${data.length} records</span></div></div><div id="list-results">${data.length ? table(route, data.slice(page * 10, page * 10 + 10)) : `<div class="empty">${icon(query || filter ? 'search-x' : m.icon)}<h2>${query || filter ? 'No matching records' : `No ${m.label.toLowerCase()} yet`}</h2><p>${query || filter ? 'Try another search or clear your filters.' : 'Records will appear here when they are created in the shared service.'}</p>${query || filter ? button('Clear filters', 'clear') : ''}</div>`}</div><div class="pagination"><span>${data.length ? `${page * 10 + 1}–${Math.min(data.length, page * 10 + 10)} of ${data.length}` : '0 records'}</span><div>${button('Previous', 'previous', '', 'chevron-left')}<span>Page ${page + 1} of ${Math.max(1, Math.ceil(data.length / 10))}</span>${button('Next', 'next', '', 'chevron-right')}</div></div></section>${route === 'leads' ? '<p class="footnote">Enquiries use the shared lead queue. Assignment, private notes and follow-up activities await an approved backend contract.</p>' : route === 'tickets' ? `<p class="footnote">${STANDALONE_DEMO ? 'Messages update only this independent Admin demonstration. Private notes, category and priority are unavailable.' : 'Messages are shared with the customer. Private internal notes, category and priority are not yet supported by the backend.'}</p>` : ''}`;
    (document.querySelector('[data-action="previous"]') as HTMLButtonElement).disabled = page === 0;
    (document.querySelector('[data-action="next"]') as HTMLButtonElement).disabled = (page + 1) * 10 >= data.length;
    document.querySelector<HTMLInputElement>('#search')!.oninput = e => { const input = e.target as HTMLInputElement; const start = input.selectionStart; query = input.value; page = 0; renderList(); const next = document.querySelector<HTMLInputElement>('#search')!; next.focus(); try {
        next.setSelectionRange(start, start);
    }
    catch { } };
    const select = document.querySelector<HTMLSelectElement>('#status-filter');
    if (select)
        select.onchange = () => { filter = select.value; page = 0; renderList(); };
    refreshIcons();
}
function openModal(html: string, wide = false) { closeModal(); lastFocus = document.activeElement as HTMLElement; const el = document.createElement('div'); el.className = 'modal-overlay'; el.innerHTML = `<section class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">${html}</section>`; document.body.append(el); document.body.classList.add('modal-open'); refreshIcons(); (el.querySelector('input,select,textarea,button') as HTMLElement || el.querySelector('section') as HTMLElement).focus(); el.addEventListener('click', e => { if (e.target === el)
    closeModal(); }); }
function closeModal() { document.querySelector('.modal-overlay')?.remove(); document.body.classList.remove('modal-open'); lastFocus?.focus(); lastFocus = null; }
const modalHeader = (title: string, sub = '') => `<header class="modal-header"><div><span class="eyebrow">${esc(sub)}</span><h2 id="dialog-title">${esc(title)}</h2></div><button class="icon-btn" aria-label="Close dialog" data-action="close">${icon('x')}</button></header>`;
const walletUi = new WalletUi({ api, walletApi, openModal, closeModal, modalHeader, button, esc, money, badge, date, toast, friendly, refresh: async () => { cache = {}; await navigate(); }, details });
function fieldHtml(f: Field, r: RecordData) {
    const v = r[f.key];
    const id = `field-${f.key}`;
    let control = '';
    const req = f.required ? 'required' : '';
    if (f.type === 'roles')
        control = `<div class="role-options">${Object.keys(ROLE_PERMISSIONS).map(role => `<label><input type="checkbox" name="roles" value="${role}" ${v?.includes(role) ? 'checked' : ''}>${pretty(role)}</label>`).join('')}</div>`;
    else if (f.options)
        control = `<select id="${id}" name="${f.key}" ${req}>${f.options.map(o => `<option value="${o}" ${o === v ? 'selected' : ''}>${o === 'NGN' ? 'NGN' : pretty(o)}</option>`).join('')}</select>`;
    else if (f.type === 'checkbox')
        control = `<input id="${id}" name="${f.key}" type="checkbox" ${v ? 'checked' : ''}>`;
    else if (f.type === 'textarea')
        control = `<textarea id="${id}" name="${f.key}" rows="3" ${req}>${esc(Array.isArray(v) ? v.join('\n') : v)}</textarea>`;
    else {
        const refKey = { customerId: 'customers', planId: 'plans', buildingId: 'coverage', parentId: 'coverage', assignedToId: 'staff', orderId: 'orders', subscriptionId: 'subscriptions' }[f.key];
        const options = refKey ? cache[refKey] : undefined;
        control = options ? `<select id="${id}" name="${f.key}" ${req}><option value="">Select ${esc(f.label.toLowerCase())}</option>${options.filter(x => f.key !== 'buildingId' || x.level === 'BUILDING_ADDRESS').map(x => `<option value="${esc(x.id)}" ${x.id === v ? 'selected' : ''}>${esc(x.name || x.subject || x.planName || x.reference || x.id)}${f.key === 'orderId' ? ` · ${esc(x.id.slice(0, 8))}…${esc(x.id.slice(-6))} · ${esc(pretty(x.status))}` : ''}${x.level ? ` · ${pretty(x.level)}` : ''}</option>`).join('')}</select>` : `<input id="${id}" name="${f.key}" type="${f.type || 'text'}" ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.type === 'number' ? 'step="1"' : ''} ${f.type === 'password' ? 'autocomplete="new-password"' : 'autocomplete="off"'} value="${f.type === 'password' ? '' : esc(v)}" ${req}>`;
    }
    return `<div class="field ${f.type === 'textarea' || f.type === 'roles' ? 'span-2' : ''}"><label ${f.type === 'roles' ? '' : `for="${id}"`}>${esc(f.label)}${f.required ? '<span class="required"> *</span>' : ''}</label>${control}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
}
async function edit(key: string, id?: string) {
    const m = modules[key];
    try {
        api.assert(m.write || 'denied');
        await Promise.all(['customers', 'plans', 'coverage', 'staff', 'orders', 'subscriptions'].filter(k => can(api.permissions, modules[k].permission)).map(k => loadRelated(k)));
        if(['orders','coverage'].includes(key)){for(const k of ['plans','coverage'] as const){if(!cache[k])cache[k]=await api.publicOptions(k)}}
        if(key==='customers'&&!cache.coverage)cache.coverage=await api.publicOptions('coverage');
        const r = id ? await api.detail(key,id) : { kind: 'RESIDENTIAL', billingDays: 30, eligibility: 'UNKNOWN' };
        if (!r)
            throw new Error('Record not found.');
        if(key==='coverage'&&id&&r.level!=='BUILDING_ADDRESS')throw new Error('Final eligibility is managed at building/address level.');
        if(key==='provisioning'&&id&&(r.mode.toLowerCase()!=='manual'||r.status==='ACTIVE'))throw new Error('Only unfinished manual requests accept staff-recorded results.');
        const fields = id ? (m.editFields || m.fields) : m.fields;
        openModal(modalHeader(`${id ? 'Edit' : 'Create'} ${m.singular.toLowerCase()}`, m.label) + `<form id="record-form"><div class="form-grid">${fields.map(f => fieldHtml(f, r)).join('')}</div>${key === 'customers' && !id ? (STANDALONE_DEMO ? '<div class="notice">Creates a fictional customer and empty wallet in this demonstration only. No real account or password is created.</div>' : '<div class="notice">The backend creates the permanent customer ID and account number. Customer password setup follows the approved secure onboarding workflow.</div>') : ''}${key === 'provisioning' || key === 'staff' ? '<label class="check-label form-confirm"><input type="checkbox" required>I have reviewed this operational change and authorize it.</label>' : ''}<div class="form-error" id="form-error" role="alert"></div><footer class="modal-footer">${button('Cancel', 'close')}<button type="submit" class="btn primary">${id ? 'Save changes' : 'Create record'}</button></footer></form>`, true);
        if (key === 'coverage' && !id) {
            const level = document.querySelector<HTMLSelectElement>('[name=level]')!;
            const parent = document.querySelector<HTMLSelectElement>('[name=parentId]')!;
            const syncParent = () => { const atBuilding=level.value==='BUILDING_ADDRESS';const eligibility=document.querySelector<HTMLSelectElement>('[name=eligibility]')!;const planIds=document.querySelector<HTMLTextAreaElement>('[name=planIds]')!;eligibility.disabled=!atBuilding;planIds.disabled=!atBuilding;if(!atBuilding){eligibility.value='UNKNOWN';planIds.value='';} const levels = C.CoverageLevel.options; const preceding = levels[levels.indexOf(level.value as any) - 1]; parent.innerHTML = '<option value="">Select parent location</option>' + ((cache.coverage || []).filter(x => x.level === preceding).map(x => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')); parent.required = !!preceding; parent.disabled = !preceding; parent.closest('.field')!.toggleAttribute('hidden', !preceding); };
            level.onchange = syncParent;
            syncParent();
        }
        document.querySelector<HTMLFormElement>('#record-form')!.onsubmit = async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const fd = new FormData(form);
            const input: RecordData = {};
            for (const f of fields) {
                const v = fd.get(f.key);
                if(key==='coverage'&&((form.elements.namedItem('level') as HTMLSelectElement)?.value||r.level)!=='BUILDING_ADDRESS'&&['eligibility','planIds'].includes(f.key)){input[f.key]=f.key==='eligibility'?'UNKNOWN':[];continue}
                if (f.type === 'checkbox')
                    input[f.key] = fd.has(f.key);
                else if (f.type === 'roles')
                    input[f.key] = fd.getAll('roles');
                else if (f.type === 'number')
                    input[f.key] = f.key === 'renewalPriceMinor' && !String(v ?? '').trim() ? null : Number(v);
                else if (['features', 'planIds'].includes(f.key))
                    input[f.key] = String(v || '').split('\n').map(x => x.trim()).filter(Boolean);
                else if (v !== null && String(v).trim())
                    input[f.key] = String(v).trim();
            }
            const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
            submit.disabled = true;
            try {
                const result = await api.save(key, input, id);
                form.reset();
                closeModal();
                cache = {};
                toast(api.mode === 'mock' ? 'Sample record saved.' : 'Record saved.');
                await navigate();
                if (key === 'customers' && !id && result.setupToken && api.session)
                    openModal(modalHeader('Customer account created', 'Secure onboarding') + `<div class="modal-body"><p>Deliver this one-time setup token through an approved, verified channel. It is displayed once and expires after ${esc(result.setupExpiresInMinutes)} minutes.</p><code class="secret">${esc(result.setupToken)}</code><p>Account number: <strong>${esc(result.customer?.accountNumber || result.accountNumber)}</strong></p></div><footer class="modal-footer">${button('Done', 'close', 'primary')}</footer>`);
            }
            catch (err) {
                const target = document.querySelector('#form-error');
                if (target)
                    target.textContent = friendly(err);
                else
                    toast(friendly(err), true);
            }
            finally {
                submit.disabled = false;
            }
        };
    }
    catch (e) {
        toast(friendly(e), true);
    }
}
async function details(key: string, id: string) {
    const version = viewVersion;
    const session = api.session;
    try {
        api.assert(modules[key].permission);
        const r = await api.detail(key,id);
        if (!r)
            throw new Error('Record not found.');
        const m = modules[key];
        let extra = '';
        if (key === 'customers') {
            const related = await Promise.all(['orders', 'subscriptions', 'tickets'].map(async (k) => { if (!can(api.permissions, modules[k].permission))
                return ''; const list = (await api.list(k)).filter(x => x.customerId === id); return `<div class="related-block"><h3>${modules[k].label} <span>${list.length}</span></h3>${list.length ? list.map(x => `<button class="related-row" data-detail="${esc(x.id)}" data-module="${k}"><span>${esc(x.subject || x.planName || x.id)}</span>${badge(x.status)}${icon('arrow-up-right')}</button>`).join('') : '<p class="muted">No related records.</p>'}</div>`; }));
            const refs = can(api.permissions, 'integrations.read') ? await api.references(id) : 'Your role does not include integration references.';
            extra = (can(api.permissions,'customers.write')&&!STANDALONE_DEMO?button('Issue new setup token',`credentials:${id}`,'','lock-keyhole'):'')+(can(api.permissions,'wallet.read') ? await walletUi.customerSummary(id) : '') + related.join('') + `<div class="related-block"><h3>External CRM references</h3><pre>${esc(JSON.stringify(refs, null, 2))}</pre>${can(api.permissions, 'integrations.write') ? button('Link external reference', `reference:${id}`, '', 'plug') : ''}</div>`;
        }
        if (key === 'leads')
            extra = `<div class="notice">${r.buildingId ? 'Address-linked enquiry' : 'Address verification required'} · Source, assignment, notes and follow-ups await backend support.</div>${!r.customerId && can(api.permissions, 'customers.write') ? button('Create customer from lead', `convert:${id}`, 'primary', 'user-plus') : ''}`;
        if (key === 'orders')
            extra = `<div class="notice">Order: ${esc(pretty(r.status))}. Payment confirmation does not activate service. Provisioning is an independent authorized workflow.</div>${r.status==='PENDING_PAYMENT'&&can(api.permissions,'orders.write')?button('Report payment',`payment-report:${id}`,'','credit-card'):''}${can(api.permissions, 'provisioning.write') ? '<a class="btn" href="#/provisioning">Open provisioning workflow</a>' : ''}`;
        if (key === 'payments')
            extra = `<div class="notice">Verification records the staff identity, timestamp and evidence. Confirmation never activates a subscription.</div>${r.status === 'REPORTED' && can(api.permissions, 'payments.verify') ? button('Review payment', `verify:${id}`, 'primary', 'shield-check') : ''}${r.status === 'CONFIRMED' ? button('View receipt', `receipt:${id}`, '', 'receipt-text') : ''}`;
        if (key === 'subscriptions' && can(api.permissions, 'provisioning.write')) extra = walletUi.policyAction(r);
        if (key === 'walletTopUps') extra = walletUi.topUpActions(r);
        if (key === 'walletRenewals') extra = walletUi.renewalActions(r);
        if (key === 'tickets') {
            const messages = r.messages||await api.messages(id);
            extra = `<div class="related-block"><h3>Customer conversation</h3><p class="footnote">${STANDALONE_DEMO ? 'Replies update only this Admin demo; they are not sent to the separate customer portal.' : 'Messages here are visible to the customer. Private staff notes are unavailable.'}</p>${messages.map((msg: RecordData) => `<div class="message"><small>${esc(date(msg.createdAt))} · ${esc(msg.authorId)}</small><p>${esc(msg.message)}</p></div>`).join('') || '<p class="muted">No messages.</p>'}${can(api.permissions, 'support.write') ? `<form id="reply-form"><label>Reply to customer<textarea name="message" required maxlength="4000" rows="3"></textarea></label><button class="btn primary" type="submit">Send reply</button><div class="form-error" role="alert"></div></form>` : ''}</div>`;
        }
        if (viewVersion !== version || api.session !== session)
            return;
        openModal(modalHeader(r.name || r.subject || m.singular, m.label) + `<div class="modal-body"><dl class="detail-grid">${Object.entries(r).filter(([k]) => key !== 'tickets' || k !== 'messages').map(([k, v]) => `<div><dt>${key === 'provisioning' && k === 'reference' ? 'Provider reference' : labels[k] || pretty(k)}</dt><dd>${k === "id" ? `<code>${esc(v)}</code>` : value(k, v)}</dd></div>`).join('')}</dl>${extra}</div><footer class="modal-footer">${button('Close', 'close')}${m.update && can(api.permissions, m.write) && (key!=='coverage'||r.level==='BUILDING_ADDRESS') && (key!=='provisioning'||(r.mode.toLowerCase()==='manual'&&r.status!=='ACTIVE')) ? `<button class="btn primary" data-edit="${id}" data-module="${key}">${icon('pencil')}Edit ${m.singular.toLowerCase()}</button>` : ''}</footer>`, true);
        const form = document.querySelector<HTMLFormElement>('#reply-form');
        if (form)
            form.onsubmit = async (e) => { e.preventDefault(); const submit = form.querySelector('button')!; submit.disabled = true; try {
                await api.reply(id, String(new FormData(form).get('message')));
                toast(api.mode === 'mock' ? 'Sample reply added.' : 'Reply sent.');
                await details(key, id);
            }
            catch (err) {
                form.querySelector('.form-error')!.textContent = friendly(err);
            }
            finally {
                submit.disabled = false;
            } };
    }
    catch (e) {
        toast(friendly(e), true);
    }
}
async function verify(id: string) {
    openModal(modalHeader('Review payment', 'Authorized financial verification') + `<form id="verify-form"><div class="modal-body"><p>Check bank evidence before confirming or rejecting this payment. This action is audited and cannot be repeated.</p><label>Decision<select name="decision"><option value="CONFIRMED">Confirm payment</option><option value="REJECTED">Reject payment</option></select></label><label>Verification evidence<textarea name="evidence" required minlength="3" maxlength="2000" rows="4" placeholder="Bank evidence and review reference"></textarea></label><label class="check-label"><input type="checkbox" required>I have checked the evidence and authorize this decision.</label><div class="form-error" role="alert"></div></div><footer class="modal-footer">${button('Cancel', 'close')}<button class="btn primary" type="submit">Record decision</button></footer></form>`);
    document.querySelector<HTMLFormElement>('#verify-form')!.onsubmit = async (e) => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const fd = new FormData(form); const b = form.querySelector<HTMLButtonElement>('button[type=submit]')!; b.disabled = true; try {
        await api.verify(id, { decision: fd.get('decision'), evidence: fd.get('evidence') });
        closeModal();
        cache = {};
        toast('Decision recorded. Service activation is unchanged.');
        await navigate();
    }
    catch (err) {
        form.querySelector('.form-error')!.textContent = friendly(err);
    }
    finally {
        b.disabled = false;
    } };
}
async function reports(version: number) { const r = await api.report(); if (version !== viewVersion)
    return; content().innerHTML = heading('Operational reports', 'Current application records. Provider revenue, usage and network performance are unavailable.', button('Refresh report', 'refresh', '', 'refresh-cw')) + `${r.includesSimulatedData ? '<div class="notice">This report includes simulated data.</div>' : ''}<section class="metrics">${[['Customers', r.customers], ['Leads', r.leads], ['Orders', r.orders], ['Open tickets', r.openTickets]].map(([name, n]) => `<div class="metric"><div><span>${name}</span>${icon('chart-no-axes-column')}</div><strong>${n}</strong><small>Current records</small></div>`).join('')}</section><section class="dashboard-grid"><div class="panel panel-pad"><span class="eyebrow">SERVICE DISTRIBUTION</span><h2>Subscriptions by status</h2><div class="bar-chart">${r.subscriptionsByStatus.map((x: any) => `<div><span>${pretty(x.status)}</span><meter min="0" max="${Math.max(1, ...r.subscriptionsByStatus.map((s: any) => s.count))}" value="${x.count}">${x.count}</meter><strong>${x.count}</strong></div>`).join('')}</div></div><div class="panel panel-pad"><span class="eyebrow">FINANCIAL VERIFICATION</span><h2>Confirmed payment records</h2><div class="report-money">${money(r.confirmedPaymentsMinor)}</div><p class="muted">Sum of confirmed payments in the application. Settlement, revenue recognition and external billing are outside this report.</p></div></section>`; }
async function integrations(version: number) { const response = await api.integrations(); if (version !== viewVersion)
    return; const list:RecordData[] = Array.isArray(response) ? response : Object.entries(response).map(([name, v]) => ({ name, ...(typeof v === 'object' ? v as object : { mode: v }) })); content().innerHTML = heading('Integrations', 'Provider connections and application capabilities, as reported by the shared service.', button('Refresh status', 'refresh', '', 'refresh-cw')) + `<div class="integration-grid">${list.map((x: RecordData) => { const { status, message } = integrationState(x); return `<section class="panel integration-card"><div class="integration-icon">${icon('plug')}</div>${badge(status)}<h2>${esc(x.name === 'paymentSettlement' ? 'Payment settlement' : pretty(x.name || x.provider || x.key))}</h2><p>${esc(message)}</p><dl><dt>Mode</dt><dd>${esc(x.mode || status)}</dd></dl></section>`; }).join('')}</div><p class="footnote">Credentials and infrastructure configuration stay on the server. A simulated provider is never a live production connection.</p>`; }
function settings() { content().innerHTML = heading('Workspace settings', 'Application configuration and the access model for this workspace.') + `<section class="panel panel-pad"><span class="eyebrow">ACCESS CONTROL</span><h2>Shared role permissions</h2><p>${STANDALONE_DEMO ? 'Sample permissions illustrate the existing staff roles within this independent demonstration.' : 'Permissions below are synchronized from Agent 1’s backend. Live access uses the server’s permissions endpoint. Role changes are available under Staff & Roles.'}</p><div class="permission-grid">${Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => `<div><h3>${pretty(role)}</h3><ul>${permissions.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div></section><section class="panel panel-pad settings-note"><h2>Operational configuration</h2><p>The approved API currently provides integration status and role assignment. It does not expose editable operational settings, custom role definitions or provider credentials. These settings require Agent 1’s contract before they can be edited.</p></section>`; }
function passwordSetup() { content().innerHTML = heading('Update your staff password', 'Your account requires a password change before accessing operational data.') + `<form class="panel panel-pad compact-form" id="change-password"><label>Current password<input type="password" name="currentPassword" required autocomplete="current-password"></label><label>New password<input type="password" name="password" required minlength="12" maxlength="128" autocomplete="new-password"></label><div class="form-error" role="alert"></div><button class="btn primary">Update password</button></form>`; document.querySelector<HTMLFormElement>('#change-password')!.onsubmit = async (e) => { e.preventDefault(); const f = e.currentTarget as HTMLFormElement; try {
    const data = C.ChangePasswordRequest.parse(Object.fromEntries(new FormData(f)));
    await api.changePassword(data.currentPassword,data.password);
    api.clear();
    cache = {};
    login('Password updated. Sign in with your new password.');
}
catch (err) {
    f.querySelector('.form-error')!.textContent = friendly(err);
} }; }
document.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-detail],[data-edit]');
    if (!target)
        return;
    if (target.dataset.detail) {
        await details(target.dataset.module!, target.dataset.detail);
        return;
    }
    if (target.dataset.edit) {
        await edit(target.dataset.module!, target.dataset.edit);
        return;
    }
    const action = target.dataset.action!;
    if (target.tagName === 'A' && ['recovery', 'reset-password'].includes(action)) e.preventDefault();
    if (action.startsWith('wallet:')) { await walletUi.action(action); return; }
    if (action === 'close')
        closeModal();
    else if (action === 'preview' && __IKONECTT_PREVIEW__) {
        api.preview((document.querySelector('#preview-role') as HTMLSelectElement).value as StaffRole);
        cache = {};
        const deepRoute=location.hash.replace(/^#\//,'').split('/')[0];
        const entry=navigationEntries().find(e=>e.key===deepRoute);
        if(!STANDALONE_DEMO||!entry||(entry.permission&&!can(api.permissions,entry.permission)))location.hash = '#/dashboard';
        await navigate();
    }
    else if (action === 'recovery')authDialog('recovery');
    else if (action === 'reset-password')authDialog('reset');
    else if (action.startsWith('payment-report:')){const order=await api.detail('orders',action.slice(15));await edit('payments');const form=document.querySelector<HTMLFormElement>('#record-form');if(form){for(const key of ['orderId','amountMinor','currency']){const input=form.elements.namedItem(key) as HTMLInputElement;input.value=String(key==='orderId'?order.id:order[key]);}}}
    else if (action.startsWith('credentials:'))await issueCredentials(action.slice(12));
    else if (action === 'password') {
        const input = document.querySelector<HTMLInputElement>('input[name=password]')!;
        input.type = input.type === 'password' ? 'text' : 'password';
        target.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
        target.innerHTML = icon(input.type === 'password' ? 'eye' : 'eye-off');
        refreshIcons();
    }
    else if (action === 'nav-group') {
        const group = target.dataset.group!;
        expandedNavGroup = expandedNavGroup === group ? null : group;
        document.querySelectorAll<HTMLButtonElement>('.nav-group-toggle').forEach(toggle => {
            const expanded = toggle.dataset.group === expandedNavGroup;
            toggle.setAttribute('aria-expanded', String(expanded));
            document.getElementById(toggle.getAttribute('aria-controls')!)!.hidden = !expanded;
        });
    }
    else if (action === 'menu') {
        const open = document.querySelector('#sidebar')!.classList.toggle('open');
        target.setAttribute('aria-expanded', String(open));
    }
    else if (action === 'refresh'){cache={};await navigate();}
    else if (action === 'clear') {
        query = '';
        filter = '';
        page = 0;
        renderList();
    }
    else if (action === 'next') {
        page++;
        renderList();
    }
    else if (action === 'previous') {
        page--;
        renderList();
    }
    else if (action === 'create')
        await edit(route);
    else if (action === 'account')
        openModal(modalHeader('Your staff account', 'Workspace access') + `<div class="modal-body"><p>Role: <strong>${pretty(api.session!.principal.roles.join(', '))}</strong></p><p>${api.mode === 'mock' ? 'Sample session. No staff credentials were used.' : 'Your session token is held only in memory.'}</p><p>Expires ${esc(new Date(api.session!.expiresAt).toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' }))} WAT</p><div class="account-theme">${themeControl()}</div></div><footer class="modal-footer">${button('Close', 'close')}${button(STANDALONE_DEMO ? 'Exit demonstration' : 'Sign out', 'logout', 'primary', 'log-out')}</footer>`);
    else if (action === 'logout') {
        try {
            await api.logout();
            toast('Signed out.');
        }
        catch (e) {
            toast('Local session cleared. The backend could not confirm revocation.', true);
        }
        finally {
            cache = {};
            closeModal();
            login();
        }
    }
    else if (action.startsWith('verify:'))
        await verify(action.slice(7));
    else if (action.startsWith('reference:')) {
        const id = action.slice(10);
        openModal(modalHeader('Link external reference', 'Customer integration') + `<form id="reference-form"><div class="modal-body"><label>External system<input name="system" required maxlength="250"></label><label>Verified external ID<input name="externalId" required maxlength="250"></label><div class="form-error" role="alert"></div></div><footer class="modal-footer">${button('Cancel', 'close')}<button class="btn primary" type="submit">Link reference</button></footer></form>`);
        document.querySelector<HTMLFormElement>('#reference-form')!.onsubmit = async (e) => { e.preventDefault(); const form = e.currentTarget as HTMLFormElement; const b = form.querySelector<HTMLButtonElement>('button[type=submit]')!; b.disabled = true; try {
            await api.linkReference(id, Object.fromEntries(new FormData(form)));
            toast('Reference linked.');
            await details('customers', id);
        }
        catch (err) {
            form.querySelector('.form-error')!.textContent = friendly(err);
        }
        finally {
            b.disabled = false;
        } };
    }
    else if (action.startsWith('receipt:')) {
        try {
            const receipt = await api.receipt(action.slice(8));
            openModal(modalHeader('Payment receipt', receipt.receiptNumber) + `<div class="modal-body receipt"><img data-theme-logo src="${themeLogo()}" alt="Ikonectt">${api.mode === 'mock' ? badge('SIMULATED') : ''}<strong>${money(receipt.payment.amountMinor)}</strong><dl><dt>Reference</dt><dd>${esc(receipt.payment.reference)}</dd><dt>Issued</dt><dd>${esc(date(receipt.issuedAt))}</dd><dt>Customer ID</dt><dd>${esc(receipt.payment.customerId)}</dd></dl></div><footer class="modal-footer">${button('Close', 'close')}</footer>`);
        }
        catch (err) {
            toast(friendly(err), true);
        }
    }
    else if (action.startsWith('convert:')) {
        const lead = cache.leads?.find(x => x.id === action.slice(8));
        if (!lead)
            return;
        await edit('customers');
        const form = document.querySelector<HTMLFormElement>('#record-form');
        if (form) {
            for (const key of ['name', 'email', 'phone', 'kind','buildingId']) {
                const input = form.elements.namedItem(key) as HTMLInputElement;
                if (input&&lead[key])
                    input.value = lead[key];
            }
            const note = document.createElement('p');
            note.className = 'notice';
            note.textContent = 'After creating the customer, edit this lead and select the customer to link its operational history.';
            form.prepend(note);
        }
    }
});
document.addEventListener('keydown', e => { const modal = document.querySelector<HTMLElement>('.modal'); if (!modal)
    return; if (e.key === 'Escape')
    closeModal(); if (e.key === 'Tab') {
    const controls = [...modal.querySelectorAll<HTMLElement>('button:not(:disabled),a,input,select,textarea,[tabindex="0"]')];
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
    }
} });
window.addEventListener('hashchange', () => { closeModal(); void navigate(); });
window.addEventListener('focus',()=>{if(api.session&&api.mode==='live')void api.validateSession().catch(error=>{if(api.session)toast(friendly(error),true)})});
setInterval(() => { if (api.session && Date.parse(api.session.expiresAt) <= Date.now()) {
    api.clear();
    api.onExpired();
} }, 10000);
login();
