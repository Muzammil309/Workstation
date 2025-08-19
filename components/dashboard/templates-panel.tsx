"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Plus, Search, Filter, FolderOpen, CheckSquare, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function TemplatesPanel() {
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Reusable task and project templates</p>
        </div>
        <Button onClick={() => {}} variant="neon">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-lg p-6 text-center"
        >
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Task Templates</h3>
          <p className="text-muted-foreground mb-4">Predefined task structures for common workflows</p>
          <Button variant="outline" className="w-full">Browse Templates</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border rounded-lg p-6 text-center"
        >
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Project Templates</h3>
          <p className="text-muted-foreground mb-4">Complete project setups with tasks and milestones</p>
          <Button variant="outline" className="w-full">Browse Templates</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border rounded-lg p-6 text-center"
        >
          <Users className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-semibold mb-2">Team Templates</h3>
          <p className="text-muted-foreground mb-4">Team structures and role assignments</p>
          <Button variant="outline" className="w-full">Browse Templates</Button>
        </motion.div>
      </div>
    </div>
  )
}
