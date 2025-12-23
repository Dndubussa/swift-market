'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function ContentModerationQueue({ items }) {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Product Listings', count: items?.filter(i => i?.type === 'product')?.length },
    { id: 'vendors', label: 'Vendor Applications', count: items?.filter(i => i?.type === 'vendor')?.length },
    { id: 'disputes', label: 'Disputes', count: items?.filter(i => i?.type === 'dispute')?.length },
  ];

  const filteredItems = items?.filter(item => item?.type === activeTab?.replace('s', ''));

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-semibold text-foreground">Content Moderation Queue</h3>
          <span className="text-sm text-muted-foreground">{filteredItems?.length} pending</span>
        </div>
        <div className="flex space-x-1 px-6">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
                activeTab === tab?.id
                  ? 'bg-card text-primary border-t-2 border-x border-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab?.label} ({tab?.count})
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {filteredItems?.map((item) => (
          <div key={item?.id} className="p-6 hover:bg-muted/30 transition-colors duration-150">
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start space-x-4 flex-1">
                {item?.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <AppImage
                      src={item?.image}
                      alt={item?.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground mb-1">{item?.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{item?.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Icon name="UserIcon" size={14} />
                      <span>{item?.submittedBy}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Icon name="ClockIcon" size={14} />
                      <span>{item?.submittedAt}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button className="px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors duration-200 flex items-center space-x-1">
                  <Icon name="CheckIcon" size={16} />
                  <span>Approve</span>
                </button>
                <button className="px-4 py-2 bg-error text-error-foreground rounded-md text-sm font-medium hover:bg-error/90 transition-colors duration-200 flex items-center space-x-1">
                  <Icon name="XMarkIcon" size={16} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ContentModerationQueue.propTypes = {
  items: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      type: PropTypes?.oneOf(['product', 'vendor', 'dispute'])?.isRequired,
      title: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      submittedBy: PropTypes?.string?.isRequired,
      submittedAt: PropTypes?.string?.isRequired,
      image: PropTypes?.string,
      imageAlt: PropTypes?.string,
    })
  )?.isRequired,
};