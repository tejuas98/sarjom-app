import React from 'react';
import { WifiOff, Wifi, Cpu, BatteryCharging, HardDrive, ShieldCheck } from 'lucide-react';

export function TabletSimulatorBar({ isOffline, toggleOffline }) {
  return (
    <div
      style={{
        backgroundColor: '#141D1A',
        color: '#A2B3AC',
        padding: '6px 16px',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        fontFamily: 'var(--font-body)',
      }}
      className="tablet-status-bar"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOffline ? '#FFA97A' : '#70C28A' }}>
          {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
          <strong style={{ color: '#FFFFFF' }}>{isOffline ? 'ऑफलाइन मोड (Offline Mode)' : 'ऑनलाइन (Connected)'}</strong>
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Cpu size={14} color="#70C28A" />
          <span>रैम उपयोग: <strong style={{ color: '#FFF' }}>34 MB</strong> / 2048 MB (≤2GB Low-Cost Tablet)</span>
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <HardDrive size={14} color="#E5A93C" />
          <span>स्थानीय कैश: <strong style={{ color: '#FFF' }}>100% सिंक</strong> (1,240+ FLN शब्द)</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ShieldCheck size={14} color="#70C28A" />
          <span>Android 9.0+ अनुकूलित</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF' }}>
          <BatteryCharging size={14} color="#70C28A" /> 88%
        </span>
      </div>
    </div>
  );
}
