'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getBuyerDigitalPurchases } from '@/lib/services/productService';
import { supabase, getEdgeFunctionUrl } from '@/lib/supabase';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function MyDownloadsInteractive() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/user-login');
        return;
      }
      
      loadDownloads();
    }
  }, [user, authLoading, router]);

  const loadDownloads = async () => {
    try {
      const purchases = await getBuyerDigitalPurchases(user.id);
      setDownloads(purchases);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseDownloadId) => {
    setDownloading(purchaseDownloadId);
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to download');
        router.push('/user-login');
        return;
      }

      // Call the secure download edge function
      const response = await fetch(getEdgeFunctionUrl('secure-download'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ purchaseDownloadId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate download link');
      }

      // Open download URL in new tab
      window.open(data.downloadUrl, '_blank');
      
      // Update local state
      setDownloads(prev => prev.map(d => {
        if (d.id === purchaseDownloadId) {
          return {
            ...d,
            download_count: d.download_count + 1,
            downloads_remaining: data.downloadsRemaining,
            can_download: data.downloadsRemaining > 0 && !d.is_expired
          };
        }
        return d;
      }));
      
    } catch (error) {
      console.error('Error downloading:', error);
      alert(error.message || 'Failed to download. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/buyer-dashboard"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="ArrowLeftIcon" size={20} className="text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">My Downloads</h1>
              <p className="text-muted-foreground mt-1">Access your purchased digital products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {downloads.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 rounded-full bg-muted inline-block mb-4">
              <Icon name="CloudArrowDownIcon" size={48} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Downloads Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't purchased any digital products yet.
            </p>
            <Link 
              href="/product-catalog"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Icon name="ShoppingBagIcon" size={18} />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((download) => (
              <div 
                key={download.id}
                className={`bg-card rounded-lg border shadow-card overflow-hidden ${
                  download.is_expired || !download.can_download 
                    ? 'border-border opacity-75' 
                    : 'border-border'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                        download.digital_file?.file_format === 'PDF' ? 'bg-red-100 text-red-600' :
                        download.digital_file?.file_format === 'EPUB' ? 'bg-green-100 text-green-600' :
                        download.digital_file?.file_format === 'MP3' ? 'bg-purple-100 text-purple-600' :
                        download.digital_file?.file_format === 'MP4' ? 'bg-pink-100 text-pink-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Icon 
                          name={
                            download.digital_file?.file_format === 'PDF' ? 'DocumentTextIcon' :
                            download.digital_file?.file_format === 'EPUB' || download.digital_file?.file_format === 'MOBI' ? 'BookOpenIcon' :
                            download.digital_file?.file_format === 'MP3' || download.digital_file?.file_format === 'M4A' ? 'MusicalNoteIcon' :
                            download.digital_file?.file_format === 'MP4' ? 'FilmIcon' :
                            'DocumentIcon'
                          } 
                          size={32} 
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {download.digital_file?.product?.name || download.digital_file?.file_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {download.digital_file?.file_name}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon name="DocumentIcon" size={14} />
                          {download.digital_file?.file_format} • {download.file_size_formatted}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Icon name="ArrowDownTrayIcon" size={14} />
                          {download.download_count} / {download.max_downloads} downloads
                        </span>
                        <span className={`flex items-center gap-1 ${download.is_expired ? 'text-error' : 'text-muted-foreground'}`}>
                          <Icon name="ClockIcon" size={14} />
                          {download.is_expired ? 'Expired' : `Expires ${formatDate(download.expires_at)}`}
                        </span>
                      </div>

                      {/* Order Info */}
                      <p className="text-xs text-muted-foreground mt-2">
                        Order #{download.order_item?.order?.order_number} • 
                        Purchased {formatDate(download.order_item?.order?.created_at)}
                      </p>
                    </div>

                    {/* Download Button */}
                    <div className="flex-shrink-0 flex items-center">
                      {download.is_expired ? (
                        <div className="px-4 py-2 bg-error/10 text-error rounded-lg text-sm font-medium flex items-center gap-2">
                          <Icon name="ExclamationTriangleIcon" size={16} />
                          Expired
                        </div>
                      ) : !download.can_download ? (
                        <div className="px-4 py-2 bg-warning/10 text-warning rounded-lg text-sm font-medium flex items-center gap-2">
                          <Icon name="ExclamationTriangleIcon" size={16} />
                          Limit Reached
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownload(download.id)}
                          disabled={downloading === download.id}
                          className="px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {downloading === download.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              Preparing...
                            </>
                          ) : (
                            <>
                              <Icon name="ArrowDownTrayIcon" size={16} />
                              Download
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar for downloads remaining */}
                {!download.is_expired && download.can_download && (
                  <div className="px-4 sm:px-6 pb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>{download.downloads_remaining} downloads remaining</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${(download.downloads_remaining / download.max_downloads) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Icon name="QuestionMarkCircleIcon" size={20} className="text-primary" />
            Need Help?
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Each purchase has a limited number of downloads</li>
            <li>• Download links expire after the specified period</li>
            <li>• Contact support if you need additional downloads</li>
            <li>• Files are for personal use only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

