import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function BusinessSettingsPanel({ settings, onSave }) {
  const [activeSection, setActiveSection] = useState('shipping');
  const [formData, setFormData] = useState(settings);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: value
      }
    }));
  };

  const handleArrayAdd = (section, field, item) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: [...prev?.[section]?.[field], item]
      }
    }));
  };

  const handleArrayRemove = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: prev?.[section]?.[field]?.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const sections = [
    { id: 'shipping', label: 'Shipping', icon: 'TruckIcon' },
    { id: 'returns', label: 'Returns', icon: 'ArrowUturnLeftIcon' },
    { id: 'payment', label: 'Payment', icon: 'CreditCardIcon' },
    { id: 'tax', label: 'Tax', icon: 'CalculatorIcon' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="text-lg font-heading font-semibold text-foreground">Business Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure your store policies and preferences</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-border">
          <nav className="p-2">
            {sections?.map((section) => (
              <button
                key={section?.id}
                onClick={() => setActiveSection(section?.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === section?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={section?.icon} size={20} />
                <span>{section?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 p-6">
          {/* Shipping Settings */}
          {activeSection === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-semibold text-foreground mb-4">Shipping Zones</h4>
                <div className="space-y-3">
                  {formData?.shipping?.zones?.map((zone, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                      <Icon name="MapPinIcon" size={20} className="text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{zone?.name}</p>
                        <p className="text-xs text-muted-foreground">{zone?.rate}</p>
                      </div>
                      <button
                        onClick={() => handleArrayRemove('shipping', 'zones', index)}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors duration-200"
                      >
                        <Icon name="TrashIcon" size={16} className="text-error" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Processing Time</label>
                <select
                  value={formData?.shipping?.processingTime}
                  onChange={(e) => handleInputChange('shipping', 'processingTime', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="1-2">1-2 business days</option>
                  <option value="3-5">3-5 business days</option>
                  <option value="5-7">5-7 business days</option>
                  <option value="7-14">7-14 business days</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="freeShipping"
                  checked={formData?.shipping?.freeShippingEnabled}
                  onChange={(e) => handleInputChange('shipping', 'freeShippingEnabled', e?.target?.checked)}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="freeShipping" className="text-sm text-foreground">
                  Enable free shipping for orders above TZS 50,000
                </label>
              </div>
            </div>
          )}

          {/* Returns Settings */}
          {activeSection === 'returns' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Return Window</label>
                <select
                  value={formData?.returns?.window}
                  onChange={(e) => handleInputChange('returns', 'window', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Return Policy</label>
                <textarea
                  value={formData?.returns?.policy}
                  onChange={(e) => handleInputChange('returns', 'policy', e?.target?.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Describe your return policy..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="acceptReturns"
                    checked={formData?.returns?.acceptReturns}
                    onChange={(e) => handleInputChange('returns', 'acceptReturns', e?.target?.checked)}
                    className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="acceptReturns" className="text-sm text-foreground">
                    Accept product returns
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="restockingFee"
                    checked={formData?.returns?.restockingFee}
                    onChange={(e) => handleInputChange('returns', 'restockingFee', e?.target?.checked)}
                    className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="restockingFee" className="text-sm text-foreground">
                    Charge restocking fee (15%)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeSection === 'payment' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-semibold text-foreground mb-4">Accepted Payment Methods</h4>
                <div className="space-y-3">
                  {formData?.payment?.methods?.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Icon name="CreditCardIcon" size={20} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{method?.name}</p>
                          <p className="text-xs text-muted-foreground">{method?.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          method?.enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                          {method?.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cashOnDelivery"
                  checked={formData?.payment?.cashOnDelivery}
                  onChange={(e) => handleInputChange('payment', 'cashOnDelivery', e?.target?.checked)}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="cashOnDelivery" className="text-sm text-foreground">
                  Enable Cash on Delivery
                </label>
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeSection === 'tax' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">VAT Rate (%)</label>
                <input
                  type="number"
                  value={formData?.tax?.vatRate}
                  onChange={(e) => handleInputChange('tax', 'vatRate', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tax ID Number</label>
                <input
                  type="text"
                  value={formData?.tax?.taxId}
                  onChange={(e) => handleInputChange('tax', 'taxId', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter your tax ID"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeTax"
                  checked={formData?.tax?.includeTaxInPrice}
                  onChange={(e) => handleInputChange('tax', 'includeTaxInPrice', e?.target?.checked)}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="includeTax" className="text-sm text-foreground">
                  Include tax in product prices
                </label>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon name="InformationCircleIcon" size={20} className="text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Tanzania VAT Compliance</p>
                    <p className="text-xs text-muted-foreground">
                      Standard VAT rate in Tanzania is 18%. Ensure your tax settings comply with TCRA regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <button
              onClick={() => setFormData(settings)}
              className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200 font-medium"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium shadow-card"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

BusinessSettingsPanel.propTypes = {
  settings: PropTypes?.shape({
    shipping: PropTypes?.shape({
      zones: PropTypes?.arrayOf(
        PropTypes?.shape({
          name: PropTypes?.string?.isRequired,
          rate: PropTypes?.string?.isRequired
        })
      )?.isRequired,
      processingTime: PropTypes?.string?.isRequired,
      freeShippingEnabled: PropTypes?.bool?.isRequired
    })?.isRequired,
    returns: PropTypes?.shape({
      window: PropTypes?.string?.isRequired,
      policy: PropTypes?.string?.isRequired,
      acceptReturns: PropTypes?.bool?.isRequired,
      restockingFee: PropTypes?.bool?.isRequired
    })?.isRequired,
    payment: PropTypes?.shape({
      methods: PropTypes?.arrayOf(
        PropTypes?.shape({
          name: PropTypes?.string?.isRequired,
          type: PropTypes?.string?.isRequired,
          enabled: PropTypes?.bool?.isRequired
        })
      )?.isRequired,
      cashOnDelivery: PropTypes?.bool?.isRequired
    })?.isRequired,
    tax: PropTypes?.shape({
      vatRate: PropTypes?.string?.isRequired,
      taxId: PropTypes?.string?.isRequired,
      includeTaxInPrice: PropTypes?.bool?.isRequired
    })?.isRequired
  })?.isRequired,
  onSave: PropTypes?.func?.isRequired
};