'use client';

import { useState, useEffect } from 'react';

export default function PushNotification() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      const dismissed = sessionStorage.getItem('dn_push_dismissed');
      if (!dismissed && Notification.permission === 'default') {
        setTimeout(() => setShow(true), 5000);
      }
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        new Notification('🔥 DealNamaa', {
          body: 'You\'ll now get notified about hot deals!',
          icon: '/icon.png',
        });
      }
      setShow(false);
      sessionStorage.setItem('dn_push_dismissed', '1');
    }
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('dn_push_dismissed', '1');
  };

  if (!show || permission !== 'default') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm animate-slide-up">
      <button onClick={dismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <i className="fa-solid fa-times"></i>
      </button>
      <div className="flex items-start gap-3">
        <div className="text-3xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Never miss a deal!</h3>
          <p className="text-sm text-gray-600 mb-3">Get instant notifications when new flyers drop</p>
          <div className="flex gap-2">
            <button
              onClick={requestPermission}
              className="flex-1 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Enable
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
