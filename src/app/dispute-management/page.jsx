'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { disputeService } from '@/lib/services/disputeService';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function DisputeManagement() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [messageText, setMessageText] = useState('');
  const [vendorResponse, setVendorResponse] = useState('');
  const [adminDecision, setAdminDecision] = useState({
    resolutionType: 'refund',
    compensationAmount: 0,
    refundMethod: 'original',
    adminNotes: ''
  });

  const userRole = user?.role || 'buyer';

  useEffect(() => {
    if (user?.id) {
      loadDisputes();
    }
  }, [user?.id, filterStatus]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const { data, error } = await disputeService?.getAllDisputes(user?.id, userRole);
      if (error) throw error;
      
      const filtered = filterStatus === 'all' 
        ? data 
        : data?.filter(d => d?.status === filterStatus);
      
      setDisputes(filtered || []);
    } catch (err) {
      setError(err?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDispute = async (dispute) => {
    try {
      const { data, error } = await disputeService?.getDisputeById(dispute?.id);
      if (error) throw error;
      setSelectedDispute(data);
      await disputeService?.markMessagesRead(dispute?.id, user?.id);
    } catch (err) {
      setError(err?.message || 'Failed to load dispute details');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText?.trim()) return;
    
    try {
      await disputeService?.addMessage({
        disputeId: selectedDispute?.id,
        senderId: user?.id,
        senderType: userRole,
        message: messageText
      });
      setMessageText('');
      handleSelectDispute(selectedDispute);
    } catch (err) {
      setError(err?.message || 'Failed to send message');
    }
  };

  const handleVendorResponse = async () => {
    if (!vendorResponse?.trim()) return;
    
    try {
      await disputeService?.vendorRespond(selectedDispute?.id, vendorResponse);
      setVendorResponse('');
      await loadDisputes();
      handleSelectDispute(selectedDispute);
    } catch (err) {
      setError(err?.message || 'Failed to submit response');
    }
  };

  const handleAdminResolve = async () => {
    try {
      await disputeService?.adminResolve(selectedDispute?.id, adminDecision);
      await loadDisputes();
      setSelectedDispute(null);
      setAdminDecision({
        resolutionType: 'refund',
        compensationAmount: 0,
        refundMethod: 'original',
        adminNotes: ''
      });
    } catch (err) {
      setError(err?.message || 'Failed to resolve dispute');
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      reported: 'bg-red-100 text-red-800',
      vendor_responded: 'bg-blue-100 text-blue-800',
      admin_reviewing: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors?.[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dispute Management</h1>
          <p className="text-muted-foreground">
            {userRole === 'admin' ? 'Review and resolve customer disputes' : 
             userRole === 'vendor'? 'Respond to customer complaints' : 'Track and manage your order issues'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Disputes List */}
          <div className="lg:col-span-1 bg-card rounded-lg border border-border p-4">
            <div className="mb-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e?.target?.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Disputes</option>
                <option value="reported">Reported</option>
                <option value="vendor_responded">Vendor Responded</option>
                <option value="admin_reviewing">Admin Reviewing</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {disputes?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="InboxIcon" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No disputes found</p>
                </div>
              ) : (
                disputes?.map((dispute) => (
                  <button
                    key={dispute?.id}
                    onClick={() => handleSelectDispute(dispute)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedDispute?.id === dispute?.id
                        ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-foreground">
                        {dispute?.dispute_number}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(dispute?.status)}`}>
                        {dispute?.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Order: {dispute?.order?.order_number}
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {dispute?.description}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Dispute Details */}
          <div className="lg:col-span-2">
            {!selectedDispute ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Icon name="ChatBubbleLeftRightIcon" size={64} className="mx-auto mb-4 text-muted opacity-50" />
                <p className="text-muted-foreground">Select a dispute to view details</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border">
                {/* Dispute Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedDispute?.dispute_number}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeColor(selectedDispute?.status)}`}>
                      {selectedDispute?.status?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Order:</span>
                      <span className="ml-2 font-semibold">{selectedDispute?.order?.order_number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-semibold">
                        TZS {selectedDispute?.order?.total_amount?.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Issue Type:</span>
                      <span className="ml-2 font-semibold capitalize">
                        {selectedDispute?.issue_type?.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <span className="ml-2">
                        {new Date(selectedDispute?.reported_at)?.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Issue Reported</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedDispute?.reported_at)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedDispute?.vendor_responded_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Vendor Responded</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedDispute?.vendor_responded_at)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedDispute?.admin_reviewed_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Admin Reviewed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedDispute?.admin_reviewed_at)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {selectedDispute?.resolved_at && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">Resolved</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(selectedDispute?.resolved_at)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buyer Complaint */}
                <div className="p-6 border-b border-border">
                  <h3 className="font-semibold text-foreground mb-3">Buyer Complaint</h3>
                  <p className="text-sm text-foreground mb-4">{selectedDispute?.description}</p>
                  {selectedDispute?.buyer_evidence?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDispute?.buyer_evidence?.map((evidence, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                          <AppImage
                            src={evidence?.url || '/images/no_image.png'}
                            alt={evidence?.description || 'Evidence'}
                            width={200}
                            height={150}
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vendor Response Section */}
                {userRole === 'vendor' && selectedDispute?.status === 'reported' && (
                  <div className="p-6 border-b border-border bg-blue-50">
                    <h3 className="font-semibold text-foreground mb-3">Your Response</h3>
                    <textarea
                      value={vendorResponse}
                      onChange={(e) => setVendorResponse(e?.target?.value)}
                      placeholder="Explain your side and propose a solution..."
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring mb-3"
                      rows={4}
                    />
                    <button
                      onClick={handleVendorResponse}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Submit Response
                    </button>
                  </div>
                )}

                {/* Display Vendor Response */}
                {selectedDispute?.vendor_response && (
                  <div className="p-6 border-b border-border bg-blue-50">
                    <h3 className="font-semibold text-foreground mb-3">Vendor Response</h3>
                    <p className="text-sm text-foreground mb-4">{selectedDispute?.vendor_response}</p>
                    {selectedDispute?.vendor_evidence?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {selectedDispute?.vendor_evidence?.map((evidence, idx) => (
                          <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                            <AppImage
                              src={evidence?.url || '/images/no_image.png'}
                              alt={evidence?.description || 'Evidence'}
                              width={200}
                              height={150}
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Decision Section */}
                {userRole === 'admin' && selectedDispute?.status !== 'resolved' && (
                  <div className="p-6 border-b border-border bg-yellow-50">
                    <h3 className="font-semibold text-foreground mb-4">Admin Decision</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Resolution Type
                        </label>
                        <select
                          value={adminDecision?.resolutionType}
                          onChange={(e) => setAdminDecision({...adminDecision, resolutionType: e?.target?.value})}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        >
                          <option value="refund">Full Refund</option>
                          <option value="replacement">Replacement</option>
                          <option value="partial_compensation">Partial Compensation</option>
                          <option value="no_action">No Action</option>
                        </select>
                      </div>

                      {adminDecision?.resolutionType === 'partial_compensation' && (
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Compensation Amount (TZS)
                          </label>
                          <input
                            type="number"
                            value={adminDecision?.compensationAmount}
                            onChange={(e) => setAdminDecision({...adminDecision, compensationAmount: parseFloat(e?.target?.value)})}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Admin Notes
                        </label>
                        <textarea
                          value={adminDecision?.adminNotes}
                          onChange={(e) => setAdminDecision({...adminDecision, adminNotes: e?.target?.value})}
                          placeholder="Explain the decision and reasoning..."
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                          rows={3}
                        />
                      </div>

                      <button
                        onClick={handleAdminResolve}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold"
                      >
                        Resolve Dispute
                      </button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Communication</h3>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {selectedDispute?.messages?.map((msg) => (
                      <div key={msg?.id} className={`flex ${msg?.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${
                          msg?.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-xs font-semibold mb-1">{msg?.sender?.full_name}</p>
                          <p className="text-sm">{msg?.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg?.created_at)?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDispute?.status !== 'resolved' && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e?.target?.value)}
                        onKeyPress={(e) => e?.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        <Icon name="PaperAirplaneIcon" size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}