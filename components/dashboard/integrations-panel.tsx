"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Plus, Search, Filter, Github, Slack, Trello, Zap, Mail, Building2, Database, Cloud, Shield, Code, MessageSquare, Calendar, FileText, Smartphone, Globe, X, CheckCircle, AlertCircle, Settings, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  category: string
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  apiKey?: string
  webhookUrl?: string
  lastSync?: string
  features: string[]
}

export function IntegrationsPanel() {
  const { toast } = useToast()
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect repositories and track code changes',
      icon: <Github className="w-12 h-12" />,
      color: 'text-gray-800',
      category: 'Development & Code',
      status: 'disconnected',
      features: ['Repository sync', 'Issue tracking', 'Pull request monitoring', 'Code review notifications']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in Slack',
      icon: <Slack className="w-12 h-12" />,
      color: 'text-purple-500',
      category: 'Communication & Collaboration',
      status: 'disconnected',
      features: ['Task notifications', 'Status updates', 'Team collaboration', 'Channel integration']
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Sync boards and cards with TaskFlow',
      icon: <Trello className="w-12 h-12" />,
      color: 'text-blue-500',
      category: 'Project Management',
      status: 'disconnected',
      features: ['Board synchronization', 'Card updates', 'List management', 'Member sync']
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 5000+ apps',
      icon: <Zap className="w-12 h-12" />,
      color: 'text-orange-500',
      category: 'Productivity & Automation',
      status: 'disconnected',
      features: ['Workflow automation', 'App integration', 'Trigger actions', 'Data sync']
    },
    {
      id: 'google',
      name: 'Google Workspace',
      description: 'Sync with Calendar, Drive, and Gmail',
      icon: <Mail className="w-12 h-12" />,
      color: 'text-red-500',
      category: 'Communication & Collaboration',
      status: 'disconnected',
      features: ['Calendar sync', 'Drive integration', 'Gmail notifications', 'Meet scheduling']
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      description: 'Integrate with Teams, Outlook, and SharePoint',
      icon: <Building2 className="w-12 h-12" />,
      color: 'text-blue-600',
      category: 'Communication & Collaboration',
      status: 'disconnected',
      features: ['Teams integration', 'Outlook sync', 'SharePoint access', 'OneDrive sync']
    },
    {
      id: 'database',
      name: 'Database Tools',
      description: 'Connect to various database systems',
      icon: <Database className="w-12 h-12" />,
      color: 'text-green-600',
      category: 'Data & Analytics',
      status: 'disconnected',
      features: ['Data import/export', 'Query execution', 'Schema management', 'Backup sync']
    },
    {
      id: 'cloud',
      name: 'Cloud Services',
      description: 'Integrate with AWS, Azure, and GCP',
      icon: <Cloud className="w-12 h-12" />,
      color: 'text-blue-500',
      category: 'Cloud & Infrastructure',
      status: 'disconnected',
      features: ['Resource monitoring', 'Deployment automation', 'Cost tracking', 'Security alerts']
    }
  ])
  
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [connectionData, setConnectionData] = useState({
    apiKey: '',
    webhookUrl: '',
    organization: '',
    project: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConnectionModalOpen(true)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected', apiKey: undefined, webhookUrl: undefined, lastSync: undefined }
        : integration
    ))
    toast({
      title: "Integration Disconnected",
      description: "The integration has been successfully disconnected",
    })
  }

  const handleConnectionSubmit = async () => {
    if (!selectedIntegration) return
    
    setIsConnecting(true)
    
    // Simulate API connection
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === selectedIntegration.id 
          ? { 
              ...integration, 
              status: 'connected', 
              apiKey: connectionData.apiKey,
              webhookUrl: connectionData.webhookUrl,
              lastSync: new Date().toISOString()
            }
          : integration
      ))
      
      setIsConnecting(false)
      setIsConnectionModalOpen(false)
      setConnectionData({ apiKey: '', webhookUrl: '', organization: '', project: '' })
      
      toast({
        title: "Integration Connected!",
        description: `${selectedIntegration.name} has been successfully connected to TaskFlow`,
      })
    }, 2000)
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'connecting': return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />
      default: return null
    }
  }

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'error': return 'Connection Error'
      default: return 'Disconnected'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect external tools and services to enhance your workflow</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{integrations.filter(i => i.status === 'connected').length}</span> of {integrations.length} connected
          </div>
          <Button onClick={() => {}} variant="neon">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Integration
          </Button>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="space-y-6">
        {Array.from(new Set(integrations.map(i => i.category))).map(category => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrations
                .filter(integration => integration.category === category)
                .map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-card border rounded-lg p-6 text-center transition-all duration-200 hover:shadow-lg ${
                      integration.status === 'connected' ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className={`mx-auto mb-4 ${integration.color}`}>
                      {integration.icon}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
                    <p className="text-muted-foreground mb-4">{integration.description}</p>
                    
                    {/* Status Display */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      {getStatusIcon(integration.status)}
                      <span className={`text-sm font-medium ${getStatusColor(integration.status)}`}>
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                    
                    {/* Last Sync Info */}
                    {integration.lastSync && (
                      <div className="text-xs text-muted-foreground mb-4">
                        Last synced: {new Date(integration.lastSync).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full text-green-600 hover:text-green-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Data
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="neon" 
                          className="w-full"
                          onClick={() => handleConnect(integration)}
                          disabled={integration.status === 'connecting'}
                        >
                          {integration.status === 'connecting' ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                    
                    {/* Features List */}
                    <div className="mt-4 pt-4 border-t border-muted">
                      <div className="text-xs text-muted-foreground mb-2">Features:</div>
                      <div className="space-y-1">
                        {integration.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            {feature}
                          </div>
                        ))}
                        {integration.features.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{integration.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Modal */}
      <AnimatePresence>
        {isConnectionModalOpen && selectedIntegration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsConnectionModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background border rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-3">
                  <div className={selectedIntegration.color}>
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Connect {selectedIntegration.name}</h2>
                    <p className="text-muted-foreground">Configure your integration settings</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsConnectionModalOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key / Access Token</label>
                  <Input
                    placeholder="Enter your API key or access token"
                    value={connectionData.apiKey}
                    onChange={(e) => setConnectionData(prev => ({ ...prev, apiKey: e.target.value }))}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can find this in your {selectedIntegration.name} account settings
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Webhook URL (Optional)</label>
                  <Input
                    placeholder="https://your-webhook-url.com"
                    value={connectionData.webhookUrl}
                    onChange={(e) => setConnectionData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    For real-time updates and notifications
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization / Project</label>
                  <Input
                    placeholder="Enter organization or project name"
                    value={connectionData.organization}
                    onChange={(e) => setConnectionData(prev => ({ ...prev, organization: e.target.value }))}
                  />
                </div>

                {/* Features Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Features</label>
                  <div className="bg-muted/20 rounded-lg p-3">
                    <div className="space-y-1">
                      {selectedIntegration.features.map((feature, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConnectionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="neon"
                  onClick={handleConnectionSubmit}
                  disabled={isConnecting || !connectionData.apiKey}
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Connect {selectedIntegration.name}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
