"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FuturisticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'glow'
  hover?: boolean
  children: React.ReactNode
}

const FuturisticCard = React.forwardRef<HTMLDivElement, FuturisticCardProps>(
  ({ className, variant = 'default', hover = true, children, onClick, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300"

    const variantClasses = {
      default: "bg-card border border-border rounded-xl shadow-lg",
      glass: "glass-effect rounded-xl",
      gradient: "gradient-primary rounded-xl text-white",
      glow: "bg-card border border-border rounded-xl shadow-lg glow-effect"
    }

    const hoverClasses = hover ? "hover-lift cursor-pointer" : ""

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverClasses,
          className
        )}
        onClick={onClick}
      >
        {/* Animated background gradient for glass effect */}
        {variant === 'glass' && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Subtle border glow animation */}
        {variant === 'glow' && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent-purple/20 to-accent-cyan/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}
      </motion.div>
    )
  }
)

FuturisticCard.displayName = "FuturisticCard"

interface FuturisticCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FuturisticCardHeader = React.forwardRef<HTMLDivElement, FuturisticCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
)

FuturisticCardHeader.displayName = "FuturisticCardHeader"

interface FuturisticCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  gradient?: boolean
}

const FuturisticCardTitle = React.forwardRef<HTMLParagraphElement, FuturisticCardTitleProps>(
  ({ className, children, gradient = false, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        gradient && "gradient-text",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)

FuturisticCardTitle.displayName = "FuturisticCardTitle"

interface FuturisticCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode
}

const FuturisticCardDescription = React.forwardRef<HTMLParagraphElement, FuturisticCardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
)

FuturisticCardDescription.displayName = "FuturisticCardDescription"

interface FuturisticCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FuturisticCardContent = React.forwardRef<HTMLDivElement, FuturisticCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  )
)

FuturisticCardContent.displayName = "FuturisticCardContent"

interface FuturisticCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FuturisticCardFooter = React.forwardRef<HTMLDivElement, FuturisticCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  )
)

FuturisticCardFooter.displayName = "FuturisticCardFooter"

// Animated Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  className 
}) => {
  return (
    <FuturisticCard variant="glass" className={cn("group", className)}>
      <FuturisticCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <motion.p 
              className="text-3xl font-bold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {value}
            </motion.p>
            {change && (
              <motion.div 
                className={cn(
                  "flex items-center text-xs",
                  change.type === 'increase' ? "text-green-500" : "text-red-500"
                )}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <span className="mr-1">
                  {change.type === 'increase' ? '↗' : '↘'}
                </span>
                {Math.abs(change.value)}%
              </motion.div>
            )}
          </div>
          {icon && (
            <motion.div 
              className="text-primary opacity-60 group-hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </FuturisticCardContent>
    </FuturisticCard>
  )
}

export {
  FuturisticCard,
  FuturisticCardHeader,
  FuturisticCardTitle,
  FuturisticCardDescription,
  FuturisticCardContent,
  FuturisticCardFooter,
  StatsCard
}
