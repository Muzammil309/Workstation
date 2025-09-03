"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PenTool,
  Square,
  Circle,
  Type,
  Eraser,
  Download,
  Upload,
  Trash2,
  Undo,
  Redo,
  Camera,
  Plus,
  Users,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { useNotificationTriggers } from '@/lib/notification-context'
import { ErrorBoundary, DashboardErrorFallback } from '@/components/error-boundary'
import { useUsers } from '@/hooks/use-users'

interface DrawingElement {
  id: string
  type: 'pen' | 'rectangle' | 'circle' | 'text'
  points?: number[]
  x?: number
  y?: number
  width?: number
  height?: number
  text?: string
  color: string
  strokeWidth: number
  created_by: string
  created_at: string
}

interface TaskCreationData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assignee: string
}

function WhiteboardContent() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const { users: cachedUsers } = useUsers()

  const { notifyTaskAssigned } = useNotificationTriggers()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [history, setHistory] = useState<DrawingElement[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showTaskCreation, setShowTaskCreation] = useState(false)
  const [selectedArea, setSelectedArea] = useState<{x: number, y: number, width: number, height: number} | null>(null)
  const [taskData, setTaskData] = useState<TaskCreationData>({
    title: '',
    description: '',
    priority: 'medium',
    assignee: ''
  })
  const [users, setUsers] = useState<any[]>([])
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null)
  const [isCollaborating, setIsCollaborating] = useState(false)
  const isMountedRef = useRef(true)

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ]

  // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    const initializeWhiteboard = async () => {
      try {
        await Promise.all([loadUsers(), loadWhiteboardData()])
        setupRealtimeSubscription()
      } catch (error) {
        console.error('Failed to initialize whiteboard:', error)
        toast({
          title: "Error",
          description: "Failed to initialize whiteboard",
          variant: "destructive"
        })
      }
    }

    initializeWhiteboard()

    return () => {
      // Set mounted ref to false and cleanup subscription on unmount
      isMountedRef.current = false
      supabase.removeAllChannels()
    }
  }, [])

  const loadUsers = async () => {
    try {
      // Use shared cached users to avoid extra network calls during init
      setUsers(cachedUsers || [])
    } catch (error: any) {
      console.error('Error loading users:', error)
    }
  }

  const loadWhiteboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('whiteboard_elements')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setElements(data || [])
      redrawCanvas(data || [])
    } catch (error: any) {
      console.error('Error loading whiteboard data:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('whiteboard_realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whiteboard_elements' },
        (payload) => {
          console.log('🎨 New whiteboard element received:', payload.new)
          const newElement = payload.new as DrawingElement

          // Only add if it's from another user and component is mounted
          if (newElement.created_by !== user?.id && isMountedRef.current) {
            setElements(prev => {
              const updated = [...prev, newElement]
              redrawCanvas(updated)
              return updated
            })
            setIsCollaborating(true)
            setTimeout(() => {
              if (isMountedRef.current) {
                setIsCollaborating(false)
              }
            }, 2000)
          }
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'whiteboard_elements' },
        (payload) => {
          console.log('🗑️ Whiteboard element deleted:', payload.old)
          // Only update state if component is still mounted
          if (isMountedRef.current) {
            setElements(prev => {
              const updated = prev.filter(el => el.id !== payload.old.id)
              redrawCanvas(updated)
              return updated
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('🔗 Whiteboard subscription status:', status)
      })

    return subscription
  }

  const saveElement = async (element: DrawingElement) => {
    try {
      const { error } = await supabase
        .from('whiteboard_elements')
        .insert([element])

      if (error) throw error
    } catch (error: any) {
      console.error('Error saving element:', error)
    }
  }

  const redrawCanvas = (elementsToRender: DrawingElement[]) => {
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        console.warn('Canvas ref is null, skipping redraw')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.warn('Canvas context is null, skipping redraw')
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

    elementsToRender.forEach(element => {
      ctx.strokeStyle = element.color
      ctx.lineWidth = element.strokeWidth
      ctx.lineCap = 'round'

      switch (element.type) {
        case 'pen':
          if (element.points && element.points.length > 2) {
            ctx.beginPath()
            ctx.moveTo(element.points[0], element.points[1])
            for (let i = 2; i < element.points.length; i += 2) {
              ctx.lineTo(element.points[i], element.points[i + 1])
            }
            ctx.stroke()
          }
          break
        case 'rectangle':
          if (element.x && element.y && element.width && element.height) {
            ctx.strokeRect(element.x, element.y, element.width, element.height)
          }
          break
        case 'circle':
          if (element.x && element.y && element.width) {
            ctx.beginPath()
            ctx.arc(element.x + element.width / 2, element.y + element.width / 2, element.width / 2, 0, 2 * Math.PI)
            ctx.stroke()
          }
          break
        case 'text':
          if (element.x && element.y && element.text) {
            ctx.font = `${element.strokeWidth * 8}px Arial`
            ctx.fillStyle = element.color
            ctx.fillText(element.text, element.x, element.y)
          }
          break
      }
    })
    } catch (error) {
      console.error('Error redrawing canvas:', error)
      // Don't use handleError in render functions to avoid hook issues
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      const canvas = canvasRef.current
      if (!canvas) {
        console.warn('Canvas ref is null in startDrawing')
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setIsDrawing(true)
      setStartPoint({ x, y })

      if (currentTool === 'pen') {
        const newElement: DrawingElement = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'pen',
          points: [x, y],
          color: currentColor,
          strokeWidth,
          created_by: user?.id || '',
          created_at: new Date().toISOString()
        }
        setElements(prev => [...prev, newElement])
      } else if (currentTool === 'text') {
        const text = prompt('Enter text:')
        if (text) {
          const newElement: DrawingElement = {
            id: `${Date.now()}-${Math.random()}`,
            type: 'text',
            x,
            y,
            text,
            color: currentColor,
            strokeWidth,
            created_by: user?.id || '',
            created_at: new Date().toISOString()
          }
          setElements(prev => [...prev, newElement])
          saveElement(newElement)
          redrawCanvas([...elements, newElement])
        }
        setIsDrawing(false)
      }
    } catch (error) {
      console.error('Error in startDrawing:', error)
      setIsDrawing(false)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool !== 'pen') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setElements(prev => {
      const newElements = [...prev]
      const lastElement = newElements[newElements.length - 1]
      if (lastElement && lastElement.type === 'pen' && lastElement.points) {
        lastElement.points.push(x, y)
      }
      return newElements
    })

    redrawCanvas(elements)
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    if (currentTool === 'pen') {
      const lastElement = elements[elements.length - 1]
      if (lastElement) {
        saveElement(lastElement)
      }
    } else if ((currentTool === 'rectangle' || currentTool === 'circle') && startPoint && e) {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const endX = e.clientX - rect.left
      const endY = e.clientY - rect.top

      const width = Math.abs(endX - startPoint.x)
      const height = Math.abs(endY - startPoint.y)
      const x = Math.min(startPoint.x, endX)
      const y = Math.min(startPoint.y, endY)

      const newElement: DrawingElement = {
        id: `${Date.now()}-${Math.random()}`,
        type: currentTool,
        x,
        y,
        width,
        height,
        color: currentColor,
        strokeWidth,
        created_by: user?.id || '',
        created_at: new Date().toISOString()
      }

      setElements(prev => [...prev, newElement])
      saveElement(newElement)
      redrawCanvas([...elements, newElement])
    }

    setIsDrawing(false)
    setStartPoint(null)
  }

  const clearCanvas = async () => {
    try {
      const { error } = await supabase
        .from('whiteboard_elements')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) throw error

      setElements([])
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
      }

      toast({
        title: "Canvas cleared",
        description: "All drawings have been removed",
      })
    } catch (error: any) {
      console.error('Error clearing canvas:', error)
      toast({
        title: "Error",
        description: "Failed to clear canvas",
        variant: "destructive"
      })
    }
  }

  const takeScreenshot = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL()
    link.click()

    toast({
      title: "Screenshot saved",
      description: "Whiteboard screenshot has been downloaded",
    })
  }

  const createTaskFromArea = async () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('🎨 Creating task from whiteboard:', taskData)

      const newTask = {
        title: taskData.title,
        description: taskData.description || 'Created from whiteboard collaboration',
        priority: taskData.priority,
        status: 'pending',
        progress: 0,
        assignees: taskData.assignee ? [taskData.assignee] : [],
        created_by: user?.id || '',
        project_id: null,
        deadline: null,
        estimated_hours: 0,
        tags: ['whiteboard'],
        dependencies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single()

      if (error) throw error

      // Trigger notification for assigned user
      if (taskData.assignee && taskData.assignee !== user?.id) {
        const assignedUser = users.find(u => u.id === taskData.assignee)
        if (assignedUser) {
          await notifyTaskAssigned(taskData.title, user?.name || user?.email || 'Whiteboard User')
        }
      }

      // Save whiteboard context with the task
      if (selectedArea) {
        try {
          await supabase
            .from('whiteboard_tasks')
            .insert([{
              task_id: data.id,
              whiteboard_area: selectedArea,
              created_by: user?.id,
              created_at: new Date().toISOString()
            }])
        } catch (contextError) {
          console.log('Failed to save whiteboard context:', contextError)
        }
      }

      toast({
        title: "Task created successfully",
        description: `"${taskData.title}" has been created from whiteboard content`,
      })

      setShowTaskCreation(false)
      setTaskData({ title: '', description: '', priority: 'medium', assignee: '' })
      setSelectedArea(null)
    } catch (error: any) {
      console.error('❌ Error creating task from whiteboard:', error)
      toast({
        title: "Error",
        description: "Failed to create task from whiteboard",
        variant: "destructive"
      })
    }
  }

  // ✅ Conditional return AFTER all hooks are declared
  // Show loading spinner while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Loading whiteboard...</p>
        </div>
      </div>
    )
  }

  // Show login prompt only if authentication check is complete and user is not logged in
  if (!user && !authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access the whiteboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Collaborative Whiteboard</h1>
          <p className="text-subtle mt-1">Draw, plan, and create tasks together</p>
        </div>

        <div className="flex items-center space-x-2">
          {isCollaborating && (
            <Badge variant="default" className="px-3 py-1 bg-green-500 text-white animate-pulse">
              <Users className="w-3 h-3 mr-1" />
              Live collaboration
            </Badge>
          )}
          <Badge variant="outline" className="px-3 py-1">
            <Users className="w-3 h-3 mr-1" />
            {users.length} team members
          </Badge>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="surface-3">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Drawing Tools */}
            <div className="flex items-center space-x-2">
              <Button
                variant={currentTool === 'pen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('pen')}
              >
                <PenTool className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('rectangle')}
              >
                <Square className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('circle')}
              >
                <Circle className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('text')}
              >
                <Type className="w-4 h-4" />
              </Button>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentTool('eraser')}
              >
                <Eraser className="w-4 h-4" />
              </Button>
            </div>

            {/* Colors */}
            <div className="flex items-center space-x-1">
              <Palette className="w-4 h-4 text-muted-foreground" />
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    currentColor === color ? 'border-primary' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>

            {/* Stroke Width */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground w-6">{strokeWidth}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-auto">
              <Button variant="outline" size="sm" onClick={takeScreenshot}>
                <Camera className="w-4 h-4 mr-2" />
                Screenshot
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowTaskCreation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="surface-3">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="w-full border rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </CardContent>
      </Card>

      {/* Task Creation Modal */}
      {showTaskCreation && (
        <Card className="surface-3">
          <CardHeader>
            <CardTitle>Create Task from Whiteboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Assign to</label>
                <select
                  value={taskData.assignee}
                  onChange={(e) => setTaskData(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select team member...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTaskCreation(false)}>
                Cancel
              </Button>
              <Button onClick={createTaskFromArea}>
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export wrapped component with error boundary
export function Whiteboard() {
  return (
    <ErrorBoundary fallback={DashboardErrorFallback}>
      <WhiteboardContent />
    </ErrorBoundary>
  )
}
