import React, { useEffect, useRef, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

export const VideoMeeting: React.FC<{ sessionId: string; displayName: string; className?: string }> = ({ sessionId, displayName, className = '' }) => {
  const roomName = `OraculosTS-${sessionId.replace(/[^A-Za-z0-9_-]/g, '')}`;
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    readyRef.current = false; setReady(false); setFailed(false);
    const timeout = window.setTimeout(() => { if (!readyRef.current) setFailed(true); }, 20000);
    return () => window.clearTimeout(timeout);
  }, [attempt, sessionId]);
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-purple-800/50 bg-black ${className}`}>
      {!ready && !failed && <div role="status" className="absolute inset-0 z-10 grid place-items-center bg-black text-amber-200">Conectando à sala de vídeo…</div>}
      {failed && <div role="alert" className="absolute inset-0 z-20 grid place-items-center bg-black p-6 text-center text-rose-200"><div><p>Não foi possível carregar a chamada de vídeo.</p><button className="mt-4 rounded-xl bg-amber-400 px-4 py-2 font-bold text-black" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button></div></div>}
      <React.Fragment key={attempt}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{ prejoinConfig: { enabled: false }, disableDeepLinking: true, startWithAudioMuted: false, startWithVideoMuted: false }}
        interfaceConfigOverwrite={{ DISABLE_JOIN_LEAVE_NOTIFICATIONS: true, MOBILE_APP_PROMO: false }}
        userInfo={{ displayName, email: '' }}
        getIFrameRef={(iframe) => {
          iframe.style.height = '100%'; iframe.style.width = '100%';
          iframe.title = 'Sala segura de videochamada';
          iframe.addEventListener('load', () => { readyRef.current = true; setReady(true); }, { once: true });
        }}
      />
      </React.Fragment>
    </div>
  );
};
