const fs = require('fs');
const path = require('path');

// Create .env file with necessary environment variables
const envContent = `DATABASE_URL="postgresql://postgres:25012501Vv$@localhost:5432/tamid_db"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
PORT=3001
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the JWT_SECRET with a secure random string');
  console.log('🔐 You can generate one at: https://generate-secret.vercel.app/32');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}


