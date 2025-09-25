// KeetaNet SDK Loader for Chrome Extension
// Loads the browser bundle and exposes it as global KeetaNet

(function() {
  'use strict';
  
  // Create a script element to load the KeetaNet browser bundle
  const script = document.createElement('script');
  script.src = '../../node_modules/@keetanetwork/keetanet-client/client/index-browser.js';
  
  script.onload = function() {
    console.log('🔧 [SDK] KeetaNet browser bundle loaded');
    
    // The browser bundle uses module.exports, so we need to capture it
    // Create a temporary module context to extract the exports
    try {
      // Create a mock module context
      const moduleContext = {
        exports: {},
        module: { exports: {} }
      };
      
      // The bundle should have populated module.exports
      // Try to access it from the global context
      if (typeof module !== 'undefined' && module.exports) {
        window.KeetaNet = module.exports;
        console.log('✅ [SDK] KeetaNet available as window.KeetaNet');
        console.log('🔍 [SDK] Available modules:', Object.keys(window.KeetaNet));
      } else {
        console.warn('⚠️ [SDK] Module exports not found, checking for other globals...');
        
        // Check for other possible global names
        const possibleNames = ['KeetaNetSDK', 'KeetaNet', 'KEETANET', 'keetanet'];
        for (const name of possibleNames) {
          if (window[name]) {
            window.KeetaNet = window[name];
            console.log(`✅ [SDK] Found KeetaNet as window.${name}`);
            break;
          }
        }
      }
      
      // Dispatch event to notify that SDK is loaded
      window.dispatchEvent(new CustomEvent('keetanet-loaded', {
        detail: { available: !!window.KeetaNet }
      }));
      
    } catch (error) {
      console.error('❌ [SDK] Failed to set up KeetaNet global:', error);
      window.dispatchEvent(new CustomEvent('keetanet-error', {
        detail: { error: error.message }
      }));
    }
  };
  
  script.onerror = function() {
    console.error('❌ [SDK] Failed to load KeetaNet browser bundle');
    window.dispatchEvent(new CustomEvent('keetanet-error', {
      detail: { error: 'Failed to load SDK bundle' }
    }));
  };
  
  // Add to document head
  document.head.appendChild(script);
})();
