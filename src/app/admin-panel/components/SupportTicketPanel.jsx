"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupportTicketPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('support_tickets').select('id, ticket_number, subject, status, assigned_to').order('created_at', { ascending: false }).limit(50);
    setTickets(data || []);
    setLoading(false);
  }

  async function assign(id) {
    const assignee = prompt('Assign to (admin id)');
    if (!assignee) return;
    await supabase.from('support_tickets').update({ assigned_to: assignee, status: 'assigned' }).eq('id', id);
    load();
    alert('Assigned');
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Support Tickets</h3>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="p-3 bg-muted/30 rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">{t.ticket_number} • {t.subject}</p>
                <p className="text-xs text-muted-foreground">Status: {t.status} • Assigned: {t.assigned_to || '—'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => assign(t.id)} className="px-3 py-1 bg-primary text-primary-foreground rounded-md">Assign</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
