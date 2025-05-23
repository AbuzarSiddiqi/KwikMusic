document.addEventListener('DOMContentLoaded', function() {
    // Handle orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Initial check
    handleOrientationChange();
    
    // Fix for Safari bottom bar issues
    if (isIOS()) {
        applyIOSFixes();
    }
    
    // Prevent bounce effect on iOS
    document.body.addEventListener('touchmove', function(e) {
        if (document.documentElement.classList.contains('lock-scroll')) {
            e.preventDefault();
        }
    }, { passive: false });

    // PWA Installation handling
    initializePWA();
});

function handleOrientationChange() {
    // Force redraw on orientation change to fix layout issues
    setTimeout(function() {
        // Force layout recalculation
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Adjust any problematic elements after orientation change
        const images = document.querySelectorAll('.responsive-image');
        images.forEach(img => {
            img.style.height = 'auto'; // Reset height to auto for proper scaling
        });
    }, 300); // Short delay to allow orientation to complete
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function applyIOSFixes() {
    // Add iOS-specific class
    document.documentElement.classList.add('ios');
    
    // Fix for bottom fluctuation in Safari
    const bottomElements = document.querySelectorAll('.player-controls, .bottom-nav');
    bottomElements.forEach(el => {
        el.classList.add('fixed-bottom-element');
    });
    
    // Add padding to content to prevent it from being hidden under the bottom bar
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }
}

// Add PWA installation functionality
let deferredPrompt;

function initializePWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show install button or banner
        showInstallPromotion();
    });

    // Listen for the app being installed
    window.addEventListener('appinstalled', (e) => {
        console.log('PWA was installed');
        hideInstallPromotion();
        deferredPrompt = null;
    });

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        console.log('App is running in standalone mode');
        hideInstallPromotion();
    }
}

function showInstallPromotion() {
    // Create install button if it doesn't exist
    let installBtn = document.getElementById('installBtn');
    if (!installBtn) {
        installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            background: linear-gradient(135deg, rgba(255, 200, 0, 0.9), rgba(255, 140, 0, 0.9));
            color: #000;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', installPWA);
        document.body.appendChild(installBtn);
    }
    installBtn.style.display = 'block';
}

function hideInstallPromotion() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

async function installPWA() {
    if (deferredPrompt) {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        // Hide the install button
        hideInstallPromotion();
    }
}
