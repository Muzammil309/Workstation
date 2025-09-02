#!/usr/bin/env node

/**
 * Debug React Errors Script
 * 
 * This script helps identify and debug React error #310 and other hook-related issues
 * by providing detailed error information and suggestions.
 */

const fs = require('fs')
const path = require('path')

// React Error #310 decoder
const REACT_ERROR_310 = {
  code: 310,
  message: "Hooks can only be called inside the body of a function component",
  description: `
This error occurs when React hooks (useState, useEffect, etc.) are called:
1. Outside of a React function component
2. After a conditional return statement
3. Inside loops, conditions, or nested functions
4. In class components or regular JavaScript functions

Common causes:
- Hooks called after early returns (if statements)
- Hooks called conditionally
- Hooks called in wrong order between renders
- Hooks called outside component body
  `,
  solutions: [
    "Move all hooks to the top of the component, before any conditional logic",
    "Ensure hooks are called in the same order on every render",
    "Don't call hooks inside loops, conditions, or nested functions",
    "Use conditional logic AFTER declaring all hooks",
    "Wrap conditional returns with proper hook declarations first"
  ]
}

// Component patterns that commonly cause hook violations
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /if\s*\([^)]+\)\s*{\s*return/g,
    description: "Early return before hooks",
    suggestion: "Move hooks before conditional returns"
  },
  {
    pattern: /const\s+\[.*\]\s*=\s*useState.*\n.*if\s*\(/g,
    description: "Hooks mixed with conditional logic",
    suggestion: "Declare all hooks at the top of the component"
  },
  {
    pattern: /useEffect.*\n.*if\s*\([^)]+\)\s*{\s*return/g,
    description: "useEffect before early return",
    suggestion: "Move useEffect after conditional checks or restructure logic"
  }
]

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const issues = []

    // Check for problematic patterns
    PROBLEMATIC_PATTERNS.forEach(({ pattern, description, suggestion }) => {
      const matches = content.match(pattern)
      if (matches) {
        issues.push({
          type: 'hook_violation',
          description,
          suggestion,
          matches: matches.length,
          pattern: pattern.toString()
        })
      }
    })

    // Check for hooks after returns
    const lines = content.split('\n')
    let inComponent = false
    let hasEarlyReturn = false
    let hookAfterReturn = false

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // Detect function component
      if (trimmed.includes('function ') && trimmed.includes('()') || 
          trimmed.includes('const ') && trimmed.includes('= ()')) {
        inComponent = true
        hasEarlyReturn = false
        hookAfterReturn = false
      }

      if (inComponent) {
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
          trimmed.includes('useMemo')
        )) {
          hookAfterReturn = true
          issues.push({
            type: 'hook_after_return',
            description: `Hook found after return statement at line ${index + 1}`,
            suggestion: 'Move this hook before any return statements',
            line: index + 1,
            content: trimmed
          })
        }
      }

      // Reset when leaving component
      if (trimmed === '}' && inComponent) {
        inComponent = false
      }
    })

    return {
      file: filePath,
      issues,
      hasProblems: issues.length > 0
    }
  } catch (error) {
    return {
      file: filePath,
      error: error.message,
      hasProblems: true
    }
  }
}

function scanComponents() {
  const componentsDir = path.join(process.cwd(), 'components', 'dashboard')
  const hooksDir = path.join(process.cwd(), 'hooks')
  
  const results = []

  // Scan dashboard components
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => path.join(componentsDir, file))

    files.forEach(file => {
      results.push(analyzeFile(file))
    })
  }

  // Scan hooks
  if (fs.existsSync(hooksDir)) {
    const files = fs.readdirSync(hooksDir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => path.join(hooksDir, file))

    files.forEach(file => {
      results.push(analyzeFile(file))
    })
  }

  return results
}

function generateReport(results) {
  console.log('\n🔍 React Hook Violation Analysis Report\n')
  console.log('=' .repeat(60))

  const problemFiles = results.filter(r => r.hasProblems)
  const cleanFiles = results.filter(r => !r.hasProblems)

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Clean files: ${cleanFiles.length}`)
  console.log(`   ❌ Files with issues: ${problemFiles.length}`)
  console.log(`   📁 Total files scanned: ${results.length}`)

  if (problemFiles.length > 0) {
    console.log('\n🚨 Files with Hook Violations:\n')

    problemFiles.forEach(result => {
      console.log(`📄 ${path.relative(process.cwd(), result.file)}`)
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`)
      } else {
        result.issues.forEach(issue => {
          console.log(`   ⚠️  ${issue.description}`)
          console.log(`      💡 ${issue.suggestion}`)
          if (issue.line) {
            console.log(`      📍 Line ${issue.line}: ${issue.content}`)
          }
          console.log('')
        })
      }
      console.log('')
    })

    console.log('\n🔧 React Error #310 Information:')
    console.log(`Code: ${REACT_ERROR_310.code}`)
    console.log(`Message: ${REACT_ERROR_310.message}`)
    console.log(`\nDescription: ${REACT_ERROR_310.description}`)
    console.log('\n💡 Solutions:')
    REACT_ERROR_310.solutions.forEach((solution, index) => {
      console.log(`   ${index + 1}. ${solution}`)
    })
  } else {
    console.log('\n✅ All files are clean! No hook violations detected.')
  }

  console.log('\n' + '=' .repeat(60))
  console.log('🏁 Analysis complete!')
}

// Main execution
function main() {
  console.log('🚀 Starting React Hook Violation Analysis...')
  
  const results = scanComponents()
  generateReport(results)

  // Exit with error code if problems found
  const hasProblems = results.some(r => r.hasProblems)
  process.exit(hasProblems ? 1 : 0)
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  analyzeFile,
  scanComponents,
  generateReport,
  REACT_ERROR_310
}
