// Run this to check if Neon Auth is configured correctly
// node check-auth-config.js

console.log('\n🔍 Checking Neon Auth Configuration...\n');

const authUrl = process.env.NEON_AUTH_BASE_URL;

if (!authUrl) {
  console.error('❌ NEON_AUTH_BASE_URL is not set in .env.local');
  console.log('\nAdd this to your .env.local file:');
  console.log('NEON_AUTH_BASE_URL=https://your-endpoint.neonauth.region.aws.neon.tech/dbname/auth\n');
  process.exit(1);
}

if (authUrl.includes('ep-xxx') || authUrl.includes('your-endpoint')) {
  console.error('❌ NEON_AUTH_BASE_URL is still using placeholder value');
  console.log('\nCurrent value:', authUrl);
  console.log('\n📋 Steps to fix:');
  console.log('1. Go to Neon Console: https://console.neon.tech');
  console.log('2. Navigate to: Project → Branch → Auth → Configuration');
  console.log('3. Enable Auth and copy your Auth URL');
  console.log('4. Replace the placeholder in .env.local with your actual URL\n');
  process.exit(1);
}

if (!authUrl.startsWith('https://')) {
  console.error('❌ NEON_AUTH_BASE_URL must start with https://');
  console.log('\nCurrent value:', authUrl);
  process.exit(1);
}

if (!authUrl.endsWith('/auth')) {
  console.warn('⚠️  NEON_AUTH_BASE_URL should end with /auth');
  console.log('\nCurrent value:', authUrl);
  console.log('Expected format: https://ep-xxxxxxxx.neonauth.region.aws.neon.tech/dbname/auth\n');
}

console.log('✅ NEON_AUTH_BASE_URL is set:', authUrl);
console.log('\n🧪 Testing connection to Auth service...\n');

fetch(authUrl.replace('/auth', '/auth/.well-known/openid-configuration'))
  .then(res => {
    if (res.ok) {
      console.log('✅ Auth service is reachable!');
      console.log('✅ Configuration looks good!\n');
      console.log('If you\'re still seeing 404 errors, restart your dev server:\n');
      console.log('  npm run dev\n');
    } else {
      console.error('❌ Auth service returned error:', res.status, res.statusText);
      console.log('\nThis usually means:');
      console.log('- Auth is not enabled in Neon Console');
      console.log('- The URL is incorrect');
      console.log('- The database name in the URL doesn\'t match\n');
    }
  })
  .catch(err => {
    console.error('❌ Cannot reach Auth service');
    console.log('\nError:', err.message);
    console.log('\nThis usually means:');
    console.log('- Auth is not enabled in Neon Console');
    console.log('- The URL is incorrect');
    console.log('- Network connectivity issues\n');
  });
