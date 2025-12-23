import { supabase } from '../supabase';

export const supportService = {
  // Get all tickets for the current user
  async getUserTickets(userId) {
    try {
      const { data, error } = await supabase?.from('support_tickets')?.select(`
          *,
          user:user_profiles!user_id(id, full_name, email),
          order:orders(id, order_number)
        `)?.eq('user_id', userId)?.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(ticket => ({
        id: ticket?.id,
        ticketNumber: ticket?.ticket_number,
        userId: ticket?.user_id,
        orderId: ticket?.order_id,
        category: ticket?.category,
        subject: ticket?.subject,
        description: ticket?.description,
        status: ticket?.status,
        priority: ticket?.priority,
        assignedAgentId: ticket?.assigned_agent_id,
        resolvedAt: ticket?.resolved_at,
        closedAt: ticket?.closed_at,
        createdAt: ticket?.created_at,
        updatedAt: ticket?.updated_at,
        user: ticket?.user ? {
          id: ticket?.user?.id,
          fullName: ticket?.user?.full_name,
          email: ticket?.user?.email
        } : null,
        order: ticket?.order ? {
          id: ticket?.order?.id,
          orderNumber: ticket?.order?.order_number
        } : null
      })) || [];
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      throw error;
    }
  },

  // Get single ticket with messages
  async getTicketById(ticketId) {
    try {
      const { data, error } = await supabase?.from('support_tickets')?.select(`
          *,
          user:user_profiles!user_id(id, full_name, email, avatar_url),
          order:orders(id, order_number),
          messages:ticket_messages(
            *,
            sender:user_profiles(id, full_name, avatar_url)
          )
        `)?.eq('id', ticketId)?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ticketNumber: data?.ticket_number,
        userId: data?.user_id,
        orderId: data?.order_id,
        category: data?.category,
        subject: data?.subject,
        description: data?.description,
        status: data?.status,
        priority: data?.priority,
        assignedAgentId: data?.assigned_agent_id,
        resolvedAt: data?.resolved_at,
        closedAt: data?.closed_at,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at,
        user: data?.user ? {
          id: data?.user?.id,
          fullName: data?.user?.full_name,
          email: data?.user?.email,
          avatarUrl: data?.user?.avatar_url
        } : null,
        order: data?.order ? {
          id: data?.order?.id,
          orderNumber: data?.order?.order_number
        } : null,
        messages: data?.messages?.map(msg => ({
          id: msg?.id,
          ticketId: msg?.ticket_id,
          senderId: msg?.sender_id,
          senderType: msg?.sender_type,
          message: msg?.message,
          attachments: msg?.attachments,
          isInternalNote: msg?.is_internal_note,
          createdAt: msg?.created_at,
          sender: msg?.sender ? {
            id: msg?.sender?.id,
            fullName: msg?.sender?.full_name,
            avatarUrl: msg?.sender?.avatar_url
          } : null
        })) || []
      };
    } catch (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }
  },

  // Create new support ticket
  async createTicket(ticketData) {
    try {
      const { data, error } = await supabase?.from('support_tickets')?.insert({
          user_id: ticketData?.userId,
          order_id: ticketData?.orderId || null,
          category: ticketData?.category,
          subject: ticketData?.subject,
          description: ticketData?.description,
          priority: ticketData?.priority || 'medium'
        })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ticketNumber: data?.ticket_number,
        userId: data?.user_id,
        orderId: data?.order_id,
        category: data?.category,
        subject: data?.subject,
        description: data?.description,
        status: data?.status,
        priority: data?.priority,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  // Add message to ticket
  async addTicketMessage(messageData) {
    try {
      const { data, error } = await supabase?.from('ticket_messages')?.insert({
          ticket_id: messageData?.ticketId,
          sender_id: messageData?.senderId,
          sender_type: messageData?.senderType || 'user',
          message: messageData?.message,
          attachments: messageData?.attachments || []
        })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        ticketId: data?.ticket_id,
        senderId: data?.sender_id,
        senderType: data?.sender_type,
        message: data?.message,
        attachments: data?.attachments,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error adding ticket message:', error);
      throw error;
    }
  },

  // Update ticket status
  async updateTicketStatus(ticketId, status) {
    try {
      const { data, error } = await supabase?.from('support_tickets')?.update({ status })?.eq('id', ticketId)?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        status: data?.status,
        resolvedAt: data?.resolved_at,
        closedAt: data?.closed_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  },

  // Get FAQ categories with articles
  async getFAQCategories() {
    try {
      const { data, error } = await supabase?.from('faq_categories')?.select(`
          *,
          articles:faq_articles(*)
        `)?.eq('is_active', true)?.order('display_order', { ascending: true });

      if (error) throw error;

      return data?.map(category => ({
        id: category?.id,
        name: category?.name,
        description: category?.description,
        displayOrder: category?.display_order,
        isActive: category?.is_active,
        articles: category?.articles?.map(article => ({
          id: article?.id,
          categoryId: article?.category_id,
          question: article?.question,
          answer: article?.answer,
          helpfulCount: article?.helpful_count,
          notHelpfulCount: article?.not_helpful_count,
          displayOrder: article?.display_order,
          isActive: article?.is_active
        })) || []
      })) || [];
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      throw error;
    }
  },

  // Subscribe to ticket updates
  subscribeToTicketUpdates(ticketId, callback) {
    const channel = supabase?.channel(`ticket-${ticketId}`)?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          callback(payload);
        }
      )?.subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }
};