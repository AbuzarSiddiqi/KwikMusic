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
