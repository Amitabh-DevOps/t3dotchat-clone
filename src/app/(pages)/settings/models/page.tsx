"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, Search, Zap, ExternalLink } from 'lucide-react'
import { llmModels } from '@/lib/llm-model'
import { getUser, updateModels } from '@/action/user.action'
import { toast } from 'sonner' // assuming you're using sonner for toasts

interface ModelBadge {
  icon: React.ReactNode
  label: string
  variant?: 'default' | 'secondary' | 'outline'
}

interface ModelCardProps {
  name: string
  description: string
  badges: ModelBadge[]
  enabled: boolean
  onToggle: (enabled: boolean) => void
  hasSearchUrl?: boolean
  showMore?: boolean
  modelKey: string
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  description,
  badges,
  enabled,
  onToggle,
  hasSearchUrl = false,
  showMore = false,
  modelKey
}) => {
  return (
    <Card className="border border-border/50 bg-card hover:bg-card/80 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Model Icon and Name */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Show More Link */}
            {showMore && (
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                Show more
              </button>
            )}

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant={badge.variant || 'secondary'}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-muted"
                >
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
              
              {/* Search URL Link */}
              {hasSearchUrl && (
                <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                  <ExternalLink className="w-3 h-3" />
                  Search URL
                </button>
              )}
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex-shrink-0">
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to create model ID
const createModelId = (providerId: string, modelIndex: number) => {
  return `${providerId}[${modelIndex}]`
}

// Helper function to parse model ID
const parseModelId = (modelId: string) => {
  const match = modelId.match(/^(#\d+)\[(\d+)\]$/)
  if (match) {
    return { providerId: match[1], modelIndex: parseInt(match[2]) }
  }
  return null
}

const page = () => {
  const [filters, setFilters] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Initialize state from user data and llmModels
  useEffect(() => {
    const initializeState = async () => {
      try {
        const { data: user, error } = await getUser()
        
        if (error) {
          toast.error(error)
          return
        }

        console.log("user", user)

        const initialFilters: Record<string, boolean> = {}
        
        // Get user's selected models
        const userSelectedModels = user?.models?.selected || []

        // Initialize all models with their states
        llmModels.forEach((provider, providerIndex) => {
          provider.models.forEach((model, modelIndex) => {
            const modelId = createModelId(provider.id, modelIndex)
            
            // Check if this model is selected by user
            initialFilters[model.key] = userSelectedModels.includes(modelId)
          })
        })

        console.log("initialFilters", initialFilters)

        setFilters(initialFilters)
      } catch (error) {
        console.error('Error initializing state:', error)
        toast.error('Failed to load user preferences')
      } finally {
        setLoading(false)
      }
    }

    initializeState()
  }, [])

  const handleToggle = (modelKey: string) => async (enabled: boolean) => {
    setFilters(prev => ({ ...prev, [modelKey]: enabled }))
    await updateUserModels(modelKey, enabled)
  }

  const updateUserModels = async (modelKey: string, value: boolean) => {
    if (updating) return
    
    setUpdating(true)
    try {
      // Find the model in llmModels to get its ID
      let modelId = ''
      
      llmModels.forEach((provider, providerIndex) => {
        provider.models.forEach((model, modelIndex) => {
          if (model.key === modelKey) {
            modelId = createModelId(provider.id, modelIndex)
          }
        })
      })

      if (!modelId) {
        throw new Error('Model not found')
      }

      // Get current selected models
      const currentSelected = Object.entries(filters)
        .filter(([key, selected]) => selected)
        .map(([key]) => {
          // Find model ID for this key
          let id = ''
          llmModels.forEach((provider, providerIndex) => {
            provider.models.forEach((model, modelIndex) => {
              if (model.key === key) {
                id = createModelId(provider.id, modelIndex)
              }
            })
          })
          return id
        })
        .filter(Boolean)

      // Update the selected array
      let newSelected = [...currentSelected]

      if (value && !newSelected.includes(modelId)) {
        newSelected.push(modelId)
      } else if (!value) {
        newSelected = newSelected.filter(id => id !== modelId)
      }

      const { error } = await updateModels({ selected: newSelected })
      
      if (error) {
        throw new Error(error)
      }

      toast.success('Model selection updated successfully')
    } catch (error) {
      console.error('Error updating models:', error)
      toast.error('Failed to update model selection')
      
      // Revert the UI state on error
      setFilters(prev => ({ ...prev, [modelKey]: !value }))
    } finally {
      setUpdating(false)
    }
  }

  // Map the imported llmModels data to the component format
  const models = llmModels.flatMap(provider => 
    provider.models.map(model => ({
      name: model.name,
      description: model.description,
      badges: [
        { icon: <Eye className="w-3 h-3" />, label: "Vision" },
        { icon: <FileText className="w-3 h-3" />, label: "PDFs" },
        { icon: <Search className="w-3 h-3" />, label: "Search" },
      ],
      enabled: filters[model.key] || false,
      onToggle: handleToggle(model.key),
      hasSearchUrl: true,
      showMore: true,
      modelKey: model.key,
    }))
  )

  const handleSelectRecommended = async () => {
    if (updating) return
    
    setUpdating(true)
    try {
      const recommendedFilters: Record<string, boolean> = {}
      const allModelIds: string[] = []
      
      llmModels.forEach((provider, providerIndex) => {
        provider.models.forEach((model, modelIndex) => {
          recommendedFilters[model.key] = true
          allModelIds.push(createModelId(provider.id, modelIndex))
        })
      })
      
      setFilters(recommendedFilters)
      
      const { error } = await updateModels({ selected: allModelIds })
      if (error) {
        throw new Error(error)
      }
      
      toast.success('All recommended models selected')
    } catch (error) {
      console.error('Error selecting recommended models:', error)
      toast.error('Failed to select recommended models')
    } finally {
      setUpdating(false)
    }
  }

  const handleUnselectAll = async () => {
    if (updating) return
    
    setUpdating(true)
    try {
      const emptyFilters: Record<string, boolean> = {}
      llmModels.forEach(provider => {
        provider.models.forEach(model => {
          emptyFilters[model.key] = false
        })
      })
      
      setFilters(emptyFilters)
      
      const { error } = await updateModels({ selected: [] })
      if (error) {
        throw new Error(error)
      }
      
      toast.success('All models unselected')
    } catch (error) {
      console.error('Error unselecting models:', error)
      toast.error('Failed to unselect models')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Available Models</h1>
        <p className="text-muted-foreground">
          Choose which models appear in your model selector. This won't affect existing conversations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <Button variant="outline" size="sm" className="text-sm">
          Filter by features
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm"
            onClick={handleSelectRecommended}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Select Recommended Models'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={handleUnselectAll}
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Unselect All'}
          </Button>
        </div>
      </div>

      {/* Models List */}
      <div className="space-y-4 h-96 overflow-y-auto">
        {models.map((model, index) => (
          <ModelCard key={model.modelKey} {...model} />
        ))}
      </div>
    </div>
  )
}

export default page