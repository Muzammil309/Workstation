# TaskFlow Deployment Guide

This guide will walk you through deploying TaskFlow to Vercel and setting up a custom domain.

## 🚀 Deploy to Vercel

### Step 1: Prepare Your Repository

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository
2. **Check Dependencies**: Verify all dependencies are in `package.json`
3. **Environment Variables**: Prepare your environment variables

### Step 2: Connect to Vercel

1. **Sign Up/Login**: Go to [vercel.com](https://vercel.com) and sign in
2. **New Project**: Click "New Project"
3. **Import Repository**: Select your GitHub repository
4. **Configure Project**:
   - **Project Name**: `taskflow` (or your preferred name)
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Environment Variables

Add these environment variables in Vercel:

```env
# Database (use your production database URL)
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-very-long-random-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Optional: Analytics
NEXT_PUBLIC_GA_ID="your-google-analytics-id"
```

### Step 4: Deploy

1. **Deploy**: Click "Deploy"
2. **Wait**: Vercel will build and deploy your application
3. **Success**: Your app will be available at `https://your-app.vercel.app`

## 🌐 Custom Domain Setup

### Step 1: Domain Provider Configuration

#### Option A: Using CNAME Record (Recommended)

1. **Go to your domain provider** (GoDaddy, Namecheap, etc.)
2. **DNS Management**: Find DNS settings or zone file
3. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: tasks (or your preferred subdomain)
   Value: your-app.vercel.app
   TTL: 3600 (or default)
   ```

#### Option B: Using A Record

1. **Get Vercel IP**: Contact Vercel support for IP addresses
2. **Add A Record**:
   ```
   Type: A
   Name: tasks
   Value: 76.76.19.76 (Vercel's IP)
   TTL: 3600
   ```

### Step 2: Vercel Domain Configuration

1. **Project Settings**: Go to your project settings in Vercel
2. **Domains**: Click "Domains" tab
3. **Add Domain**: Enter `tasks.yourdomain.com`
4. **Verify**: Vercel will verify the DNS configuration
5. **SSL**: SSL certificate will be automatically provisioned

### Step 3: Update Environment Variables

Update your environment variables with the new domain:

```env
NEXTAUTH_URL="https://tasks.yourdomain.com"
```

### Step 4: Test Your Domain

1. **Wait for DNS**: DNS changes can take up to 48 hours
2. **Test**: Visit `https://tasks.yourdomain.com`
3. **Verify SSL**: Ensure the SSL certificate is working

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)

1. **Create Database**: In Vercel dashboard, go to Storage
2. **New Database**: Create a new Postgres database
3. **Get Connection String**: Copy the connection string
4. **Update Environment**: Set `DATABASE_URL` in your environment variables

### Option 2: External Database

1. **Choose Provider**: Supabase, Railway, or your own server
2. **Create Database**: Set up a new PostgreSQL database
3. **Connection String**: Get the connection string
4. **Environment Variable**: Set `DATABASE_URL`

### Database Migration

If you're using Sequelize, run migrations:

```bash
# Install Sequelize CLI
npm install -g sequelize-cli

# Run migrations
npx sequelize-cli db:migrate

# Seed data (optional)
npx sequelize-cli db:seed:all
```

## 🔒 Security Configuration

### Environment Variables Security

1. **Strong Secrets**: Use strong, random secrets for JWT and NextAuth
2. **Production URLs**: Ensure all URLs point to production domains
3. **Database Security**: Use SSL connections for databases

### Generate Strong Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32
```

## 📱 Mobile Optimization

### PWA Configuration

Add to your `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // your existing config
})
```

### Install PWA Dependencies

```bash
npm install next-pwa
```

## 🚀 Performance Optimization

### Build Optimization

1. **Enable Compression**: Vercel automatically compresses assets
2. **Image Optimization**: Next.js automatically optimizes images
3. **Code Splitting**: Automatic code splitting for better performance

### Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Performance Monitoring**: Use Vercel's built-in monitoring
3. **Error Tracking**: Set up error tracking (Sentry, LogRocket)

## 🔄 Continuous Deployment

### Automatic Deployments

1. **GitHub Integration**: Vercel automatically deploys on push
2. **Preview Deployments**: Automatic preview deployments for PRs
3. **Rollback**: Easy rollback to previous deployments

### Deployment Settings

Configure in Vercel dashboard:
- **Auto-deploy**: Enable/disable automatic deployments
- **Branch Protection**: Protect main branch deployments
- **Build Hooks**: Custom build triggers

## 🧪 Testing Before Production

### Pre-deployment Checklist

- [ ] All environment variables are set
- [ ] Database is accessible from Vercel
- [ ] Authentication is working
- [ ] All features are functional
- [ ] Mobile responsiveness is tested
- [ ] Performance is acceptable

### Testing Commands

```bash
# Build test
npm run build

# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
1. **Check Dependencies**: Ensure all dependencies are in `package.json`
2. **Node Version**: Verify Node.js version compatibility
3. **Build Logs**: Check Vercel build logs for errors

#### Database Connection Issues
1. **Environment Variables**: Verify `DATABASE_URL` is correct
2. **Network Access**: Ensure database allows Vercel IPs
3. **SSL**: Enable SSL connections if required

#### Domain Issues
1. **DNS Propagation**: Wait up to 48 hours for DNS changes
2. **CNAME vs A Record**: Prefer CNAME for subdomains
3. **SSL Certificate**: SSL is automatic but may take time

### Getting Help

1. **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel Support**: Available for Pro and Enterprise plans
3. **Community**: Check Vercel community forums

## 📊 Post-Deployment

### Monitoring

1. **Performance**: Monitor Core Web Vitals
2. **Errors**: Set up error tracking and monitoring
3. **Uptime**: Monitor application availability

### Maintenance

1. **Updates**: Keep dependencies updated
2. **Backups**: Regular database backups
3. **Security**: Monitor for security updates

### Scaling

1. **Auto-scaling**: Vercel automatically scales
2. **Edge Functions**: Use Vercel Edge Functions for global performance
3. **CDN**: Automatic CDN distribution

---

## 🎯 Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Database set up and accessible
- [ ] Domain configured (if using custom domain)
- [ ] Application deployed successfully
- [ ] All features tested
- [ ] Performance verified
- [ ] Monitoring set up

Your TaskFlow application is now ready for production! 🚀
