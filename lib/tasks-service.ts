import { supabase } from './supabase'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee_id?: string
  project_id?: string
  deadline?: string
  progress: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  assignee_id?: string
  project_id?: string
  deadline?: string
  progress?: number
}

export class TasksService {
  // Get all tasks for the current user
  static async getTasks(): Promise<Task[]> {
    try {
      console.log('🔍 TasksService.getTasks() called')
      console.log('🔍 Supabase client:', supabase)
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('🔍 Raw Supabase response:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error in getTasks:', error)
        throw error
      }
      
      console.log('✅ TasksService.getTasks() successful, returning:', data)
      return data || []
    } catch (error) {
      console.error('❌ Error in TasksService.getTasks():', error)
      throw error
    }
  }

  // Create a new task
  static async createTask(taskData: CreateTaskData, userId: string): Promise<Task> {
    try {
      console.log('🔍 TasksService.createTask called with:', { taskData, userId })
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description || '',
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          assignee_id: taskData.assignee_id || null,
          project_id: taskData.project_id || null,
          deadline: taskData.deadline || null,
          progress: taskData.progress || 0,
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      console.log('🔍 Supabase insert result:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error in createTask:', error)
        throw error
      }
      
      console.log('✅ TasksService.createTask successful, returning:', data)
      return data
    } catch (error) {
      console.error('❌ Error in TasksService.createTask:', error)
      throw error
    }
  }

  // Update a task
  static async updateTask(taskId: string, updates: Partial<CreateTaskData>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  // Get tasks by status
  static async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching tasks by status:', error)
      throw error
    }
  }
}