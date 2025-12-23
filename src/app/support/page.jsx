'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supportService } from '../../lib/services/supportService';
import Header from '../../components/common/Header';
import CreateTicketModal from './components/CreateTicketModal';
import TicketCard from './components/TicketCard';
import FAQSection from './components/FAQSection';

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, faqData] = await Promise.all([
        supportService?.getUserTickets(user?.id),
        supportService?.getFAQCategories()
      ]);
      setTickets(ticketsData);
      setFaqCategories(faqData);
    } catch (err) {
      setError(err?.message || 'Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (ticketData) => {
    try {
      const newTicket = await supportService?.createTicket({
        ...ticketData,
        userId: user?.id
      });
      setTickets(prev => [newTicket, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get help with your orders, account, and more</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Tickets ({tickets?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq' ?'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              FAQ
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Content Based on Active Tab */}
        {activeTab === 'tickets' ? (
          <div>
            {/* Create Ticket Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create New Ticket
              </button>
            </div>

            {/* Tickets List */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : tickets?.length > 0 ? (
              <div className="space-y-4">
                {tickets?.map(ticket => (
                  <TicketCard key={ticket?.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Support Tickets</h3>
                <p className="text-gray-500 mb-4">You have not created any support tickets yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        ) : (
          <FAQSection categories={faqCategories} />
        )}

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <CreateTicketModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTicket}
          />
        )}
      </div>
    </div>
  );
}