import { supabase } from './supabase'
import { showNotification } from './notifications'
import { notificationService } from './notification-service'

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger_type: 'deadline_approaching' | 'task_overdue' | 'event_created' | 'status_change' | 'team_assignment'
  trigger_conditions: any
  actions: AutomationAction[]
  is_active: boolean
  created_by: string
  execution_count: number
  created_at: string
  last_executed?: string
  updated_at?: string
}

export interface AutomationAction {
  type: 'send_notification' | 'send_email' | 'play_sound' | 'create_task' | 'assign_team' | 'update_status' | 'schedule_reminder'
  parameters: {
    title?: string
    message?: string
    sound?: boolean
    email?: boolean
    in_app?: boolean
    recipients?: string[]
    delay_minutes?: number
    task_data?: any
    status?: string
    assignee_id?: string
  }
}

export interface AutomationContext {
  trigger_data: any
  user_id: string
  timestamp: string
  task_id?: string
  task_data?: any
}

export interface TriggerConditions {
  hours_before_deadline?: number
  task_status?: string[]
  priority_levels?: string[]
  assignee_ids?: string[]
  project_ids?: string[]
  tags?: string[]
}

class AutomationEngine {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null
  private rules: AutomationRule[] = []
  private lastCheck = new Date()

  async start() {
    if (this.isRunning) return

    console.log('🤖 Starting Automation Engine...')
    this.isRunning = true

    // Load active rules
    await this.loadRules()

    // Start periodic checks every minute
    this.intervalId = setInterval(() => {
      this.checkTriggers()
    }, 60000) // Check every minute

    // Initial check
    this.checkTriggers()

    console.log('✅ Automation Engine started')
  }

  async stop() {
    if (!this.isRunning) return

    console.log('🛑 Stopping Automation Engine...')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    console.log('✅ Automation Engine stopped')
  }

