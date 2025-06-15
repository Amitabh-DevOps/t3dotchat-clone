"use client"
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, Search, Zap, ExternalLink } from 'lucide-react'

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
}

const ModelCard: React.FC<ModelCardProps> = ({
  name,
  description,
  badges,
  enabled,
  onToggle,
  hasSearchUrl = false,
  showMore = false
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

const page = () => {
  const [filters, setFilters] = React.useState({
    gemini20Flash: true,
    gemini20FlashLite: true,
  })

  const handleToggle = (modelKey: string) => (enabled: boolean) => {
    setFilters(prev => ({ ...prev, [modelKey]: enabled }))
  }

  const models = [
    {
      name: "Gemini 2.0 Flash",
      description: "Google's flagship model, known for speed and accuracy (and also web search!).",
      badges: [
        { icon: <Eye className="w-3 h-3" />, label: "Vision" },
        { icon: <FileText className="w-3 h-3" />, label: "PDFs" },
        { icon: <Search className="w-3 h-3" />, label: "Search" },
      ],
      enabled: filters.gemini20Flash,
      onToggle: handleToggle('gemini20Flash'),
      hasSearchUrl: true,
      showMore: true,
    },
    {
      name: "Gemini 2.0 Flash Lite ⚡",
      description: "Similar to 2.0 Flash, but even faster.",
      badges: [
        { icon: <Zap className="w-3 h-3" />, label: "Fast", variant: 'outline' as const },
        { icon: <Eye className="w-3 h-3" />, label: "Vision" },
        { icon: <FileText className="w-3 h-3" />, label: "PDFs" },
      ],
      enabled: filters.gemini20FlashLite,
      onToggle: handleToggle('gemini20FlashLite'),
      hasSearchUrl: true,
      showMore: true,
    }
  ]

  const handleSelectRecommended = () => {
    setFilters({
      gemini20Flash: true,
      gemini20FlashLite: true,
    })
  }

  const handleUnselectAll = () => {
    setFilters({
      gemini20Flash: false,
      gemini20FlashLite: false,
    })
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
       <div>
       <Button 
          variant="outline" 
          size="sm" 
          className="text-sm"
          onClick={handleSelectRecommended}
        >
          Select Recommended Models
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={handleUnselectAll}
        >
          Unselect All
        </Button>
       </div>
      </div>

      {/* Models List */}
      <div className="space-y-4 h-96 overflow-y-auto">
        {models.map((model, index) => (
          <ModelCard key={index} {...model} />
        ))}
      </div>
    </div>
  )
}

export default page