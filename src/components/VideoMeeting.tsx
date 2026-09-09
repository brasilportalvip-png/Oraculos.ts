import React from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

export const VideoMeeting: React.FC<{ sessionId: string; displayName: string; className?: string }> = ({ sessionId, displayName, className = '' }) => {
  const roomName = `OraculosTS-${sessionId.replace(/[^A-Za-z0-9_-]/g, '')}`;
  return (
    <div className={`overflow-hidden rounded-2xl border border-purple-800/50 bg-black ${className}`}>
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{ prejoinConfig: { enabled: false }, disableDeepLinking: true, startWithAudioMuted: false, startWithVideoMuted: false }}
        interfaceConfigOverwrite={{ DISABLE_JOIN_LEAVE_NOTIFICATIONS: true, MOBILE_APP_PROMO: false }}
        userInfo={{ displayName, email: '' }}
        getIFrameRef={(iframe) => { iframe.style.height = '100%'; iframe.style.width = '100%'; }}
      />
    </div>
  );
};