  async loadRules() {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      this.rules = data || []
      console.log(`📋 Loaded ${this.rules.length} active automation rules`)
    } catch (error) {
      console.error('❌ Error loading automation rules:', error)
      this.rules = []
    }
  }

  async checkTriggers() {
    if (!this.isRunning) return

    console.log('🔍 Checking automation triggers...')

    for (const rule of this.rules) {
      try {
        await this.evaluateRule(rule)
      } catch (error) {
        console.error(`❌ Error evaluating rule ${rule.name}:`, error)
      }
    }

    this.lastCheck = new Date()
  }

  async evaluateRule(rule: AutomationRule) {
    switch (rule.trigger_type) {
      case 'deadline_approaching':
        await this.checkDeadlineApproaching(rule)
        break
      case 'task_overdue':
        await this.checkTaskOverdue(rule)
        break
      case 'status_change':
        // This would be triggered by real-time events, not periodic checks
        break
      default:
        console.log(`⚠️ Unknown trigger type: ${rule.trigger_type}`)
    }
  }

  async checkDeadlineApproaching(rule: AutomationRule) {
    const conditions = rule.trigger_conditions as TriggerConditions
    const hoursBeforeDeadline = conditions.hours_before_deadline || 24

    // Calculate the time window for approaching deadlines
    const now = new Date()
    const checkTime = new Date(now.getTime() + (hoursBeforeDeadline * 60 * 60 * 1000))

    try {
      // Get tasks with deadlines approaching
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .not('deadline', 'is', null)
        .lte('deadline', checkTime.toISOString())
        .gte('deadline', now.toISOString())
        .neq('status', 'completed')

      if (error) throw error

      for (const task of tasks || []) {
        // Check if this task matches the rule conditions
        if (this.taskMatchesConditions(task, conditions)) {
          // Check if we've already notified about this task recently
          const shouldExecute = await this.shouldExecuteForTask(rule.id, task.id)

          if (shouldExecute) {
            await this.executeActions(rule, {
              trigger_data: { task, deadline: task.deadline },
              user_id: task.assignee_id || task.created_by,
              timestamp: now.toISOString(),
              task_id: task.id,
              task_data: task
            })
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking deadline approaching:', error)
    }
  }

  async checkTaskOverdue(rule: AutomationRule) {
    const conditions = rule.trigger_conditions as TriggerConditions
    const now = new Date()

    try {
      // Get overdue tasks
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .not('deadline', 'is', null)
        .lt('deadline', now.toISOString())
        .neq('status', 'completed')

      if (error) throw error

      for (const task of tasks || []) {
        if (this.taskMatchesConditions(task, conditions)) {
          const shouldExecute = await this.shouldExecuteForTask(rule.id, task.id)

          if (shouldExecute) {
            await this.executeActions(rule, {
              trigger_data: { task, overdue_hours: Math.floor((now.getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60)) },
              user_id: task.assignee_id || task.created_by,
              timestamp: now.toISOString(),
              task_id: task.id,
              task_data: task
            })
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking overdue tasks:', error)
    }
  }

  taskMatchesConditions(task: any, conditions: TriggerConditions): boolean {
    // Check priority levels
    if (conditions.priority_levels && conditions.priority_levels.length > 0) {
      if (!conditions.priority_levels.includes(task.priority)) {
        return false
      }
    }

    // Check task status
    if (conditions.task_status && conditions.task_status.length > 0) {
      if (!conditions.task_status.includes(task.status)) {
        return false
      }
    }

    // Check assignee
    if (conditions.assignee_ids && conditions.assignee_ids.length > 0) {
      if (!conditions.assignee_ids.includes(task.assignee_id)) {
        return false
      }
    }

    // Check project
    if (conditions.project_ids && conditions.project_ids.length > 0) {
      if (!conditions.project_ids.includes(task.project_id)) {
        return false
      }
    }

    return true
  }

  async shouldExecuteForTask(ruleId: string, taskId: string): Promise<boolean> {
    try {
      // Check if we've executed this rule for this task in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('automation_executions')
        .select('*')
        .eq('rule_id', ruleId)
        .eq('task_id', taskId)
        .gte('executed_at', oneHourAgo.toISOString())
        .limit(1)

      if (error) {
        console.error('Error checking execution history:', error)
        return true // Default to allowing execution
      }

      return !data || data.length === 0
    } catch (error) {
      console.error('Error checking execution history:', error)
      return true
    }
  }

  async executeActions(rule: AutomationRule, context: AutomationContext) {
    console.log(`🚀 Executing automation rule: ${rule.name}`)

    for (const action of rule.actions) {
      try {
        await this.executeAction(action, context)
      } catch (error) {
        console.error(`❌ Error executing action ${action.type}:`, error)
      }
    }

    // Record execution
    await this.recordExecution(rule.id, context)

    // Update rule execution count and last executed time
    await supabase
      .from('automation_rules')
      .update({
        execution_count: rule.execution_count + 1,
        last_executed: new Date().toISOString()
      })
      .eq('id', rule.id)
  }

  async executeAction(action: AutomationAction, context: AutomationContext) {
    switch (action.type) {
      case 'send_notification':
        await this.sendNotification(action, context)
        break
      case 'send_email':
        await this.sendEmail(action, context)
        break
      case 'play_sound':
        await this.playSound(action, context)
        break
      default:
        console.log(`⚠️ Unknown action type: ${action.type}`)
    }
  }

  async sendNotification(action: AutomationAction, context: AutomationContext) {
    const { title, message } = action.parameters
    const task = context.task_data

    const notificationTitle = title || `Task Deadline Reminder`
    const notificationMessage = message || `Task "${task?.title}" is due soon!`

    // Send in-app notification
    if (action.parameters.in_app !== false) {
      showNotification(notificationTitle, notificationMessage)

      // Also trigger through notification service
      try {
        await notificationService.createNotification({
          type: 'system_alert',
          userId: context.user_id,
          title: notificationTitle,
          message: notificationMessage,
          priority: 'medium'
        })
      } catch (error) {
        console.error('Error creating notification:', error)
      }
    }

    // Play sound if enabled
    if (action.parameters.sound) {
      try {
        await this.playNotificationSound()
      } catch (error) {
        console.error('Error playing notification sound:', error)
      }
    }

    console.log(`📢 Sent notification: ${notificationTitle}`)
  }

  async sendEmail(action: AutomationAction, context: AutomationContext) {
    // Email functionality would require email service integration
    console.log('📧 Email notification (not implemented yet)')
  }

  async playSound(action: AutomationAction, context: AutomationContext) {
    await this.playNotificationSound()
  }

  async playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // Play a gentle notification sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  async recordExecution(ruleId: string, context: AutomationContext) {
    try {
      await supabase
        .from('automation_executions')
        .insert({
          rule_id: ruleId,
          task_id: context.task_id,
          executed_at: new Date().toISOString(),
          context: context
        })
    } catch (error) {
      console.error('Error recording execution:', error)
    }
  }

  // Method to trigger status change automations
  async triggerStatusChange(taskId: string, oldStatus: string, newStatus: string, userId: string) {
    const statusChangeRules = this.rules.filter(rule => rule.trigger_type === 'status_change')

    for (const rule of statusChangeRules) {
      const conditions = rule.trigger_conditions as TriggerConditions

      // Check if this status change matches the rule conditions
      if (conditions.task_status && !conditions.task_status.includes(newStatus)) {
        continue
      }

      try {
        // Get task data
        const { data: task, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single()

        if (error) throw error

        if (this.taskMatchesConditions(task, conditions)) {
          await this.executeActions(rule, {
            trigger_data: { task, old_status: oldStatus, new_status: newStatus },
            user_id: userId,
            timestamp: new Date().toISOString(),
            task_id: taskId,
            task_data: task
          })
        }
      } catch (error) {
        console.error(`Error executing status change rule ${rule.name}:`, error)
      }
    }
  }

  // Method to add new rules
  async addRule(rule: Omit<AutomationRule, 'id' | 'execution_count' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          ...rule,
          execution_count: 0
        })
        .select()
        .single()

      if (error) throw error

      // Reload rules to include the new one
      await this.loadRules()

      return data
    } catch (error) {
      console.error('Error adding automation rule:', error)
      throw error
    }
  }

  // Method to update rules
  async updateRule(id: string, updates: Partial<AutomationRule>) {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Reload rules
      await this.loadRules()

      return data
    } catch (error) {
      console.error('Error updating automation rule:', error)
      throw error
    }
  }

  // Method to delete rules
  async deleteRule(id: string) {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Reload rules
      await this.loadRules()
    } catch (error) {
      console.error('Error deleting automation rule:', error)
      throw error
    }
  }
}

// Create and export singleton instance
export const automationEngine = new AutomationEngine()

// Auto-start the engine when imported
if (typeof window !== 'undefined') {
  automationEngine.start()
}
