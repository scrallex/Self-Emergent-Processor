const lavaLampEffect = () => {
    const palettes = {
        light: {
            '--dark': '#f4f7fc',
            '--light': '#1a202c',
            '--gray': '#5a667d',
            'nav-bg': 'rgba(255, 255, 255, 0.7)',
            'border': 'rgba(0, 0, 0, 0.08)',
            'card-bg': '#ffffff',
            'card-shadow': '0 4px 6px rgba(0,0,0,0.05)'
        },
        dark: {
            '--dark': '#0a0a0a',
            '--light': '#ffffff',
            '--gray': '#888',
            'nav-bg': 'rgba(10, 10, 10, 0.8)',
            'border': 'rgba(255, 255, 255, 0.1)',
            'card-bg': 'rgba(255, 255, 255, 0.03)',
            'card-shadow': 'none'
        }
    };

    let isLight = true;
    const root = document.documentElement;

    const applyTheme = (theme) => {
        for (const [key, value] of Object.entries(theme)) {
            root.style.setProperty(key, value);
        }
        // Special handling for elements not easily targetable by CSS variables
        document.querySelector('nav').style.background = theme['nav-bg'];
        document.querySelector('nav').style.borderColor = theme['border'];
        document.querySelectorAll('.tech-card').forEach(card => {
            card.style.background = theme['card-bg'];
            card.style.borderColor = theme['border'];
            card.style.boxShadow = theme['card-shadow'];
        });
        document.querySelector('footer').style.borderColor = theme['border'];
    };

    const transitionTheme = () => {
        const nextTheme = isLight ? palettes.dark : palettes.light;
        
        document.body.style.transition = 'background-color 5s ease-in-out, color 5s ease-in-out';
        
        root.style.setProperty('--dark', nextTheme['--dark']);
        root.style.setProperty('--light', nextTheme['--light']);
        root.style.setProperty('--gray', nextTheme['--gray']);

        setTimeout(() => {
            applyTheme(nextTheme);
            document.body.style.transition = '';
        }, 5000);

        isLight = !isLight;
    };

    setInterval(() => {
        applyTheme(palettes.light);
        isLight = true;
        
        setTimeout(transitionTheme, 1000);
    }, 15000);

    applyTheme(palettes.light);
    setTimeout(transitionTheme, 1000);
};

lavaLampEffect();