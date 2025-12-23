import { useState } from 'react';
import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function StoreProfileSection({ storeData, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    storeName: storeData?.storeName,
    description: storeData?.description,
    email: storeData?.email,
    phone: storeData?.phone,
    address: storeData?.address
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e?.target?.name]: e?.target?.value
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      storeName: storeData?.storeName,
      description: storeData?.description,
      email: storeData?.email,
      phone: storeData?.phone,
      address: storeData?.address
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      {/* Banner Section */}
      <div className="relative h-48 bg-gradient-to-r from-primary to-secondary overflow-hidden">
        <AppImage
          src={storeData?.bannerImage}
          alt={`${storeData?.storeName} store banner showing business branding`}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-4 right-4 p-2 bg-card/90 backdrop-blur-sm rounded-lg hover:bg-card transition-colors duration-200 shadow-card">
          <Icon name="CameraIcon" size={20} className="text-foreground" />
        </button>
      </div>
      {/* Logo and Basic Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-card rounded-lg border-4 border-card shadow-card overflow-hidden">
              <AppImage
                src={storeData?.logoImage}
                alt={`${storeData?.storeName} business logo`}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-card">
              <Icon name="CameraIcon" size={16} />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-heading font-bold text-foreground">{storeData?.storeName}</h2>
              {storeData?.isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                  <Icon name="CheckBadgeIcon" size={16} variant="solid" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-3">{storeData?.category}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="StarIcon" size={16} variant="solid" className="text-accent" />
                <span className="font-medium text-foreground">{storeData?.rating}</span>
                <span>({storeData?.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="ShoppingBagIcon" size={16} />
                <span>{storeData?.totalProducts} Products</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="ClockIcon" size={16} />
                <span>Joined {storeData?.joinedDate}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 shadow-card"
          >
            <Icon name={isEditing ? "XMarkIcon" : "PencilIcon"} size={18} />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Editable Form */}
        {isEditing ? (
          <div className="space-y-4 p-6 bg-muted/30 rounded-lg border border-border">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={formData?.storeName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                name="description"
                value={formData?.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData?.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData?.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors duration-200 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">About Store</h3>
              <p className="text-foreground leading-relaxed">{storeData?.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Icon name="EnvelopeIcon" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{storeData?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon name="PhoneIcon" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{storeData?.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon name="MapPinIcon" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">{storeData?.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Icon name="GlobeAltIcon" size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Store URL</p>
                  <p className="text-sm font-medium text-primary">{storeData?.storeUrl}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

StoreProfileSection.propTypes = {
  storeData: PropTypes?.shape({
    storeName: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    email: PropTypes?.string?.isRequired,
    phone: PropTypes?.string?.isRequired,
    address: PropTypes?.string?.isRequired,
    bannerImage: PropTypes?.string?.isRequired,
    logoImage: PropTypes?.string?.isRequired,
    isVerified: PropTypes?.bool?.isRequired,
    category: PropTypes?.string?.isRequired,
    rating: PropTypes?.number?.isRequired,
    totalReviews: PropTypes?.number?.isRequired,
    totalProducts: PropTypes?.number?.isRequired,
    joinedDate: PropTypes?.string?.isRequired,
    storeUrl: PropTypes?.string?.isRequired
  })?.isRequired,
  onUpdate: PropTypes?.func?.isRequired
};