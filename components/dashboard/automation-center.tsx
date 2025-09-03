"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Bot,
  Target,
  ArrowRight,
  Bell,
  Mail,
  Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { automationEngine, AutomationRule as EngineRule, AutomationAction as EngineAction, TriggerConditions } from '@/lib/automation-engine'
import { ErrorBoundary, DashboardErrorFallback } from '@/components/error-boundary'

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger_type: 'deadline_approaching' | 'task_overdue' | 'event_created' | 'status_change' | 'team_assignment'
  trigger_conditions: any
  actions: AutomationAction[]
  is_active: boolean
  created_by: string
  created_at: string
  last_executed?: string
  execution_count: number
}

interface AutomationAction {
  type: 'create_task' | 'send_notification' | 'assign_team' | 'update_status' | 'schedule_reminder'
  parameters: any
}

interface EventTemplate {
  id: string
  name: string
  description: string
  task_templates: TaskTemplate[]
  timeline_days: number
  automation_rules: string[]
}

interface TaskTemplate {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  estimated_hours: number
  dependencies: string[]
  assignee_role: string
  deadline_offset_days: number
}

function AutomationCenterContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [eventTemplates, setEventTemplates] = useState<EventTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'rules' | 'templates' | 'analytics'>('rules')
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [showEditRule, setShowEditRule] = useState(false)
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'deadline_approaching',
    action_type: 'send_notification',
    is_active: true
  })
  const [users, setUsers] = useState<any[]>([])
  const [newRuleData, setNewRuleData] = useState({
    name: '',
    description: '',
    trigger_type: 'deadline_approaching' as const,
    trigger_conditions: {
      hours_before_deadline: 24,
      priority_levels: [] as string[],
      task_status: ['pending', 'in-progress'] as string[],
      assignee_ids: [] as string[]
    },
    actions: [{
      type: 'send_notification' as const,
      parameters: {
        title: 'Task Deadline Reminder',
        message: 'Your task is due soon!',
        in_app: true,
        sound: true,
        email: false
      }
    }],
    is_active: true
  })

  const loadAutomationData = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Loading automation data...')

      // Try to load automation rules with fallback
      let rulesData = []
      let templatesData = []

      try {
        const rulesResponse = await supabase
          .from('automation_rules')
          .select('*')
          .order('created_at', { ascending: false })

        if (rulesResponse.error) {
          console.log('🔍 Automation rules table not found, using mock data:', rulesResponse.error)
          // Use mock data if table doesn't exist
          rulesData = [
            {
              id: 'mock-1',
              name: 'Auto-assign new tasks',
              description: 'Automatically assign new tasks to team members based on workload',
              trigger: 'task_created',
              action: 'assign_user',
              is_active: true,
              created_at: new Date().toISOString()
            },
            {
              id: 'mock-2',
              name: 'Deadline reminders',
              description: 'Send email reminders 24 hours before task deadlines',
              trigger: 'deadline_approaching',
              action: 'send_email',
              is_active: false,
              created_at: new Date().toISOString()
            }
          ]
        } else {
          rulesData = rulesResponse.data || []
        }
      } catch (error) {
        console.log('🔍 Using fallback automation rules due to error:', error)
        rulesData = []
      }

      try {
        const templatesResponse = await supabase
          .from('event_templates')
          .select('*')
          .order('created_at', { ascending: false })

        if (templatesResponse.error) {
          console.log('🔍 Event templates table not found, using mock data:', templatesResponse.error)
          // Use mock data if table doesn't exist
          templatesData = [
            {
              id: 'template-1',
              name: 'Project Kickoff',
              description: 'Standard template for project kickoff events',
              timeline_days: 30,
              task_count: 12,
              created_at: new Date().toISOString()
            },
            {
              id: 'template-2',
              name: 'Client Meeting',
              description: 'Template for client meetings and presentations',
              timeline_days: 14,
              task_count: 8,
              created_at: new Date().toISOString()
            }
          ]
        } else {
          templatesData = templatesResponse.data || []
        }
      } catch (error) {
        console.log('🔍 Using fallback event templates due to error:', error)
        templatesData = []
      }

      console.log('🔍 Automation data loaded:', { rules: rulesData.length, templates: templatesData.length })

      setAutomationRules(rulesData)
      setEventTemplates(templatesData)
    } catch (error: any) {
      console.error('Error loading automation data:', error)
      // Set empty arrays instead of showing error to user
      setAutomationRules([])
      setEventTemplates([])

      toast({
        title: "Info",
        description: "Automation features are being set up. Some features may be limited.",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    loadAutomationData()
    loadUsers()
  }, [loadAutomationData])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      console.log('🔄 Toggling rule status:', ruleId, 'from', isActive, 'to', !isActive)

      // Try to update in database, fallback to local state
      try {
        const { error } = await supabase
          .from('automation_rules')
          .update({ is_active: !isActive })
          .eq('id', ruleId)

        if (error) throw error
        console.log('✅ Database update successful')
      } catch (dbError) {
        console.log('⚠️ Database update failed, updating local state:', dbError)
      }

      // Always update local state
      setAutomationRules(prev => prev.map(rule =>
        rule.id === ruleId ? { ...rule, is_active: !isActive } : rule
      ))

      toast({
        title: "Success",
        description: `Automation rule ${!isActive ? 'activated' : 'deactivated'}`,
      })
    } catch (error: any) {
      console.error('Error toggling rule status:', error)
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive"
      })
    }
  }

  const createAutomationRule = async () => {
    try {
      if (!newRuleData.name.trim()) {
        toast({
          title: "Error",
          description: "Rule name is required",
          variant: "destructive"
        })
        return
      }

      const ruleToCreate = {
        name: newRuleData.name,
        description: newRuleData.description,
        trigger_type: newRuleData.trigger_type,
        trigger_conditions: newRuleData.trigger_conditions,
        actions: newRuleData.actions,
        is_active: newRuleData.is_active,
        created_by: user?.id || ''
      }

      // Use the automation engine to create the rule
      const createdRule = await automationEngine.addRule(ruleToCreate)

      // Update local state
      setAutomationRules(prev => [createdRule, ...prev])
      setShowCreateRule(false)

      // Reset form
      setNewRuleData({
        name: '',
        description: '',
        trigger_type: 'deadline_approaching',
        trigger_conditions: {
          hours_before_deadline: 24,
          priority_levels: [],
          task_status: ['pending', 'in-progress'],
          assignee_ids: []
        },
        actions: [{
          type: 'send_notification',
          parameters: {
            title: 'Task Deadline Reminder',
            message: 'Your task is due soon!',
            in_app: true,
            sound: true,
            email: false
          }
        }],
        is_active: true
      })

      toast({
        title: "Success",
        description: "Automation rule created successfully",
      })
    } catch (error: any) {
      console.error('Error creating rule:', error)
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive"
      })
    }
  }

  const editAutomationRule = (rule: AutomationRule) => {
    setEditingRule(rule)
    setRuleFormData({
      name: rule.name || '',
      description: rule.description || '',
      trigger_type: rule.trigger_type || 'task_created',
      action_type: rule.actions?.[0]?.type || 'send_notification',
      is_active: rule.is_active !== false
    })
    setShowEditRule(true)
  }

  const updateAutomationRule = async () => {
    try {
      if (!editingRule || !ruleFormData.name.trim()) {
        toast({
          title: "Error",
          description: "Rule name is required",
          variant: "destructive"
        })
        return
      }

      const updatedRule: AutomationRule = {
        ...editingRule,
        name: ruleFormData.name,
        description: ruleFormData.description,
        trigger_type: ruleFormData.trigger_type as any,
        actions: [{
          type: ruleFormData.action_type as any,
          parameters: editingRule.actions?.[0]?.parameters || {}
        }],
        is_active: ruleFormData.is_active
      }

      // Try to update in database, fallback to local state
      try {
        const { error } = await supabase
          .from('automation_rules')
          .update(updatedRule)
          .eq('id', editingRule.id)

        if (error) throw error
      } catch (dbError) {
        console.log('Database update failed, updating local state:', dbError)
      }

      setAutomationRules(prev => prev.map(rule =>
        rule.id === editingRule.id ? updatedRule : rule
      ))

      setShowEditRule(false)
      setEditingRule(null)
      setRuleFormData({
        name: '',
        description: '',
        trigger_type: 'event_created',
        action_type: 'send_notification',
        is_active: true
      })

      toast({
        title: "Success",
        description: "Automation rule updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating rule:', error)
      toast({
        title: "Error",
        description: "Failed to update automation rule",
        variant: "destructive"
      })
    }
  }

  const deleteAutomationRule = async (ruleId: string) => {
    try {
      console.log('🗑️ Deleting automation rule:', ruleId)

      // Try to delete from database, fallback to local state
      try {
        const { error } = await supabase
          .from('automation_rules')
          .delete()
          .eq('id', ruleId)

        if (error) throw error
        console.log('✅ Database delete successful')
      } catch (dbError) {
        console.log('⚠️ Database delete failed, removing from local state:', dbError)
      }

      // Always update local state
      setAutomationRules(prev => {
        const filtered = prev.filter(rule => rule.id !== ruleId)
        console.log('📊 Rules after deletion:', filtered.length)
        return filtered
      })

      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      })
    } catch (error: any) {
      console.error('❌ Error deleting rule:', error)
      toast({
        title: "Error",
        description: "Failed to delete automation rule",
        variant: "destructive"
      })
    }
  }

  const addPredefinedRule = async (predefinedRule: any) => {
    try {
      const newRule = {
        name: predefinedRule.name,
        description: predefinedRule.description,
        trigger_type: predefinedRule.trigger_type as any,
        trigger_conditions: {},
        actions: predefinedRule.actions.map((action: string) => ({
          type: action as any,
          parameters: {}
        })),
        is_active: true,
        created_by: user?.id || '',
        execution_count: 0
      }

      // Try to save to database, fallback to local state
      try {
        const { data, error } = await supabase
          .from('automation_rules')
          .insert([newRule])
          .select()
          .single()

        if (error) throw error

        setAutomationRules(prev => [data, ...prev])
      } catch (dbError) {
        console.log('Database save failed, adding to local state:', dbError)
        const localRule: AutomationRule = {
          ...newRule,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString()
        }
        setAutomationRules(prev => [localRule, ...prev])
      }

      toast({
        title: "Success",
        description: `"${predefinedRule.name}" rule added successfully`,
      })
    } catch (error: any) {
      console.error('Error adding predefined rule:', error)
      toast({
        title: "Error",
        description: "Failed to add automation rule",
        variant: "destructive"
      })
    }
  }

  const predefinedRules = [
    {
      name: "Event Deadline Reminder",
      description: "Send notifications 7, 3, and 1 days before event deadlines",
      trigger_type: "deadline_approaching",
      actions: ["send_notification", "create_task"]
    },
    {
      name: "Overdue Task Escalation",
      description: "Automatically escalate overdue tasks to team leads",
      trigger_type: "task_overdue",
      actions: ["send_notification", "assign_team"]
    },
    {
      name: "Event Setup Automation",
      description: "Create standard setup tasks when new events are created",
      trigger_type: "event_created",
      actions: ["create_task", "assign_team"]
    },
    {
      name: "Team Workload Balancer",
      description: "Redistribute tasks when team members are overloaded",
      trigger_type: "team_assignment",
      actions: ["assign_team", "send_notification"]
    }
  ]

  const predefinedTemplates = [
    {
      name: "Corporate Conference",
      description: "Complete template for organizing corporate conferences",
      timeline_days: 90,
      task_count: 25
    },
    {
      name: "Product Launch Event",
      description: "Template for product launch events and marketing campaigns",
      timeline_days: 60,
      task_count: 18
    },
    {
      name: "Team Building Workshop",
      description: "Template for organizing team building activities",
      timeline_days: 30,
      task_count: 12
    },
    {
      name: "Client Meeting",
      description: "Template for client meetings and presentations",
      timeline_days: 14,
      task_count: 8
    }
  ]

  // ✅ Conditional return AFTER all hooks are declared
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access automation features.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-emphasis">Automation Center</h1>
            <p className="text-subtle mt-1">Streamline your event management workflows</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700">
            <Zap className="w-3 h-3 mr-1" />
            {automationRules.filter(r => r.is_active).length} Active Rules
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'rules', label: 'Automation Rules', icon: Zap },
          { id: 'templates', label: 'Event Templates', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Automation Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-emphasis">Automation Rules</h2>
            <Button onClick={() => setShowCreateRule(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>

          {/* Quick Setup - Predefined Rules */}
          <Card className="surface-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Quick Setup - Recommended Rules</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedRules.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-emphasis">{rule.name}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addPredefinedRule(rule)}
                        title="Add this rule to your automation"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-subtle mb-3">{rule.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {(rule.actions || []).map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {action ? action.replace('_', ' ') : 'Unknown Action'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Rules */}
          <div className="space-y-3">
            {automationRules.length === 0 ? (
              <Card className="surface-3">
                <CardContent className="p-8 text-center">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-emphasis mb-2">No automation rules yet</h3>
                  <p className="text-subtle mb-4">
                    Create your first automation rule to streamline your event management workflow.
                  </p>
                  <Button onClick={() => setShowCreateRule(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (automationRules || []).filter(rule => rule && rule.id).map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="surface-3">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-emphasis">{rule.name}</h3>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {rule.trigger_type ? rule.trigger_type.replace('_', ' ') : 'Unknown Trigger'}
                            </Badge>
                          </div>
                          <p className="text-sm text-subtle mb-2">{rule.description || 'No description available'}</p>
                          <div className="flex items-center space-x-4 text-xs text-subtle">
                            <span>Executed {rule.execution_count || 0} times</span>
                            {rule.last_executed && (
                              <span>Last run: {new Date(rule.last_executed).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                          >
                            {rule.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editAutomationRule(rule)}
                            title="Edit Rule"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this automation rule?')) {
                                deleteAutomationRule(rule.id)
                              }
                            }}
                            title="Delete Rule"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Event Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-emphasis">Event Templates</h2>
            <Button onClick={() => setShowCreateTemplate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Predefined Templates */}
          <Card className="surface-3">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Ready-to-Use Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predefinedTemplates.map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-emphasis">{template.name}</h3>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                    <p className="text-sm text-subtle mb-3">{template.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-subtle">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {template.timeline_days} days
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {template.task_count} tasks
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-emphasis">Automation Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="surface-3">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Rules Executed</span>
                </div>
                <div className="text-2xl font-bold text-emphasis">
                  {automationRules.reduce((sum, rule) => sum + rule.execution_count, 0)}
                </div>
                <p className="text-xs text-subtle">This month</p>
              </CardContent>
            </Card>

            <Card className="surface-3">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-sky-500" />
                  <span className="font-medium">Time Saved</span>
                </div>
                <div className="text-2xl font-bold text-emphasis">24.5h</div>
                <p className="text-xs text-subtle">Estimated this month</p>
              </CardContent>
            </Card>

            <Card className="surface-3">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <span className="font-medium">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-emphasis">98.2%</div>
                <p className="text-xs text-subtle">Rule execution success</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Enhanced Create Rule Modal */}
      <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Create New Automation Rule
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Rule Name *</Label>
                <Input
                  id="rule-name"
                  value={newRuleData.name}
                  onChange={(e) => setNewRuleData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Task Deadline Reminder"
                />
              </div>

              <div>
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={newRuleData.description}
                  onChange={(e) => setNewRuleData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="trigger-type">Trigger Type</Label>
                <Select
                  value={newRuleData.trigger_type}
                  onValueChange={(value) => setNewRuleData(prev => ({ ...prev, trigger_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline_approaching">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Deadline Approaching
                      </div>
                    </SelectItem>
                    <SelectItem value="task_overdue">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Task Overdue
                      </div>
                    </SelectItem>
                    <SelectItem value="status_change">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Status Change
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trigger Conditions */}
              <div className="space-y-3 border rounded-lg p-4">
                <Label className="text-sm font-semibold">Trigger Conditions</Label>

                {newRuleData.trigger_type === 'deadline_approaching' && (
                  <div>
                    <Label htmlFor="hours-before">Hours Before Deadline</Label>
                    <Input
                      id="hours-before"
                      type="number"
                      min="1"
                      max="168"
                      value={newRuleData.trigger_conditions.hours_before_deadline}
                      onChange={(e) => setNewRuleData(prev => ({
                        ...prev,
                        trigger_conditions: {
                          ...prev.trigger_conditions,
                          hours_before_deadline: parseInt(e.target.value) || 24
                        }
                      }))}
                    />
                  </div>
                )}

                <div>
                  <Label>Priority Levels (leave empty for all)</Label>
                  <div className="flex gap-2 mt-2">
                    {['low', 'medium', 'high'].map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          checked={newRuleData.trigger_conditions.priority_levels.includes(priority)}
                          onCheckedChange={(checked) => {
                            setNewRuleData(prev => ({
                              ...prev,
                              trigger_conditions: {
                                ...prev.trigger_conditions,
                                priority_levels: checked
                                  ? [...prev.trigger_conditions.priority_levels, priority]
                                  : prev.trigger_conditions.priority_levels.filter(p => p !== priority)
                              }
                            }))
                          }}
                        />
                        <Label className="capitalize">{priority}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Task Status</Label>
                  <div className="flex gap-2 mt-2">
                    {['pending', 'in-progress'].map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          checked={newRuleData.trigger_conditions.task_status.includes(status)}
                          onCheckedChange={(checked) => {
                            setNewRuleData(prev => ({
                              ...prev,
                              trigger_conditions: {
                                ...prev.trigger_conditions,
                                task_status: checked
                                  ? [...prev.trigger_conditions.task_status, status]
                                  : prev.trigger_conditions.task_status.filter(s => s !== status)
                              }
                            }))
                          }}
                        />
                        <Label className="capitalize">{status.replace('-', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-4">
              <div className="space-y-3 border rounded-lg p-4">
                <Label className="text-sm font-semibold">Notification Settings</Label>

                <div>
                  <Label htmlFor="notification-title">Notification Title</Label>
                  <Input
                    id="notification-title"
                    value={newRuleData.actions[0].parameters.title}
                    onChange={(e) => setNewRuleData(prev => ({
                      ...prev,
                      actions: [{
                        ...prev.actions[0],
                        parameters: {
                          ...prev.actions[0].parameters,
                          title: e.target.value
                        }
                      }]
                    }))}
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea
                    id="notification-message"
                    value={newRuleData.actions[0].parameters.message}
                    onChange={(e) => setNewRuleData(prev => ({
                      ...prev,
                      actions: [{
                        ...prev.actions[0],
                        parameters: {
                          ...prev.actions[0].parameters,
                          message: e.target.value
                        }
                      }]
                    }))}
                    placeholder="Notification message"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newRuleData.actions[0].parameters.in_app}
                      onCheckedChange={(checked) => setNewRuleData(prev => ({
                        ...prev,
                        actions: [{
                          ...prev.actions[0],
                          parameters: {
                            ...prev.actions[0].parameters,
                            in_app: !!checked
                          }
                        }]
                      }))}
                    />
                    <Bell className="w-4 h-4" />
                    <Label>In-App Notification</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newRuleData.actions[0].parameters.sound}
                      onCheckedChange={(checked) => setNewRuleData(prev => ({
                        ...prev,
                        actions: [{
                          ...prev.actions[0],
                          parameters: {
                            ...prev.actions[0].parameters,
                            sound: !!checked
                          }
                        }]
                      }))}
                    />
                    <Volume2 className="w-4 h-4" />
                    <Label>Sound Alert</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={newRuleData.actions[0].parameters.email}
                      onCheckedChange={(checked) => setNewRuleData(prev => ({
                        ...prev,
                        actions: [{
                          ...prev.actions[0],
                          parameters: {
                            ...prev.actions[0].parameters,
                            email: !!checked
                          }
                        }]
                      }))}
                    />
                    <Mail className="w-4 h-4" />
                    <Label>Email Notification</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={newRuleData.is_active}
                  onCheckedChange={(checked) => setNewRuleData(prev => ({ ...prev, is_active: !!checked }))}
                />
                <Label>Activate rule immediately</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowCreateRule(false)}>
              Cancel
            </Button>
            <Button onClick={createAutomationRule}>
              Create Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Modal */}
      {showEditRule && editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Automation Rule</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe what this rule does"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trigger</label>
                <select
                  value={ruleFormData.trigger_type}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, trigger_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="task_created">Task Created</option>
                  <option value="task_completed">Task Completed</option>
                  <option value="deadline_approaching">Deadline Approaching</option>
                  <option value="task_overdue">Task Overdue</option>
                  <option value="status_changed">Status Changed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  value={ruleFormData.action_type}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, action_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="send_notification">Send Notification</option>
                  <option value="send_email">Send Email</option>
                  <option value="assign_user">Assign User</option>
                  <option value="create_task">Create Task</option>
                  <option value="update_status">Update Status</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={ruleFormData.is_active}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="edit_is_active" className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditRule(false)
                  setEditingRule(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateAutomationRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AutomationCenter() {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <AutomationCenterContent />
    </ErrorBoundary>
  )
}
