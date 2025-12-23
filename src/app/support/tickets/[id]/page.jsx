'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { supportService } from '../../../../lib/services/supportService';
import Header from '../../../../components/common/Header';
import TicketMessages from './components/TicketMessages';
import TicketDetails from './components/TicketDetails';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params?.id && user?.id) {
      loadTicket();
      
      // Subscribe to real-time updates
      const unsubscribe = supportService?.subscribeToTicketUpdates(
        params?.id,
        handleTicketUpdate
      );
      
      return () => unsubscribe?.();
    }
  }, [params?.id, user]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await supportService?.getTicketById(params?.id);
      setTicket(data);
    } catch (err) {
      setError(err?.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketUpdate = (payload) => {
    if (payload?.eventType === 'INSERT') {
      setTicket(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), {
          id: payload?.new?.id,
          ticketId: payload?.new?.ticket_id,
          senderId: payload?.new?.sender_id,
          senderType: payload?.new?.sender_type,
          message: payload?.new?.message,
          createdAt: payload?.new?.created_at
        }]
      }));
    }
  };

  const handleSendMessage = async (message) => {
    try {
      await supportService?.addTicketMessage({
        ticketId: ticket?.id,
        senderId: user?.id,
        senderType: 'user',
        message
      });
      // Message will be added via real-time subscription
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Ticket not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router?.push('/support')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Support
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details Sidebar */}
          <div className="lg:col-span-1">
            <TicketDetails ticket={ticket} />
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2">
            <TicketMessages
              ticket={ticket}
              onSendMessage={handleSendMessage}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}