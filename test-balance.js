// Quick test to verify balance fetching with your funded wallet
const KeetaNet = require('@keetanetwork/keetanet-client');

async function testBalance() {
  try {
    console.log('🧪 Testing balance for your funded wallet...');
    
    // Your exact funded wallet seed  
    const seed = '512FE49DC49C486057E4AE1AC8AA6F75214C0ED010581B2E15A951F208240C22';
    const account = KeetaNet.lib.Account.fromSeed(seed, 0);
    
    console.log(`👛 Wallet: ${account.publicKeyString.get()}`);
    console.log(`📧 Expected: keeta_aabaeenxurt2cvnpqeunx65f6x247tmo2jjnkmmppadtwvysry7jzbph5fn3dnq`);
    
    // Connect to testnet with updated configuration
    console.log('🌐 Connecting to testnet with updated endpoint...');
    const client = KeetaNet.UserClient.fromNetwork('test', account);
    
    // Debug client state
    console.log('🔍 Client created, checking baseToken...');
    console.log('🔍 BaseToken:', client.baseToken);
    console.log('🔍 BaseToken type:', typeof client.baseToken);
    
    // Verify connection
    const chainInfo = await client.chain();
    console.log('🔍 Chain info:', chainInfo);
    
    // Check baseToken after chain() call
    console.log('🔍 BaseToken after chain():', client.baseToken);
    console.log('🔍 BaseToken publicKeyString:', client.baseToken?.publicKeyString?.get?.());
    
    // Check balance (exact DLhugly pattern)
    const baseToken = client.baseToken;
    const balance = await client.balance(baseToken);
    
    console.log(`💰 Balance: ${balance} KTA`);
    console.log(`🎯 Status: ${balance > 0 ? 'FUNDED ✅' : 'NOT FUNDED ❌'}`);
    
    // Try alternative balance methods
    console.log('\n🔍 Trying alternative methods...');
    
    // Method 1: User account balance  
    try {
      const userBalance = await client.balance(account);
      console.log('👤 User account balance:', userBalance);
    } catch (e) {
      console.log('❌ User account balance failed:', e.message);
    }
    
    // Method 2: Direct balance call
    try {
      const directBalance = await client.balance();
      console.log('⚡ Direct balance call:', directBalance);
    } catch (e) {
      console.log('❌ Direct balance failed:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBalance();
