import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function StoreCustomizationPanel({ customization, onSave }) {
  const [activeTab, setActiveTab] = useState('theme');
  const [settings, setSettings] = useState(customization);

  const themes = [
    { id: 'modern', name: 'Modern', primary: '#2D5A5A', secondary: '#E67E22' },
    { id: 'classic', name: 'Classic', primary: '#1E3A8A', secondary: '#DC2626' },
    { id: 'vibrant', name: 'Vibrant', primary: '#7C3AED', secondary: '#F59E0B' },
    { id: 'minimal', name: 'Minimal', primary: '#374151', secondary: '#10B981' }
  ];

  const layouts = [
    { id: 'grid', name: 'Grid View', icon: 'Squares2X2Icon' },
    { id: 'list', name: 'List View', icon: 'ListBulletIcon' },
    { id: 'masonry', name: 'Masonry', icon: 'ViewColumnsIcon' }
  ];

  const handleThemeSelect = (themeId) => {
    setSettings(prev => ({ ...prev, theme: themeId }));
  };

  const handleLayoutSelect = (layoutId) => {
    setSettings(prev => ({ ...prev, layout: layoutId }));
  };

  const handleColorChange = (type, value) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...prev?.colors, [type]: value }
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const tabs = [
    { id: 'theme', label: 'Theme', icon: 'SwatchIcon' },
    { id: 'colors', label: 'Colors', icon: 'PaintBrushIcon' },
    { id: 'layout', label: 'Layout', icon: 'ViewColumnsIcon' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-heading font-semibold text-foreground">Store Customization</h3>
        <p className="text-sm text-muted-foreground mt-1">Customize your store appearance</p>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
              activeTab === tab?.id
                ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Icon name={tab?.icon} size={18} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      <div className="p-6">
        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Choose a pre-designed theme for your store</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {themes?.map((theme) => (
                <button
                  key={theme?.id}
                  onClick={() => handleThemeSelect(theme?.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    settings?.theme === theme?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{theme?.name}</span>
                    {settings?.theme === theme?.id && (
                      <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-primary" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: theme?.primary }}
                    />
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: theme?.secondary }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground mb-4">Customize your store colors</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings?.colors?.primary}
                    onChange={(e) => handleColorChange('primary', e?.target?.value)}
                    className="w-16 h-10 rounded-lg border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.colors?.primary}
                    onChange={(e) => handleColorChange('primary', e?.target?.value)}
                    className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings?.colors?.secondary}
                    onChange={(e) => handleColorChange('secondary', e?.target?.value)}
                    className="w-16 h-10 rounded-lg border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.colors?.secondary}
                    onChange={(e) => handleColorChange('secondary', e?.target?.value)}
                    className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings?.colors?.accent}
                    onChange={(e) => handleColorChange('accent', e?.target?.value)}
                    className="w-16 h-10 rounded-lg border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings?.colors?.accent}
                    onChange={(e) => handleColorChange('accent', e?.target?.value)}
                    className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Preview</p>
              <div className="flex gap-2">
                <div
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: settings?.colors?.primary }}
                />
                <div
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: settings?.colors?.secondary }}
                />
                <div
                  className="w-16 h-16 rounded-lg"
                  style={{ backgroundColor: settings?.colors?.accent }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">Choose how products are displayed</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {layouts?.map((layout) => (
                <button
                  key={layout?.id}
                  onClick={() => handleLayoutSelect(layout?.id)}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                    settings?.layout === layout?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon
                    name={layout?.icon}
                    size={32}
                    className={`mx-auto mb-3 ${
                      settings?.layout === layout?.id ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <p className="text-sm font-medium text-foreground text-center">{layout?.name}</p>
                  {settings?.layout === layout?.id && (
                    <Icon
                      name="CheckCircleIcon"
                      size={20}
                      variant="solid"
                      className="text-primary mx-auto mt-2"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={() => setSettings(customization)}
            className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200 font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-card"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

StoreCustomizationPanel.propTypes = {
  customization: PropTypes?.shape({
    theme: PropTypes?.string?.isRequired,
    layout: PropTypes?.string?.isRequired,
    colors: PropTypes?.shape({
      primary: PropTypes?.string?.isRequired,
      secondary: PropTypes?.string?.isRequired,
      accent: PropTypes?.string?.isRequired
    })?.isRequired
  })?.isRequired,
  onSave: PropTypes?.func?.isRequired
};