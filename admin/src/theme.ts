export type ThemePreference = 'light' | 'dark' | 'system';
declare global {
    interface Window {
        ikonecttTheme: {readonly preference: ThemePreference; setPreference(value: ThemePreference): void};
    }
}

export const themeLogo = () => document.documentElement.dataset.theme === 'dark' ? '/admin/logo-white.png' : '/admin/logo-red.png';

export function themeControl() {
    const preference = window.ikonecttTheme?.preference || 'light';
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<label class="theme-control" title="Color theme"><i data-lucide="${dark ? 'moon' : 'sun'}" aria-hidden="true"></i><span class="sr-only">Color theme</span><select data-theme-select aria-label="Color theme">${(['light', 'dark', 'system'] as const).map(value => `<option value="${value}"${preference === value ? ' selected' : ''}>${value[0].toUpperCase() + value.slice(1)}</option>`).join('')}</select></label>`;
}

export function bindThemeControls(refreshIcons: () => void) {
    document.addEventListener('change', event => {
        const select = event.target;
        if (select instanceof HTMLSelectElement && select.matches('[data-theme-select]'))
            window.ikonecttTheme.setPreference(select.value as ThemePreference);
    });
    window.addEventListener('ikonectt-theme-change', () => {
        document.querySelectorAll<HTMLSelectElement>('[data-theme-select]').forEach(select => {
            select.value = window.ikonecttTheme.preference;
            const control = select.closest('.theme-control')!;
            const icon = document.createElement('i');
            icon.dataset.lucide = document.documentElement.dataset.theme === 'dark' ? 'moon' : 'sun';
            icon.setAttribute('aria-hidden', 'true');
            control.querySelector('svg, i')?.replaceWith(icon);
        });
        document.querySelectorAll<HTMLImageElement>('img[data-theme-logo]').forEach(img => img.src = themeLogo());
        refreshIcons();
    });
}
