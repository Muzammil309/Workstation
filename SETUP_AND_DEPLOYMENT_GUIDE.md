# 🚀 Setup and Deployment Guide - Figma-Inspired UI/UX System

## 🔧 **Fix TypeScript Compilation Errors**

### **1. Install Missing Dependencies**

Run the following command to install the missing Radix UI Progress component:

```bash
npm install @radix-ui/react-progress
# or
yarn add @radix-ui/react-progress
```

### **2. Verify All Dependencies**

Ensure these dependencies are installed (most should already be in your package.json):

```bash
npm install framer-motion lucide-react @radix-ui/react-progress
# or
yarn add framer-motion lucide-react @radix-ui/react-progress
```

## 🏃‍♂️ **Local Development Setup**

### **Step 1: Install Dependencies**

```bash
# Install all dependencies
npm install

# Or if using yarn
yarn install
```

### **Step 2: Import Theme Styles**

Add the theme CSS to your main CSS file. Update `app/globals.css` or your main CSS file:

```css
/* Add this import at the top of your globals.css */
@import '../styles/figma-inspired-theme.css';

/* Your existing styles... */
```

### **Step 3: Update Tailwind Config**

Update your `tailwind.config.js` to include the new design tokens:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Dark theme colors
        'dark-bg-primary': '#0f0f23',
        'dark-bg-secondary': '#1a1a2e',
        'dark-bg-tertiary': '#16213e',
        'dark-surface': '#1e293b',
        'dark-surface-elevated': '#334155',
        
        // Brand colors
        'brand-primary': '#6366f1',
        'brand-secondary': '#8b5cf6',
        'accent-cyan': '#06b6d4',
        'accent-purple': '#8b5cf6',
        'accent-pink': '#ec4899',
        'accent-orange': '#f97316',
        'accent-green': '#10b981',
        'accent-yellow': '#f59e0b',
        'accent-red': '#ef4444',
        
        // Text colors
        'text-primary': '#f8fafc',
        'text-secondary': '#cbd5e1',
        'text-muted': '#64748b',
        
        // Glass morphism
        'glass-border': 'rgba(148, 163, 184, 0.1)',
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **Step 4: Create Example Page**

Create a test page to preview the new design system. Create `app/preview/page.tsx`:

```tsx
"use client"

import { ModernAppLayout, PageWrapper } from '@/components/layout/modern-app-layout'
import { ModernDashboard } from '@/components/dashboard/modern-dashboard'
import { ModernTaskBoard } from '@/components/tasks/modern-task-board'
import { ModernTaskForm } from '@/components/ui/modern-form'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function PreviewPage() {
  return (
    <ModernAppLayout>
      <PageWrapper 
        title="Figma-Inspired Design Preview" 
        description="Experience the new futuristic task management interface"
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        }
      >
        <div className="space-y-8">
          {/* Dashboard Section */}
          <section>
            <h2 className="text-2xl font-bold text-gradient mb-4">Dashboard</h2>
            <ModernDashboard />
          </section>
          
          {/* Task Board Section */}
          <section>
            <h2 className="text-2xl font-bold text-gradient mb-4">Task Board</h2>
            <ModernTaskBoard />
          </section>
          
          {/* Form Section */}
          <section>
            <h2 className="text-2xl font-bold text-gradient mb-4">Modern Forms</h2>
            <ModernTaskForm />
          </section>
        </div>
      </PageWrapper>
    </ModernAppLayout>
  )
}
```

### **Step 5: Run Development Server**

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

### **Step 6: Preview the Design**

Open your browser and navigate to:
- **Main app**: `http://localhost:3000`
- **Design preview**: `http://localhost:3000/preview`

## 🔍 **Testing Checklist**

### **Visual Components to Test:**

✅ **Sidebar Navigation**
- Collapsible functionality
- Smooth animations
- Badge notifications
- Tooltip on hover (collapsed state)

✅ **Dashboard**
- Animated statistics cards
- Progress bars
- Activity timeline
- Project progress tracking

✅ **Task Board**
- Kanban columns
- Task cards with priority indicators
- Hover effects and animations
- Glass morphism effects

✅ **Forms**
- Input field animations
- Password visibility toggle
- Form validation
- Gradient buttons

✅ **Layout**
- Responsive design (test on mobile)
- Dark theme consistency
- Glass morphism effects
- Background animations

## 🚀 **Deployment to Vercel**

### **Pre-deployment Checklist:**

1. **Fix TypeScript Errors:**
```bash
npm run build
```

2. **Verify All Imports:**
```bash
# Check for any missing imports
npm run lint
```

3. **Test Production Build:**
```bash
npm run build && npm run start
```

### **Deploy to Vercel:**

```bash
# If using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Add Figma-inspired UI/UX system"
git push origin main
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Module Not Found Errors**
```bash
# Solution: Install missing dependencies
npm install @radix-ui/react-progress framer-motion lucide-react
```

### **Issue 2: CSS Not Loading**
```css
/* Solution: Ensure theme CSS is imported in globals.css */
@import '../styles/figma-inspired-theme.css';
```

### **Issue 3: TypeScript Errors**
```bash
# Solution: Check all imports and exports
npm run build
```

### **Issue 4: Animations Not Working**
```bash
# Solution: Ensure framer-motion is installed
npm install framer-motion
```

## 📱 **Mobile Testing**

Test the responsive design on different screen sizes:
- **Mobile**: 375px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🎯 **Performance Optimization**

The new design system is optimized for performance:
- ✅ **Efficient animations** using transform and opacity
- ✅ **Lazy loading** for heavy components
- ✅ **Optimized re-renders** with React.memo
- ✅ **GPU acceleration** for smooth animations

## 🎉 **Success Indicators**

You'll know the setup is successful when you see:
- ✅ **Dark theme** with vibrant gradients
- ✅ **Smooth animations** on all interactions
- ✅ **Glass morphism effects** on cards and modals
- ✅ **Responsive layout** that works on all devices
- ✅ **No TypeScript compilation errors**
- ✅ **Fast loading times** and smooth performance

Navigate to `/preview` to see all components in action!
