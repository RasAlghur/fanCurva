# 1. Clone the repo
git clone [https://github.com/RasAlghur/fanCurva](https://github.com/RasAlghur/fanCurva)
cd fanCurva

# 2. Install dependencies
npm install

# 3. Copy env template
# Get .env values
# Create apps/api/.env and apps/web/.env manually

# 4. Start Docker
docker-compose up -d

# 5. Run migrations
node -e "
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const dir = 'packages/db/migrations';
fs.readdirSync(dir).sort().forEach(f => {
  execSync('docker exec -i fancurva_postgres psql -U fancurva -d fancurva_dev -f /dev/stdin < ' + path.join(dir, f), { stdio: 'inherit', shell: true });
  console.log('Ran:', f);
});
"

# 6. Start API and frontend
cd apps/api && npm run dev     # terminal 1
cd apps/web && npm run dev     # terminal 2

# 7. Create your feature branch