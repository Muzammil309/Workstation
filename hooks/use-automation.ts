import { useState, useEffect } from 'react'
import { automationEngine, AutomationRule } from '@/lib/automation-engine'
import { supabase } from '@/lib/supabase'
import { useAuth } from './use-auth'
import { useToast } from './use-toast'

export function useAutomation() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEngineRunning, setIsEngineRunning] = useState(false)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      initializeAutomation()
    }
  }, [user])

  const initializeAutomation = async () => {
    try {
      // Start the automation engine
      await automationEngine.start()
      setIsEngineRunning(true)
      
      // Load user's automation rules
      await loadRules()
      
      toast({
        title: "Automation Engine Started",
        description: "Your automation rules are now active",
      })
    } catch (error) {
      console.error('Failed to initialize automation:', error)
      toast({
        title: "Automation Error",
        description: "Failed to start automation engine",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadRules = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRules(data || [])
    } catch (error) {
      console.error('Error loading automation rules:', error)
    }
  }

  const createRule = async (ruleData: Partial<AutomationRule>) => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert([{
          ...ruleData,
          created_by: user.id,
          execution_count: 0
        }])
        .select()
        .single()

      if (error) throw error

      setRules(prev => [data, ...prev])
      
      toast({
        title: "Rule Created",
        description: `Automation rule "${data.name}" has been created`,
      })

      return data
    } catch (error: any) {
      console.error('Error creating automation rule:', error)
      toast({
        title: "Error",
        description: "Failed to create automation rule",
        variant: "destructive"
      })
      return null
    }
  }

  const updateRule = async (ruleId: string, updates: Partial<AutomationRule>) => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update(updates)
        .eq('id', ruleId)
        .eq('created_by', user?.id)
        .select()
        .single()

      if (error) throw error

      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...data } : rule
      ))

      toast({
        title: "Rule Updated",
        description: "Automation rule has been updated",
      })

      return data
    } catch (error: any) {
      console.error('Error updating automation rule:', error)
      toast({
        title: "Error",
        description: "Failed to update automation rule",
        variant: "destructive"
      })
      return null
    }
  }

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId)
        .eq('created_by', user?.id)

      if (error) throw error

      setRules(prev => prev.filter(rule => rule.id !== ruleId))

      toast({
        title: "Rule Deleted",
        description: "Automation rule has been deleted",
      })
    } catch (error: any) {
      console.error('Error deleting automation rule:', error)
      toast({
        title: "Error",
        description: "Failed to delete automation rule",
        variant: "destructive"
      })
    }
  }

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    return await updateRule(ruleId, { is_active: !isActive })
  }

  const getExecutionStats = async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('automation_executions')
        .select(`
          *,
          automation_rules!inner(created_by)
        `)
        .eq('automation_rules.created_by', user.id)
        .gte('executed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      if (error) throw error

      const stats = {
        total_executions: data?.length || 0,
        successful_executions: data?.filter(e => e.status === 'success').length || 0,
        failed_executions: data?.filter(e => e.status === 'failed').length || 0,
        average_execution_time: data?.length ? 
          data.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / data.length : 0,
        success_rate: data?.length ? 
          (data.filter(e => e.status === 'success').length / data.length) * 100 : 0
      }

      return stats
    } catch (error) {
      console.error('Error getting execution stats:', error)
      return null
    }
  }

  const createFromTemplate = async (templateName: string, eventData: any) => {
    const templates = {
      'deadline_reminder': {
        name: 'Event Deadline Reminder',
        description: 'Send notifications before event deadlines',
        trigger_type: 'deadline_approaching' as const,
        trigger_conditions: { days_before: [7, 3, 1] },
        actions: [
          {
            type: 'send_notification' as const,
            parameters: {
              message: `Event "${eventData.title}" deadline is approaching`,
              recipients: ['assignees']
            }
          }
        ]
      },
      'overdue_escalation': {
        name: 'Overdue Task Escalation',
        description: 'Escalate overdue tasks to team leads',
        trigger_type: 'task_overdue' as const,
        trigger_conditions: { hours_overdue: 24 },
        actions: [
          {
            type: 'send_notification' as const,
            parameters: {
              message: 'Task is overdue and needs immediate attention',
              recipients: ['team_leads']
            }
          },
          {
            type: 'assign_team' as const,
            parameters: { role: 'team_lead' }
          }
        ]
      },
      'event_setup': {
        name: 'Event Setup Automation',
        description: 'Create setup tasks for new events',
        trigger_type: 'event_created' as const,
        trigger_conditions: { event_types: ['conference', 'meeting'] },
        actions: [
          {
            type: 'create_task' as const,
            parameters: {
              title: 'Setup venue and equipment',
              priority: 'high',
              deadline_offset: -7
            }
          },
          {
            type: 'create_task' as const,
            parameters: {
              title: 'Prepare presentation materials',
              priority: 'medium',
              deadline_offset: -3
            }
          }
        ]
      }
    }

    const template = templates[templateName as keyof typeof templates]
    if (!template) {
      throw new Error(`Template "${templateName}" not found`)
    }

    return await createRule(template)
  }

  return {
    // State
    isEngineRunning,
    rules,
    isLoading,
    
    // Actions
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    loadRules,
    getExecutionStats,
    createFromTemplate,
    
    // Computed
    activeRulesCount: rules.filter(r => r.is_active).length,
    totalExecutions: rules.reduce((sum, r) => sum + r.execution_count, 0)
  }
}
