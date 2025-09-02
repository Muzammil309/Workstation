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
}

export interface AutomationAction {
  type: 'create_task' | 'send_notification' | 'assign_team' | 'update_status' | 'schedule_reminder'
  parameters: any
}

export interface AutomationContext {
  trigger_data: any
  user_id: string
  timestamp: string
}

export class AutomationEngine {
  private static instance: AutomationEngine
  private isRunning = false
  private checkInterval = 60000 // Check every minute

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine()
    }
    return AutomationEngine.instance
  }

  async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🤖 Automation Engine started')
    
    // Start periodic checks
    this.scheduleNextCheck()
    
    // Set up real-time triggers
    this.setupRealtimeTriggers()
  }

  stop() {
    this.isRunning = false
    console.log('🤖 Automation Engine stopped')
  }

  private scheduleNextCheck() {
    if (!this.isRunning) return
    
    setTimeout(async () => {
      await this.runPeriodicChecks()
      this.scheduleNextCheck()
    }, this.checkInterval)
  }

  private async runPeriodicChecks() {
    try {
      await Promise.all([
        this.checkDeadlineApproaching(),
        this.checkOverdueTasks(),
        this.checkTeamWorkload()
      ])
    } catch (error) {
      console.error('Error in periodic automation checks:', error)
    }
  }

  private setupRealtimeTriggers() {
    // Listen for new tasks
    supabase
      .channel('automation_tasks')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => this.handleTaskCreated(payload.new)
      )
      .subscribe()

    // Listen for task status changes
    supabase
      .channel('automation_task_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => this.handleTaskUpdated(payload.old, payload.new)
      )
      .subscribe()
  }

  private async checkDeadlineApproaching() {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'deadline_approaching')
      .eq('is_active', true)

    if (!rules) return

    for (const rule of rules) {
      const daysToCheck = rule.trigger_conditions?.days_before || [7, 3, 1]
      
      for (const days of daysToCheck) {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + days)
        targetDate.setHours(0, 0, 0, 0)

        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        const { data: tasks } = await supabase
          .from('tasks')
          .select('*')
          .gte('deadline', targetDate.toISOString())
          .lt('deadline', nextDay.toISOString())
          .neq('status', 'completed')

        if (tasks && tasks.length > 0) {
          for (const task of tasks) {
            await this.executeRule(rule, {
              trigger_data: { task, days_until_deadline: days },
              user_id: rule.created_by,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
    }
  }

  private async checkOverdueTasks() {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'task_overdue')
      .eq('is_active', true)

    if (!rules) return

    const now = new Date()
    
    for (const rule of rules) {
      const hoursOverdue = rule.trigger_conditions?.hours_overdue || 24
      const priorityLevels = rule.trigger_conditions?.priority_levels || ['high', 'medium', 'low']

      const overdueThreshold = new Date(now.getTime() - (hoursOverdue * 60 * 60 * 1000))

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .lt('deadline', overdueThreshold.toISOString())
        .neq('status', 'completed')
        .in('priority', priorityLevels)

      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await this.executeRule(rule, {
            trigger_data: { task, hours_overdue: Math.floor((now.getTime() - new Date(task.deadline).getTime()) / (1000 * 60 * 60)) },
            user_id: rule.created_by,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }

  private async checkTeamWorkload() {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'team_assignment')
      .eq('is_active', true)

    if (!rules) return

    // Get team workload statistics
    const { data: workloadStats } = await supabase
      .rpc('get_team_workload_stats')

    if (workloadStats) {
      for (const rule of rules) {
        const maxTasksPerPerson = rule.trigger_conditions?.max_tasks_per_person || 10
        
        const overloadedMembers = workloadStats.filter((member: any) => 
          member.active_tasks > maxTasksPerPerson
        )

        if (overloadedMembers.length > 0) {
          await this.executeRule(rule, {
            trigger_data: { overloaded_members: overloadedMembers },
            user_id: rule.created_by,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }

  private async handleTaskCreated(task: any) {
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', 'event_created')
      .eq('is_active', true)

    if (!rules) return

    for (const rule of rules) {
      const eventTypes = rule.trigger_conditions?.event_types || ['all']
      
      if (eventTypes.includes('all') || eventTypes.includes(task.category)) {
        await this.executeRule(rule, {
          trigger_data: { task },
          user_id: rule.created_by,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  private async handleTaskUpdated(oldTask: any, newTask: any) {
    if (oldTask.status !== newTask.status) {
      const { data: rules } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_type', 'status_change')
        .eq('is_active', true)

      if (!rules) return

      for (const rule of rules) {
        const fromStatus = rule.trigger_conditions?.from_status
        const toStatus = rule.trigger_conditions?.to_status

        if ((!fromStatus || fromStatus === oldTask.status) && 
            (!toStatus || toStatus === newTask.status)) {
          await this.executeRule(rule, {
            trigger_data: { old_task: oldTask, new_task: newTask },
            user_id: rule.created_by,
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  }

  private async executeRule(rule: AutomationRule, context: AutomationContext) {
    const executionStart = Date.now()
    let status = 'success'
    let errorMessage = ''
    const actionsExecuted: any[] = []

    try {
      console.log(`🤖 Executing automation rule: ${rule.name}`)

      for (const action of rule.actions) {
        try {
          const result = await this.executeAction(action, context)
          actionsExecuted.push({ action: action.type, result, success: true })
        } catch (actionError: any) {
          console.error(`Error executing action ${action.type}:`, actionError)
          actionsExecuted.push({ action: action.type, error: actionError.message, success: false })
          status = 'partial'
        }
      }

      // Update execution count
      await supabase
        .from('automation_rules')
        .update({ 
          execution_count: rule.execution_count + 1,
          last_executed: new Date().toISOString()
        })
        .eq('id', rule.id)

    } catch (error: any) {
      console.error(`Error executing automation rule ${rule.name}:`, error)
      status = 'failed'
      errorMessage = error.message
    }

    // Log execution
    await supabase
      .from('automation_executions')
      .insert({
        rule_id: rule.id,
        trigger_data: context.trigger_data,
        actions_executed: actionsExecuted,
        status,
        error_message: errorMessage || null,
        execution_time_ms: Date.now() - executionStart
      })
  }

  private async executeAction(action: AutomationAction, context: AutomationContext): Promise<any> {
    switch (action.type) {
      case 'create_task':
        return await this.createTask(action.parameters, context)
      
      case 'send_notification':
        return await this.sendNotification(action.parameters, context)
      
      case 'assign_team':
        return await this.assignTeam(action.parameters, context)
      
      case 'update_status':
        return await this.updateStatus(action.parameters, context)
      
      case 'schedule_reminder':
        return await this.scheduleReminder(action.parameters, context)
      
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async createTask(parameters: any, context: AutomationContext) {
    const task = context.trigger_data.task
    const newTask = {
      title: parameters.title || `Auto: ${task?.title || 'Generated Task'}`,
      description: parameters.description || 'Automatically created task',
      priority: parameters.priority || 'medium',
      status: 'pending',
      progress: 0,
      assignees: parameters.assignees || [],
      project_id: task?.project_id,
      deadline: parameters.deadline_offset ? 
        new Date(Date.now() + (parameters.deadline_offset * 24 * 60 * 60 * 1000)).toISOString() : 
        null,
      created_by: context.user_id
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single()

    if (error) throw error
    return data
  }

  private async sendNotification(parameters: any, context: AutomationContext) {
    const message = parameters.message || 'Automation notification'
    const recipients = parameters.recipients || 'assignees'
    const task = context.trigger_data.task

    console.log('🔔 Automation sending notification:', { message, recipients, task: task?.title })

    try {
      // Determine who should receive the notification
      let userIds: string[] = []

      if (recipients === 'assignees' && task?.assignees) {
        userIds = Array.isArray(task.assignees) ? task.assignees : [task.assignees]
      } else if (recipients === 'creator' && task?.created_by) {
        userIds = [task.created_by]
      } else if (recipients === 'team_leads') {
        // Get team leads
        const { data: teamLeads } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'team_lead')
        userIds = teamLeads?.map(u => u.id) || []
      } else if (Array.isArray(recipients)) {
        userIds = recipients
      }

      // Send notification to each recipient
      for (const userId of userIds) {
        if (context.trigger_data.days_until_deadline !== undefined) {
          // This is a deadline reminder
          await notificationService.notifyDeadlineApproaching(
            userId,
            task?.title || 'Task',
            context.trigger_data.days_until_deadline * 24 // Convert days to hours
          )
        } else {
          // Generic automation notification
          await notificationService.createNotification({
            type: 'system_alert',
            userId,
            title: 'Automation Alert',
            message,
            priority: 'medium',
            actionUrl: '/dashboard?tab=tasks'
          })
        }
      }

      // Also show browser notification for immediate feedback
      showNotification('Automation Alert', message)

      console.log('✅ Automation notifications sent to', userIds.length, 'users')
      return { message, recipients: userIds, sent_at: new Date().toISOString() }

    } catch (error: any) {
      console.error('❌ Failed to send automation notification:', error)
      // Fallback to browser notification only
      showNotification('Automation Alert', message)
      return { message, recipients: 'fallback', error: error?.message || 'Unknown error', sent_at: new Date().toISOString() }
    }
  }

  private async assignTeam(parameters: any, context: AutomationContext) {
    const task = context.trigger_data.task || context.trigger_data.new_task
    if (!task) return

    const role = parameters.role
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', role)
      .limit(1)

    if (users && users.length > 0) {
      const { error } = await supabase
        .from('tasks')
        .update({ assignees: [users[0].id] })
        .eq('id', task.id)

      if (error) throw error
      return { assigned_to: users[0].id, role }
    }

    return { message: 'No users found with specified role' }
  }

  private async updateStatus(parameters: any, context: AutomationContext) {
    const task = context.trigger_data.task || context.trigger_data.new_task
    if (!task) return

    const { error } = await supabase
      .from('tasks')
      .update({ status: parameters.status })
      .eq('id', task.id)

    if (error) throw error
    return { updated_status: parameters.status }
  }

  private async scheduleReminder(parameters: any, context: AutomationContext) {
    // This would integrate with a job scheduler in a real implementation
    const reminderTime = new Date(Date.now() + (parameters.delay_hours * 60 * 60 * 1000))
    
    return { 
      scheduled_for: reminderTime.toISOString(),
      message: parameters.message 
    }
  }
}

// Initialize automation engine
export const automationEngine = AutomationEngine.getInstance()
