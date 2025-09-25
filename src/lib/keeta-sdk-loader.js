// KeetaNet SDK Loader for Chrome Extension
// Properly loads CommonJS browser bundle and exposes as global KeetaNet

(function() {
  'use strict';
  
  console.log('🔧 [SDK] Starting KeetaNet SDK loader...');
  
  // Create module context before loading the script
  const originalModule = window.module;
  const originalRequire = window.require;
  const originalExports = window.exports;
  
  // Set up CommonJS environment
  window.module = { exports: {} };
  window.exports = window.module.exports;
  window.require = function(id) {
    console.log('Mock require called for:', id);
    return {};
  };
  
  // Create script element
  const script = document.createElement('script');
  script.src = '../../node_modules/@keetanetwork/keetanet-client/client/index-browser.js';
  
  script.onload = function() {
    console.log('🔧 [SDK] KeetaNet browser bundle loaded');
    
    try {
      // Capture the module.exports from the loaded script
      const KeetaNetSDK = window.module.exports;
      
      // Restore original globals
      window.module = originalModule;
      window.require = originalRequire;
      window.exports = originalExports;
      
      if (KeetaNetSDK && typeof KeetaNetSDK === 'object') {
        // Expose as global KeetaNet (match KSwap pattern)
        window.KeetaNet = KeetaNetSDK;
        console.log('✅ [SDK] KeetaNet available as window.KeetaNet');
        console.log('🔍 [SDK] Available modules:', Object.keys(KeetaNetSDK));
        console.log('🔍 [SDK] Has lib?', !!KeetaNetSDK.lib);
        console.log('🔍 [SDK] Has UserClient?', !!KeetaNetSDK.UserClient);
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('keetanet-loaded', {
          detail: { available: true }
        }));
        
      } else {
        throw new Error('KeetaNet SDK not properly exported');
      }
      
    } catch (error) {
      console.error('❌ [SDK] Failed to set up KeetaNet global:', error);
      
      // Restore original globals on error
      window.module = originalModule;
      window.require = originalRequire;
      window.exports = originalExports;
      
      window.dispatchEvent(new CustomEvent('keetanet-error', {
        detail: { error: error.message }
      }));
    }
  };
  
  script.onerror = function() {
    console.error('❌ [SDK] Failed to load KeetaNet browser bundle');
    
    // Restore original globals on error
    window.module = originalModule;
    window.require = originalRequire;
    window.exports = originalExports;
    
    window.dispatchEvent(new CustomEvent('keetanet-error', {
      detail: { error: 'Failed to load SDK bundle' }
    }));
  };
  
  // Add to document head
  console.log('📦 [SDK] Loading browser bundle...');
  document.head.appendChild(script);
})();
