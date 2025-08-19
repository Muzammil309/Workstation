"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface Comment {
  id: string
  text: string
  author: string
  timestamp: Date
  taskId: string
}

interface TaskCommentsProps {
  taskId: string
  comments: Comment[]
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void
  currentUser: string
}

export function TaskComments({ taskId, comments, onAddComment, currentUser }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment({
        text: newComment.trim(),
        author: currentUser,
        taskId
      })
      setNewComment('')
    }
  }

  const taskComments = comments.filter(comment => comment.taskId === taskId)

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Comments ({taskComments.length})</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {taskComments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                taskComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/50 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium">{comment.author}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(comment.timestamp, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.text}</p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
