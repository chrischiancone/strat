'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Upload, 
  Image, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  Sun,
  Moon,
  Contrast,
  Type,
  Layout,
  Paintbrush,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  Zap
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  slug: string
  state: string
  settings: {
    appearance?: {
      logo_url?: string
      favicon_url?: string
      primary_color?: string
      secondary_color?: string
      accent_color?: string
      theme_mode?: 'light' | 'dark' | 'auto'
      font_family?: string
      custom_css?: string
      show_municipality_branding?: boolean
    }
  } | null
}

interface AppearanceSettingsProps {
  municipality: Municipality
}

export function AppearanceSettings({ municipality }: AppearanceSettingsProps) {
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const logoFileRef = useRef<HTMLInputElement>(null)
  const faviconFileRef = useRef<HTMLInputElement>(null)
  
  // Current appearance settings
  const currentSettings = municipality.settings?.appearance || {}
  const [settings, setSettings] = useState({
    primary_color: currentSettings.primary_color || '#2563eb',
    secondary_color: currentSettings.secondary_color || '#64748b',
    accent_color: currentSettings.accent_color || '#059669',
    theme_mode: currentSettings.theme_mode || 'light',
    font_family: currentSettings.font_family || 'Inter',
    show_municipality_branding: currentSettings.show_municipality_branding ?? true,
    ...currentSettings
  })

  const handleSaveSettings = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // TODO: Implement save to database
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save appearance settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  const predefinedColorSchemes = [
    {
      name: 'Professional Blue',
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#059669'
    },
    {
      name: 'Government Green',
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#dc2626'
    },
    {
      name: 'Civic Purple',
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#f59e0b'
    },
    {
      name: 'Municipal Teal',
      primary: '#0891b2',
      secondary: '#64748b',
      accent: '#ea580c'
    }
  ]

  const fontFamilies = [
    { value: 'Inter', label: 'Inter (Recommended)' },
    { value: 'system-ui', label: 'System Default' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-600" />
          Appearance Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize branding, themes, and user interface appearance to match your municipality's identity.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="h-4 w-4" />
              <span className="text-sm">Appearance settings updated successfully!</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-blue-600" />
                    Brand Assets
                  </CardTitle>
                  <CardDescription>
                    Upload and manage your municipality's logo and favicon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <Label>Organization Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        {settings.logo_url ? (
                          <img 
                            src={settings.logo_url} 
                            alt="Logo" 
                            className="h-16 w-16 object-contain"
                          />
                        ) : (
                          <Image className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          onClick={() => logoFileRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload Logo
                        </Button>
                        <p className="text-xs text-gray-500">
                          Recommended: PNG or SVG, max 2MB, 200x200px
                        </p>
                        <input 
                          type="file" 
                          ref={logoFileRef} 
                          className="hidden" 
                          accept="image/png,image/svg+xml,image/jpeg"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Favicon Upload */}
                  <div>
                    <Label>Favicon</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-dashed border-gray-300 bg-gray-50">
                        {settings.favicon_url ? (
                          <img 
                            src={settings.favicon_url} 
                            alt="Favicon" 
                            className="h-8 w-8 object-contain"
                          />
                        ) : (
                          <Image className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => faviconFileRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-3 w-3" />
                          Upload Favicon
                        </Button>
                        <p className="text-xs text-gray-500">
                          Recommended: 32x32px PNG or ICO
                        </p>
                        <input 
                          type="file" 
                          ref={faviconFileRef} 
                          className="hidden" 
                          accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Branding Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Municipality Branding</Label>
                        <p className="text-sm text-gray-500">
                          Display municipality name and logo in the interface
                        </p>
                      </div>
                      <Switch 
                        checked={settings.show_municipality_branding} 
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, show_municipality_branding: checked }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5 text-purple-600" />
                    Color Scheme
                  </CardTitle>
                  <CardDescription>
                    Define your organization's color palette and theme preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Predefined Color Schemes */}
                  <div>
                    <Label className="text-base font-medium">Quick Color Schemes</Label>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {predefinedColorSchemes.map((scheme) => (
                        <button
                          key={scheme.name}
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            primary_color: scheme.primary,
                            secondary_color: scheme.secondary,
                            accent_color: scheme.accent
                          }))}
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex gap-1">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.primary }}></div>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.accent }}></div>
                          </div>
                          <span className="text-sm font-medium">{scheme.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Custom Colors */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Custom Colors</Label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={settings.primary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={settings.primary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                            placeholder="#2563eb"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={settings.secondary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={settings.secondary_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                            placeholder="#64748b"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={settings.accent_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                            className="w-16 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={settings.accent_color}
                            onChange={(e) => setSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                            placeholder="#059669"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Theme Mode */}
                  <div>
                    <Label className="text-base font-medium">Theme Mode</Label>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Contrast }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setSettings(prev => ({ ...prev, theme_mode: value as any }))}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                            settings.theme_mode === value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-green-600" />
                    Typography
                  </CardTitle>
                  <CardDescription>
                    Choose fonts and text styling for optimal readability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Primary Font Family</Label>
                    <Select 
                      value={settings.font_family} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, font_family: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg border bg-gray-50">
                    <Label className="text-sm font-medium mb-2 block">Font Preview</Label>
                    <div style={{ fontFamily: settings.font_family }} className="space-y-2">
                      <h1 className="text-2xl font-bold">Strategic Planning System</h1>
                      <h2 className="text-lg font-semibold text-gray-700">Section Heading</h2>
                      <p className="text-base text-gray-600">This is how body text will appear throughout the application interface.</p>
                      <p className="text-sm text-gray-500">Small text and captions will use this styling.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600" />
                    Advanced Customization
                  </CardTitle>
                  <CardDescription>
                    Custom CSS and advanced styling options.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Custom CSS</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Add custom CSS rules to further customize the interface. Use with caution.
                    </p>
                    <textarea
                      className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm"
                      placeholder="/* Custom CSS rules */
.custom-header {
  background-color: #your-color;
}"
                      value={settings.custom_css || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, custom_css: e.target.value }))}
                    />
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Warning:</strong> Custom CSS can override system styles and may affect functionality. 
                        Test thoroughly before applying to production.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Live Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={activePreview === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePreview('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={activePreview === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePreview('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={activePreview === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePreview('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mock preview interface */}
              <div 
                className={`border rounded-lg overflow-hidden bg-white transition-all duration-300 ${
                  activePreview === 'desktop' ? 'h-64' : 
                  activePreview === 'tablet' ? 'h-48 mx-8' : 'h-56 mx-16'
                }`}
                style={{
                  '--primary-color': settings.primary_color,
                  '--secondary-color': settings.secondary_color,
                  '--accent-color': settings.accent_color,
                  fontFamily: settings.font_family
                } as React.CSSProperties}
              >
                {/* Mock header */}
                <div 
                  className="h-12 flex items-center px-4 border-b"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded"></div>
                    <span className="text-white font-semibold text-sm">
                      {municipality.name}
                    </span>
                  </div>
                </div>
                
                {/* Mock content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: settings.accent_color }}
                    ></div>
                    <div className="text-sm font-medium">Strategic Plans Dashboard</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: settings.primary_color }}
                    >
                      Primary
                    </div>
                    <div 
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: settings.accent_color }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Theme
          </Button>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Palette className="h-4 w-4" />
              Save Appearance Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
