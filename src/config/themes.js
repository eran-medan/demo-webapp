const themes = {
  light: {
    name: 'Light',
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      primary: '#0066cc',
      primaryHover: '#0052a3',
      secondary: '#6c757d',
      text: '#212529',
      textMuted: '#6c757d',
      border: '#dee2e6',
      error: '#dc3545',
      success: '#198754',
      warning: '#ffc107',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      background: '#1a1a2e',
      surface: '#16213e',
      primary: '#4da6ff',
      primaryHover: '#80bfff',
      secondary: '#adb5bd',
      text: '#e9ecef',
      textMuted: '#adb5bd',
      border: '#2d3748',
      error: '#f87171',
      success: '#34d399',
      warning: '#fbbf24',
    },
  },
  midnight: {
    name: 'Midnight',
    colors: {
      background: '#0d1117',
      surface: '#161b22',
      primary: '#58a6ff',
      primaryHover: '#79c0ff',
      secondary: '#8b949e',
      text: '#c9d1d9',
      textMuted: '#8b949e',
      border: '#30363d',
      error: '#f85149',
      success: '#3fb950',
      warning: '#d29922',
    },
  },
};

const getTheme = (themeName) => {
  return themes[themeName] || themes.light;
};

const getAvailableThemes = () => {
  return Object.entries(themes).map(([key, theme]) => ({
    id: key,
    name: theme.name,
  }));
};

module.exports = { themes, getTheme, getAvailableThemes };
