'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DigitalProductDownload({ product }) {
  const [downloadAttempts, setDownloadAttempts] = useState(product?.downloadAttempts);

  const handleDownload = () => {
    if (downloadAttempts < product?.maxDownloads) {
      setDownloadAttempts(downloadAttempts + 1);
      window.open(product?.downloadUrl, '_blank');
    }
  };

  const isExpired = new Date(product.expiresAt) < new Date();
  const canDownload = downloadAttempts < product?.maxDownloads && !isExpired;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="DocumentArrowDownIcon" size={24} className="text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">{product?.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{product?.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">File Size:</span>
              <span className="font-medium text-foreground">{product?.fileSize}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium text-foreground">{product?.format}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Downloads:</span>
              <span className="font-medium text-foreground">
                {downloadAttempts} / {product?.maxDownloads}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Expires:</span>
              <span className={`font-medium ${isExpired ? 'text-error' : 'text-foreground'}`}>
                {new Date(product.expiresAt)?.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {isExpired ? (
            <div className="bg-error/10 border border-error/20 rounded-md px-3 py-2 flex items-center space-x-2">
              <Icon name="ExclamationTriangleIcon" size={16} className="text-error" />
              <p className="text-xs text-error font-medium">Download link has expired</p>
            </div>
          ) : downloadAttempts >= product?.maxDownloads ? (
            <div className="bg-warning/10 border border-warning/20 rounded-md px-3 py-2 flex items-center space-x-2">
              <Icon name="ExclamationTriangleIcon" size={16} className="text-warning" />
              <p className="text-xs text-warning font-medium">Maximum downloads reached</p>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              className="w-full px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Icon name="ArrowDownTrayIcon" size={18} />
              <span>Download Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

DigitalProductDownload.propTypes = {
  product: PropTypes?.shape({
    name: PropTypes?.string?.isRequired,
    description: PropTypes?.string?.isRequired,
    fileSize: PropTypes?.string?.isRequired,
    format: PropTypes?.string?.isRequired,
    downloadUrl: PropTypes?.string?.isRequired,
    downloadAttempts: PropTypes?.number?.isRequired,
    maxDownloads: PropTypes?.number?.isRequired,
    expiresAt: PropTypes?.string?.isRequired,
  })?.isRequired,
};