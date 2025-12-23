"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReviewModerationPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('reviews').select('id, product_id, user_id, rating, title, body, is_approved').order('created_at', { ascending: false }).limit(50);
    setReviews(data || []);
    setLoading(false);
  }

  async function moderate(id, approve) {
    await supabase.from('reviews').update({ is_approved: approve, moderated_at: new Date().toISOString() }).eq('id', id);
    load();
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Review Moderation</h3>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-3 bg-muted/30 rounded-md">
              <p className="font-medium">Rating: {r.rating} • {r.title}</p>
              <p className="text-xs text-muted-foreground">{r.body}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => moderate(r.id, true)} className="px-3 py-1 bg-success text-success-foreground rounded-md">Approve</button>
                <button onClick={() => moderate(r.id, false)} className="px-3 py-1 bg-error text-error-foreground rounded-md">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
