#!/bin/bash

# 🎨 Figma-Inspired UI/UX Setup Script
# This script sets up the new design system for your task management app

echo "🎨 Setting up Figma-Inspired UI/UX System..."
echo "================================================"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install @radix-ui/react-progress

# Verify framer-motion and lucide-react are installed
echo "🔍 Verifying core dependencies..."
npm list framer-motion lucide-react @radix-ui/react-progress

# Check if the theme CSS is imported
echo "🎨 Checking theme CSS import..."
if grep -q "figma-inspired-theme.css" app/globals.css 2>/dev/null; then
    echo "✅ Theme CSS already imported"
else
    echo "⚠️  Please add this import to your app/globals.css:"
    echo "@import '../styles/figma-inspired-theme.css';"
fi

# Run TypeScript check
echo "🔍 Running TypeScript check..."
if npm run build > /dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed. Please check the errors above."
    echo "💡 Try running: npm run build"
fi

echo ""
echo "🚀 Setup Complete!"
echo "================================================"
echo "Next steps:"
echo "1. Add theme CSS import to app/globals.css (if not already done)"
echo "2. Run: npm run dev"
echo "3. Visit: http://localhost:3000/preview"
echo "4. Test the new design system!"
echo ""
echo "📚 For detailed setup instructions, see: SETUP_AND_DEPLOYMENT_GUIDE.md"
