#!/usr/bin/env node

/**
 * Production Build Test Script
 * 
 * This script tests the production build to ensure React Error #310 is resolved
 * and all components work correctly in the minified production environment.
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Production Build Test...\n')

// Test 1: Build the application
console.log('📦 Step 1: Building production application...')
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
})

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed with code:', code)
    process.exit(1)
  }
  
  console.log('✅ Build successful!\n')
  
  // Test 2: Check for build artifacts
  console.log('📁 Step 2: Verifying build artifacts...')
  
  const buildDir = path.join(process.cwd(), '.next')
  const staticDir = path.join(buildDir, 'static')
  
  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found')
    process.exit(1)
  }
  
  if (!fs.existsSync(staticDir)) {
    console.error('❌ Static directory not found')
    process.exit(1)
  }
  
  console.log('✅ Build artifacts verified!\n')
  
  // Test 3: Start production server
  console.log('🌐 Step 3: Starting production server...')
  
  const startProcess = spawn('npm', ['start'], {
    stdio: 'pipe',
    shell: true,
    cwd: process.cwd()
  })
  
  let serverReady = false
  let serverOutput = ''
  
  startProcess.stdout.on('data', (data) => {
    const output = data.toString()
    serverOutput += output
    console.log(output)
    
    if (output.includes('Ready') || output.includes('started server')) {
      serverReady = true
      console.log('✅ Production server started!\n')
      
      // Test 4: Component validation
      console.log('🧪 Step 4: Component validation...')
      validateComponents()
      
      // Clean up
      setTimeout(() => {
        console.log('\n🧹 Cleaning up...')
        startProcess.kill()
        console.log('✅ Production build test completed successfully! 🎉')
        process.exit(0)
      }, 5000)
    }
  })
  
  startProcess.stderr.on('data', (data) => {
    const error = data.toString()
    console.error('Server error:', error)
    
    if (error.includes('Error') && error.includes('310')) {
      console.error('❌ React Error #310 detected in production!')
      startProcess.kill()
      process.exit(1)
    }
  })
  
  startProcess.on('close', (code) => {
    if (!serverReady && code !== 0) {
      console.error('❌ Server failed to start with code:', code)
      process.exit(1)
    }
  })
  
  // Timeout for server start
  setTimeout(() => {
    if (!serverReady) {
      console.error('❌ Server failed to start within timeout')
      startProcess.kill()
      process.exit(1)
    }
  }, 30000)
})

function validateComponents() {
  console.log('🔍 Validating component implementations...')
  
  const componentsToCheck = [
    'components/dashboard/todo-list.tsx',
    'components/dashboard/team-inbox.tsx',
    'components/dashboard/whiteboard.tsx',
    'components/dashboard/automation-center.tsx'
  ]
  
  let allValid = true
  
  componentsToCheck.forEach(componentPath => {
    const fullPath = path.join(process.cwd(), componentPath)
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Component not found: ${componentPath}`)
      allValid = false
      return
    }
    
    const content = fs.readFileSync(fullPath, 'utf8')
    
    // Check for hook violations
    const violations = checkHookViolations(content, componentPath)
    
    if (violations.length > 0) {
      console.error(`❌ Hook violations found in ${componentPath}:`)
      violations.forEach(violation => {
        console.error(`   - ${violation}`)
      })
      allValid = false
    } else {
      console.log(`✅ ${componentPath} - No hook violations`)
    }
  })
  
  if (allValid) {
    console.log('✅ All components validated successfully!')
  } else {
    console.error('❌ Component validation failed!')
    process.exit(1)
  }
}

function checkHookViolations(content, filePath) {
  const violations = []
  const lines = content.split('\n')
  
  let inFunction = false
  let hasEarlyReturn = false
  let functionName = ''
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    const lineNum = index + 1
    
    // Detect function component start
    if (trimmed.includes('function ') && (trimmed.includes('()') || trimmed.includes('Props'))) {
      inFunction = true
      hasEarlyReturn = false
      functionName = trimmed.match(/function\s+(\w+)/)?.[1] || 'Unknown'
    }
    
    if (inFunction) {
      // Check for early returns
      if (trimmed.includes('return (') || trimmed.includes('return <')) {
        hasEarlyReturn = true
      }
      
      // Check for hooks after early return
      if (hasEarlyReturn && (
        trimmed.includes('useState') ||
        trimmed.includes('useEffect') ||
        trimmed.includes('useRef') ||
        trimmed.includes('useCallback') ||
        trimmed.includes('useMemo') ||
        trimmed.includes('useAuth') ||
        trimmed.includes('useToast')
      )) {
        violations.push(`Hook called after return in ${functionName} at line ${lineNum}`)
      }
      
      // Check for conditional hook calls
      if (trimmed.includes('if (') && lines[index + 1]?.includes('use')) {
        violations.push(`Potential conditional hook call in ${functionName} at line ${lineNum}`)
      }
    }
    
    // Reset when leaving function
    if (trimmed === '}' && inFunction) {
      inFunction = false
    }
  })
  
  return violations
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated')
  process.exit(0)
})
