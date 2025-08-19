"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Task {
  id: string
  title: string
  description: string
  project: string
  duration: string
  assignedOn: string
  status: 'pending' | 'in-progress' | 'completed'
  deadline: string
  actualTime?: string
  notes?: string
  assignee: string
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  tags?: string[]
  dependencies?: string[]
  progress?: number
  autoDelete?: {
    enabled: boolean
    duration: number
    createdAt?: string
  }
}

interface TaskExportProps {
  tasks: Task[]
  onClose: () => void
}

export function TaskExport({ tasks, onClose }: TaskExportProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeCompleted, setIncludeCompleted] = useState(true)

  const exportToCSV = () => {
    const filteredTasks = filterTasks()
    const headers = ['Title', 'Description', 'Project', 'Status', 'Priority', 'Assignee', 'Deadline', 'Progress', 'Tags']
    
    const csvContent = [
      headers.join(','),
      ...filteredTasks.map(task => [
        `"${task.title}"`,
        `"${task.description}"`,
        `"${task.project}"`,
        task.status,
        task.priority,
        `"${task.assignee}"`,
        task.deadline,
        task.progress || 0,
        `"${task.tags?.join('; ') || ''}"`
      ].join(','))
    ].join('\n')

    downloadFile(csvContent, 'tasks.csv', 'text/csv')
  }

  const exportToJSON = () => {
    const filteredTasks = filterTasks()
    const jsonContent = JSON.stringify(filteredTasks, null, 2)
    downloadFile(jsonContent, 'tasks.json', 'application/json')
  }

  const exportToPDF = () => {
    // This would integrate with a PDF library like jsPDF
    // For now, we'll show a placeholder
    alert('PDF export functionality would be implemented here with jsPDF library')
  }

  const filterTasks = () => {
    let filtered = tasks

    // Filter by completion status
    if (!includeCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed')
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date()
      const start = new Date()
      
      switch (dateRange) {
        case 'week':
          start.setDate(now.getDate() - 7)
          break
        case 'month':
          start.setMonth(now.getMonth() - 1)
          break
        case 'custom':
          if (startDate && endDate) {
            const startDateObj = new Date(startDate)
            const endDateObj = new Date(endDate)
            filtered = filtered.filter(task => {
              const taskDate = new Date(task.assignedOn)
              return taskDate >= startDateObj && taskDate <= endDateObj
            })
          }
          break
      }

      if (dateRange !== 'custom') {
        filtered = filtered.filter(task => {
          const taskDate = new Date(task.assignedOn)
          return taskDate >= start
        })
      }
    }

    return filtered
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    switch (exportFormat) {
      case 'csv':
        exportToCSV()
        break
      case 'json':
        exportToJSON()
        break
      case 'pdf':
        exportToPDF()
        break
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background border rounded-lg shadow-xl p-6 max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Export Tasks</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          ×
        </Button>
      </div>

      <div className="space-y-6">
        {/* Export Format */}
        <div className="space-y-3">
          <Label>Export Format</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={exportFormat === 'csv' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('csv')}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>CSV</span>
            </Button>
            <Button
              variant={exportFormat === 'json' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('json')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>JSON</span>
            </Button>
            <Button
              variant={exportFormat === 'pdf' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setExportFormat('pdf')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label>Date Range</Label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeCompleted"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="includeCompleted">Include completed tasks</Label>
          </div>
        </div>

        {/* Export Button */}
        <Button onClick={handleExport} className="w-full" variant="neon">
          <Download className="h-4 w-4 mr-2" />
          Export Tasks ({filterTasks().length})
        </Button>
      </div>
      </motion.div>
    </motion.div>
  )
}
