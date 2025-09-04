"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Calendar, Clock, User, Mail, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'glass' | 'gradient'
}

export const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, label, error, icon, variant = 'default', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputVariants = {
      default: "bg-dark-surface border-glass-border",
      glass: "glass-morphism",
      gradient: "bg-gradient-to-r from-dark-surface to-dark-bg-secondary border-brand-primary/30"
    }

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {label && (
          <Label className="text-sm font-medium text-text-primary">
            {label}
          </Label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "transition-all duration-300 border-2",
              inputVariants[variant],
              icon && "pl-10",
              isPassword && "pr-10",
              isFocused && "border-brand-primary shadow-glow",
              error && "border-red-500",
              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

ModernInput.displayName = "ModernInput"

interface ModernTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  variant?: 'default' | 'glass' | 'gradient'
}

export const ModernTextarea = React.forwardRef<HTMLTextAreaElement, ModernTextareaProps>(
  ({ className, label, error, variant = 'default', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const textareaVariants = {
      default: "bg-dark-surface border-glass-border",
      glass: "glass-morphism",
      gradient: "bg-gradient-to-r from-dark-surface to-dark-bg-secondary border-brand-primary/30"
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        {label && (
          <Label className="text-sm font-medium text-text-primary">
            {label}
          </Label>
        )}
        
        <Textarea
          ref={ref}
          className={cn(
            "transition-all duration-300 border-2 min-h-[100px]",
            textareaVariants[variant],
            isFocused && "border-brand-primary shadow-glow",
            error && "border-red-500",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

ModernTextarea.displayName = "ModernTextarea"

interface ModernSelectProps {
  label?: string
  error?: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  value?: string
  onValueChange?: (value: string) => void
  variant?: 'default' | 'glass' | 'gradient'
}

export const ModernSelect: React.FC<ModernSelectProps> = ({
  label,
  error,
  placeholder,
  options,
  value,
  onValueChange,
  variant = 'default'
}) => {
  const selectVariants = {
    default: "bg-dark-surface border-glass-border",
    glass: "glass-morphism",
    gradient: "bg-gradient-to-r from-dark-surface to-dark-bg-secondary border-brand-primary/30"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {label && (
        <Label className="text-sm font-medium text-text-primary">
          {label}
        </Label>
      )}
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn(
          "transition-all duration-300 border-2",
          selectVariants[variant],
          error && "border-red-500"
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="glass-morphism border-glass-border">
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-glass-bg focus:bg-glass-bg"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, ...props }, ref) => {
    const buttonVariants = {
      primary: "bg-brand-primary hover:bg-brand-primary/90 text-white",
      secondary: "bg-dark-surface hover:bg-dark-surface/80 text-text-primary border border-glass-border",
      ghost: "hover:bg-glass-bg text-text-primary",
      gradient: "bg-gradient-primary hover:opacity-90 text-white"
    }

    const buttonSizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
      lg: "h-12 px-6 text-lg"
    }

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          ref={ref}
          className={cn(
            "transition-all duration-300 font-medium rounded-lg",
            buttonVariants[variant],
            buttonSizes[size],
            loading && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={loading}
          {...props}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
            />
          ) : icon ? (
            <span className="mr-2">{icon}</span>
          ) : null}
          {children}
        </Button>
      </motion.div>
    )
  }
)

ModernButton.displayName = "ModernButton"

// Example Form Component
interface TaskFormData {
  title: string
  description: string
  priority: string
  assignee: string
  dueDate: string
}

export const ModernTaskForm: React.FC = () => {
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: '',
    description: '',
    priority: '',
    assignee: '',
    dueDate: ''
  })
  const [errors, setErrors] = React.useState<Partial<TaskFormData>>({})
  const [loading, setLoading] = React.useState(false)

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ]

  const assigneeOptions = [
    { value: 'user1', label: 'John Doe' },
    { value: 'user2', label: 'Sarah Chen' },
    { value: 'user3', label: 'Mike Johnson' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    console.log('Form submitted:', formData)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6 p-6 glass-card max-w-md mx-auto"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gradient">Create New Task</h2>
        <p className="text-text-muted">Fill in the details to create a new task</p>
      </div>

      <ModernInput
        label="Task Title"
        placeholder="Enter task title..."
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        error={errors.title}
        icon={<User className="w-4 h-4" />}
        variant="glass"
      />

      <ModernTextarea
        label="Description"
        placeholder="Describe the task..."
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        error={errors.description}
        variant="glass"
      />

      <ModernSelect
        label="Priority"
        placeholder="Select priority..."
        options={priorityOptions}
        value={formData.priority}
        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
        error={errors.priority}
        variant="glass"
      />

      <ModernSelect
        label="Assignee"
        placeholder="Select assignee..."
        options={assigneeOptions}
        value={formData.assignee}
        onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
        error={errors.assignee}
        variant="glass"
      />

      <ModernInput
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
        error={errors.dueDate}
        icon={<Calendar className="w-4 h-4" />}
        variant="glass"
      />

      <div className="flex space-x-3 pt-4">
        <ModernButton
          type="submit"
          variant="gradient"
          size="lg"
          loading={loading}
          className="flex-1"
        >
          Create Task
        </ModernButton>
        <ModernButton
          type="button"
          variant="secondary"
          size="lg"
        >
          Cancel
        </ModernButton>
      </div>
    </motion.form>
  )
}
