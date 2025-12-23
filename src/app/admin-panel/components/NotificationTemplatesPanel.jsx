"use client";

import { useState } from 'react';
import { getNotificationTypes } from '@/lib/services/notificationService';

export default function NotificationTemplatesPanel() {
  const types = getNotificationTypes();
  const [selected, setSelected] = useState(Object.keys(types)[0]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  function loadTemplate() {
    const t = types[selected];
    setTitle(t?.title || '');
    setMessage('');
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Notification Templates</h3>
      <div className="flex gap-2 items-center mb-4">
        <select value={selected} onChange={e => setSelected(e.target.value)} className="px-3 py-2 border rounded-md">
          {Object.keys(types).map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={loadTemplate} className="px-3 py-2 bg-primary text-primary-foreground rounded-md">Load</button>
      </div>
      <div className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 border rounded-md" />
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message" className="w-full px-3 py-2 border rounded-md h-28" />
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save Template</button>
        </div>
      </div>
    </div>
  );
}
