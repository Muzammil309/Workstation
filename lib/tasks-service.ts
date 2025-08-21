import { supabase } from './supabase'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee_id?: string
  assignee?: string
  project_id?: string
  deadline?: string
  assigned_on?: string
  actual_time?: string
  estimated_hours?: number
  progress: number
  tags?: string[]
  dependencies?: string[]
  auto_delete?: any
  created_by?: string
  created_at: string
  updated_at?: string
}

export interface CreateTaskData {
  title: string
  description?: string
  status?: 'pending' | 'in-progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  assignee_id?: string
  assignee?: string
  project_id?: string
  deadline?: string
  assigned_on?: string
  actual_time?: string
  estimated_hours?: number
  progress?: number
  tags?: string[]
  dependencies?: string[]
  auto_delete?: any
}

export class TasksService {
  // Get all tasks for the current user
  static async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      throw error
    }
  }

  // Create a new task
  static async createTask(taskData: CreateTaskData, userId: string): Promise<Task> {
    try {
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
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
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
      throw error
    }
  }
}