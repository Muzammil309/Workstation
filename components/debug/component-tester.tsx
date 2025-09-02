"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { ErrorBoundary } from '@/components/error-boundary'

// Test components
import { TodoList } from '@/components/dashboard/todo-list'
import { TeamInbox } from '@/components/dashboard/team-inbox'
import { Whiteboard } from '@/components/dashboard/whiteboard'
import { AutomationCenter } from '@/components/dashboard/automation-center'

interface ComponentTest {
  name: string
  component: React.ComponentType
  status: 'pending' | 'success' | 'error'
  error?: string
}

export function ComponentTester() {
  const [tests, setTests] = useState<ComponentTest[]>([
    { name: 'TodoList', component: TodoList, status: 'pending' },
    { name: 'TeamInbox', component: TeamInbox, status: 'pending' },
    { name: 'Whiteboard', component: Whiteboard, status: 'pending' },
    { name: 'AutomationCenter', component: AutomationCenter, status: 'pending' }
  ])
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  const updateTestStatus = (name: string, status: 'success' | 'error', error?: string) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, status, error } : test
    ))
  }

  const TestWrapper = ({ test }: { test: ComponentTest }) => {
    const Component = test.component

    return (
      <ErrorBoundary
        fallback={({ error, resetError }) => {
          // Update test status when error occurs
          if (test.status !== 'error') {
            updateTestStatus(test.name, 'error', error?.message || 'Unknown error')
          }

          return (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium text-red-700">Component Error</span>
              </div>
              <p className="text-sm text-red-600 mb-3">
                {error?.message || 'Component failed to render'}
              </p>
              <Button size="sm" variant="outline" onClick={resetError}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          )
        }}
        onError={(error) => {
          console.error(`Error in ${test.name}:`, error)
          updateTestStatus(test.name, 'error', error.message)
        }}
      >
        <ComponentSuccessWrapper testName={test.name} onSuccess={() => updateTestStatus(test.name, 'success')}>
          <Component />
        </ComponentSuccessWrapper>
      </ErrorBoundary>
    )
  }

  const ComponentSuccessWrapper = ({ 
    children, 
    testName, 
    onSuccess 
  }: { 
    children: React.ReactNode
    testName: string
    onSuccess: () => void
  }) => {
    // Mark as success if component renders without error
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onSuccess()
      }, 1000) // Give component time to initialize

      return () => clearTimeout(timer)
    }, [onSuccess])

    return <>{children}</>
  }

  const getStatusIcon = (status: ComponentTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: ComponentTest['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const runAllTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, error: undefined })))
    setSelectedTest(null)
    
    // Test each component sequentially
    tests.forEach((test, index) => {
      setTimeout(() => {
        setSelectedTest(test.name)
      }, index * 2000)
    })
  }

  const successCount = tests.filter(t => t.status === 'success').length
  const errorCount = tests.filter(t => t.status === 'error').length

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Component Testing Dashboard</h1>
          <p className="text-muted-foreground">Test React components for hook violations and errors</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <Badge className={`${successCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              ✓ {successCount} Passed
            </Badge>
            <Badge className={`${errorCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
              ✗ {errorCount} Failed
            </Badge>
          </div>
          
          <Button onClick={runAllTests}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tests.map((test) => (
              <div
                key={test.name}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTest === test.name ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTest(selectedTest === test.name ? null : test.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{test.name}</span>
                  {getStatusIcon(test.status)}
                </div>
                
                <Badge className={`text-xs ${getStatusColor(test.status)}`}>
                  {test.status}
                </Badge>
                
                {test.error && (
                  <p className="text-xs text-red-600 mt-2 truncate" title={test.error}>
                    {test.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Render Area */}
      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle>Testing: {selectedTest}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 min-h-[400px]">
              {(() => {
                const test = tests.find(t => t.name === selectedTest)
                return test ? <TestWrapper test={test} /> : null
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Run All Tests:</strong> Click "Run All Tests" to test all components sequentially</p>
            <p><strong>2. Individual Testing:</strong> Click on any component card to test it individually</p>
            <p><strong>3. Error Handling:</strong> Components with errors will show error boundaries with retry options</p>
            <p><strong>4. Hook Violations:</strong> React error #310 indicates hooks called outside component body</p>
            <p><strong>5. Success Criteria:</strong> Components that render without errors for 1 second are marked as passed</p>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This tester helps identify React hook violations and component errors. 
              All components should pass in both development and production builds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add React import for useEffect
import React from 'react'
