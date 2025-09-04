"use client"

import { ModernAppLayout, PageWrapper } from '@/components/layout/modern-app-layout'
import { ModernDashboard } from '@/components/dashboard/modern-dashboard'
import { ModernTaskBoard } from '@/components/tasks/modern-task-board'
import { ModernTaskForm } from '@/components/ui/modern-form'
import { FuturisticCard, FuturisticCardHeader, FuturisticCardTitle, FuturisticCardContent, StatsCard } from '@/components/ui/futuristic-card'
import { EnhancedTaskCard } from '@/components/ui/enhanced-task-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Zap, Target, Users, CheckCircle2 } from 'lucide-react'

// Mock task data for testing
const mockTask = {
  id: '1',
  title: 'Design System Implementation',
  description: 'Implement the new Figma-inspired design system with modern UI components',
  status: 'in-progress' as const,
  priority: 'high' as const,
  deadline: '2024-02-15',
  progress: 75,
  assignees: [
    { id: '1', name: 'John Doe', avatar: '/api/placeholder/32/32' },
    { id: '2', name: 'Sarah Chen', avatar: '/api/placeholder/32/32' }
  ],
  tags: ['design', 'ui/ux', 'frontend'],
  created_at: '2024-01-15'
}

export default function PreviewPage() {
  return (
    <ModernAppLayout>
      <PageWrapper 
        title="🎨 Figma-Inspired Design Preview" 
        description="Experience the new futuristic task management interface with cutting-edge UI/UX"
        actions={
          <div className="flex space-x-3">
            <Button variant="outline" className="glass-morphism">
              <Zap className="w-4 h-4 mr-2" />
              View Docs
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        }
      >
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-4 py-8">
            <h1 className="text-5xl font-bold text-gradient">
              Welcome to the Future
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Experience a revolutionary task management interface with glassmorphism, 
              smooth animations, and cutting-edge design principles.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <Badge variant="outline" className="bg-accent-blue/20 text-accent-blue border-accent-blue/30">
                🚀 Modern Design
              </Badge>
              <Badge variant="outline" className="bg-accent-purple/20 text-accent-purple border-accent-purple/30">
                ✨ Smooth Animations
              </Badge>
              <Badge variant="outline" className="bg-accent-green/20 text-accent-green border-accent-green/30">
                🎯 User-Focused
              </Badge>
            </div>
          </section>

          {/* Stats Cards Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">📊 Statistics Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Tasks"
                value={156}
                change={{ value: 12, type: 'increase' }}
                icon={<Target className="w-6 h-6" />}
              />
              <StatsCard
                title="Completed"
                value={89}
                change={{ value: 8, type: 'increase' }}
                icon={<CheckCircle2 className="w-6 h-6" />}
              />
              <StatsCard
                title="Team Members"
                value={12}
                icon={<Users className="w-6 h-6" />}
              />
              <StatsCard
                title="Productivity"
                value="87%"
                change={{ value: 5, type: 'increase' }}
                icon={<Zap className="w-6 h-6" />}
              />
            </div>
          </section>

          {/* Card Variants Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">🎴 Card Variants</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FuturisticCard variant="default">
                <FuturisticCardHeader>
                  <FuturisticCardTitle>Default Card</FuturisticCardTitle>
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <p className="text-text-muted">
                    Standard card with clean design and subtle shadows.
                  </p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard variant="glass">
                <FuturisticCardHeader>
                  <FuturisticCardTitle>Glass Morphism</FuturisticCardTitle>
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <p className="text-text-muted">
                    Modern glass effect with backdrop blur and transparency.
                  </p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard variant="gradient">
                <FuturisticCardHeader>
                  <FuturisticCardTitle>Gradient Card</FuturisticCardTitle>
                </FuturisticCardHeader>
                <FuturisticCardContent>
                  <p className="text-white/80">
                    Vibrant gradient background for important content.
                  </p>
                </FuturisticCardContent>
              </FuturisticCard>
            </div>
          </section>

          {/* Enhanced Task Card Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">📋 Enhanced Task Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EnhancedTaskCard
                task={mockTask}
                onView={(task) => console.log('View task:', task)}
                onEdit={(task) => console.log('Edit task:', task)}
                onDelete={(task) => console.log('Delete task:', task)}
                onStatusChange={(task, status) => console.log('Status change:', task, status)}
              />
              <EnhancedTaskCard
                task={{
                  ...mockTask,
                  id: '2',
                  title: 'API Integration',
                  status: 'completed',
                  priority: 'medium',
                  progress: 100
                }}
                variant="compact"
              />
              <EnhancedTaskCard
                task={{
                  ...mockTask,
                  id: '3',
                  title: 'User Testing',
                  status: 'pending',
                  priority: 'urgent',
                  progress: 0,
                  deadline: '2024-02-08' // Overdue
                }}
                variant="detailed"
              />
            </div>
          </section>

          {/* Dashboard Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">📈 Dashboard</h2>
            <ModernDashboard />
          </section>

          {/* Task Board Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">📋 Task Board</h2>
            <ModernTaskBoard />
          </section>

          {/* Form Preview */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">📝 Modern Forms</h2>
            <div className="max-w-2xl mx-auto">
              <ModernTaskForm />
            </div>
          </section>

          {/* Animation Showcase */}
          <section>
            <h2 className="text-3xl font-bold text-gradient mb-6">✨ Animation Showcase</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FuturisticCard className="animate-fade-in">
                <FuturisticCardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Fade In</h3>
                  <p className="text-text-muted text-sm">Smooth fade-in animation</p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard className="animate-slide-up">
                <FuturisticCardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Slide Up</h3>
                  <p className="text-text-muted text-sm">Elegant slide-up motion</p>
                </FuturisticCardContent>
              </FuturisticCard>

              <FuturisticCard className="animate-scale-in">
                <FuturisticCardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Scale In</h3>
                  <p className="text-text-muted text-sm">Bouncy scale animation</p>
                </FuturisticCardContent>
              </FuturisticCard>
            </div>
          </section>

          {/* Footer */}
          <section className="text-center py-12">
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gradient mb-4">
                🎉 Design System Complete!
              </h3>
              <p className="text-text-muted mb-6">
                Your task management application now features a cutting-edge, 
                futuristic interface that rivals premium productivity applications.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="glass-morphism">
                  View Documentation
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90 text-white">
                  Start Building
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PageWrapper>
    </ModernAppLayout>
  )
}
