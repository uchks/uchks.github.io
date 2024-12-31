// Constants for commonly used values
const COOKIE_NAME = 'user-prefers-dark';
const COOKIE_DURATION = 7;
const THEME = {
  DARK: 'dark-mode',
  LIGHT: 'light-mode'
};

class CookieManager {
  static set(name, value, days) {
    try {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      
      const options = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        `expires=${date.toUTCString()}`,
        'path=/',
        'SameSite=Lax',
        'Secure'
      ].join('; ');

      document.cookie = options;
      return true;
    } catch (error) {
      console.error('Error setting cookie:', error);
      return false;
    }
  }

  static get(name) {
    try {
      const cookieName = encodeURIComponent(name) + '=';
      const cookies = document.cookie.split(';');
      
      for (const cookie of cookies) {
        let c = cookie.trim();
        if (c.indexOf(cookieName) === 0) {
          return decodeURIComponent(c.substring(cookieName.length));
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  }
}

class ThemeManager {
  constructor() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.initialize();
    this.setupEventListeners();
  }

  initialize() {
    const savedPreference = CookieManager.get(COOKIE_NAME);
    const shouldUseDark = savedPreference !== null 
      ? savedPreference === 'true'
      : this.mediaQuery.matches;

    this.setTheme(shouldUseDark);
  }

  setupEventListeners() {
    this.mediaQuery.addEventListener('change', (e) => {
      if (CookieManager.get(COOKIE_NAME) === null) {
        this.setTheme(e.matches);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  setTheme(isDark) {
    const { body } = document;
    const { DARK, LIGHT } = THEME;

    body.classList.remove(isDark ? LIGHT : DARK);
    body.classList.add(isDark ? DARK : LIGHT);
    CookieManager.set(COOKIE_NAME, isDark.toString(), COOKIE_DURATION);
    
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { isDark } 
    }));
  }

  toggleTheme() {
    this.setTheme(!document.body.classList.contains(THEME.DARK));
  }
}

const initializeTheme = () => {
  const themeManager = new ThemeManager();
  
  window.toggleMode = () => themeManager.toggleTheme();
  
  requestAnimationFrame(() => {
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTheme);
} else {
  initializeTheme();
}