# Deployment Guide - Making Your Scoreboard Accessible to Others

## Quick Deploy to Vercel (Recommended)

### Steps:
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel login
   npm run deploy
   ```

4. **Follow the prompts:**
   - Link to existing project? → No
   - Project name → volleyball-scoreboard (or your choice)
   - Deploy to production? → Yes

### Result:
- Your app will be live at: `https://your-project-name.vercel.app`
- Anyone can access this URL
- Free hosting with automatic HTTPS

## Alternative Deployment Options

### Option 2: Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Render
1. Connect your GitHub repo to Render
2. Deploy as a Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Option 4: Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## Local Network Access (Quick Test)

To test with others on your local network:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Find your local IP:**
   ```bash
   ifconfig | grep inet
   ```

3. **Share the URL:**
   - Instead of `localhost:5000`
   - Use `http://YOUR-IP:5000`
   - Example: `http://192.168.1.100:5000`

## Environment Variables

For production deployment, you may need to set:
- `DATABASE_URL` (if using external database)
- `NODE_ENV=production`
- Any API keys or secrets

## Security Notes
- The current setup includes file uploads
- Consider adding authentication for admin features
- Review CORS settings for production use

## Custom Domain (Optional)
Once deployed, you can:
1. Purchase a custom domain
2. Point it to your Vercel/Railway/Render app
3. Configure SSL (usually automatic)
