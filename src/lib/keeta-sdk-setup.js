// KeetaNet SDK Setup for Chrome Extension
// Sets up CommonJS environment and loads browser bundle

(function() {
  'use strict';
  
  console.log('🔧 [SDK] Starting KeetaNet SDK setup...');
  
  // Set up CommonJS environment BEFORE loading the SDK
  window.module = { exports: {} };
  window.exports = window.module.exports;
  window.require = function(id) {
    console.log('Mock require called for:', id);
    // Return empty object for missing modules
    return {};
  };
  
  // Load the browser bundle immediately
  const script = document.createElement('script');
  script.src = '../lib/keetanet-browser.js';
  
  script.onload = function() {
    console.log('🔧 [SDK] KeetaNet browser bundle loaded');
    
    try {
      // Capture the CommonJS exports
      const KeetaNetSDK = window.module.exports;
      
      if (KeetaNetSDK && typeof KeetaNetSDK === 'object') {
        // Expose as global window.KeetaNet
        window.KeetaNet = KeetaNetSDK;
        console.log('✅ [SDK] KeetaNet available as window.KeetaNet');
        console.log('🔍 [SDK] Available modules:', Object.keys(KeetaNetSDK));
        console.log('🔍 [SDK] Has lib?', !!KeetaNetSDK.lib);
        console.log('🔍 [SDK] Has UserClient?', !!KeetaNetSDK.UserClient);
        
        // Clean up CommonJS globals
        delete window.module;
        delete window.exports;
        delete window.require;
        
        // Notify that SDK is ready
        window.dispatchEvent(new CustomEvent('keetanet-loaded', {
          detail: { available: true }
        }));
        
      } else {
        throw new Error('KeetaNet SDK exports not found');
      }
      
    } catch (error) {
      console.error('❌ [SDK] Failed to set up KeetaNet:', error);
      
      // Clean up on error
      delete window.module;
      delete window.exports; 
      delete window.require;
      
      window.dispatchEvent(new CustomEvent('keetanet-error', {
        detail: { error: error.message }
      }));
    }
  };
  
  script.onerror = function() {
    console.error('❌ [SDK] Failed to load KeetaNet browser bundle');
    
    // Clean up on error
    delete window.module;
    delete window.exports;
    delete window.require;
    
    window.dispatchEvent(new CustomEvent('keetanet-error', {
      detail: { error: 'Failed to load SDK script' }
    }));
  };
  
  // Add to document head
  console.log('📦 [SDK] Loading KeetaNet browser bundle...');
  document.head.appendChild(script);
})();
