import React, { useState } from 'react';
import {
  WifiOff,
  Wifi,
  Cpu,
  BatteryCharging,
  HardDrive,
  ShieldCheck,
  Building,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export const JHARKHAND_SCHOOL_PROFILES = [
  {
    id: 'school_west_singhbhum',
    district: 'पश्चिम सिंहभूम (West Singhbhum)',
    block: 'तांतनगर (Tantnagar)',
    cluster: 'झिंकपानी (Jhinkpani)',
    schoolName: 'राजकीय उत्क्रमित प्राथमिक विद्यालय, तांतनगर',
    udiseCode: '20240301102',
    defaultLang: 'ho',
    langName: 'हो (Ho - 𑢹𑣉𑣉)',
    teacherName: 'राजेश कुमार (Hindi Medium)',
    evvTeacherId: 'EVV-T84920',
  },
  {
    id: 'school_khunti',
    district: 'खूंटी (Khunti)',
    block: 'तोरपा (Torpa)',
    cluster: 'तोरपा ईस्ट (Torpa East)',
    schoolName: 'राजकीय प्राथमिक विद्यालय, तोरपा',
    udiseCode: '20230200401',
    defaultLang: 'mundari',
    langName: 'मुण्डारी (Mundari)',
    teacherName: 'सुनीता कुमारी (Hindi Medium)',
    evvTeacherId: 'EVV-T61245',
  },
  {
    id: 'school_dumka',
    district: 'दुमका (Dumka)',
    block: 'शिकारीपाड़ा (Shikaripara)',
    cluster: 'शिकारीपाड़ा नॉर्थ (Shikaripara N)',
    schoolName: 'राजकीय प्राथमिक विद्यालय, शिकारीपाड़ा',
    udiseCode: '20210501809',
    defaultLang: 'santhali',
    langName: 'संताली (Santhali - ᱥᱟᱱᱛᱟᱲᱤ)',
    teacherName: 'अमित कुमार वर्मा (Hindi Medium)',
    evvTeacherId: 'EVV-T92401',
  },
];

export function TabletSimulatorBar({ isOffline, toggleOffline, selectedLang, onSelectLang, isTabletFrame, onToggleTabletFrame }) {
  const [selectedSchoolId, setSelectedSchoolId] = useState(
    selectedLang === 'ho'
      ? 'school_west_singhbhum'
      : selectedLang === 'mundari'
      ? 'school_khunti'
      : 'school_dumka'
  );
  const [isSyncingEVV, setIsSyncingEVV] = useState(false);

  const currentSchool =
    JHARKHAND_SCHOOL_PROFILES.find((s) => s.id === selectedSchoolId) || JHARKHAND_SCHOOL_PROFILES[0];

  const handleSchoolChange = (e) => {
    const newSchoolId = e.target.value;
    setSelectedSchoolId(newSchoolId);
    const school = JHARKHAND_SCHOOL_PROFILES.find((s) => s.id === newSchoolId);
    if (school && onSelectLang) {
      onSelectLang(school.defaultLang);
      toast.success(`विद्यालय एवं जिला बदला गया: ${school.schoolName} (${school.district})`, {
        description: `मातृभाषा स्वचालित रूप से "${school.langName}" पर सेट की गई।`,
      });
    }
  };

  const handleSyncEVV = () => {
    setIsSyncingEVV(true);
    toast.info('e-Vidyavahini 2.0 सिंक प्रारंभ...', {
      description: `UDISE+: ${currentSchool.udiseCode} डेटा पैकेट तैयार किया जा रहा है`,
    });

    setTimeout(() => {
      setIsSyncingEVV(false);
      toast.success('e-Vidyavahini (EVV) सिंक सफल! ✅', {
        description: `14 छात्र FLN मूल्यांकन एवं 80:20 भाषा अनुपात JEPC डेटाबेस में दर्ज।`,
      });
    }, 700);
  };

  return (
    <div
      style={{
        backgroundColor: '#111815',
        color: '#A2B3AC',
        borderBottom: '1.5px solid rgba(255,255,255,0.12)',
        fontFamily: 'var(--font-body)',
      }}
      className="tablet-status-bar"
    >
      {/* 1. Hardware & Operating Metrics */}
      <div
        style={{
          padding: '4px 16px',
          fontSize: '0.78rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span
            onClick={toggleOffline}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isOffline ? '#FFA97A' : '#70C28A',
              cursor: 'pointer',
            }}
            title="क्लिक करके ऑफलाइन/ऑनलाइन मोड बदलें"
          >
            {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <strong style={{ color: '#FFFFFF' }}>
              {isOffline ? 'ऑफलाइन मोड (100% On-Device)' : 'ऑनलाइन (Connected)'}
            </strong>
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Cpu size={13} color="#70C28A" />
            <span>रैम उपयोग: <strong style={{ color: '#FFF' }}>34 MB</strong> / 2048 MB (≤2GB Low-Cost Tablet)</span>
          </span>

          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HardDrive size={13} color="#E5A93C" />
            <span>स्थानीय कैश: <strong style={{ color: '#FFF' }}>100% सिंक</strong> (1,240+ FLN शब्द)</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onToggleTabletFrame && (
            <button
              onClick={onToggleTabletFrame}
              style={{
                padding: '2px 8px',
                fontSize: '0.72rem',
                borderRadius: '4px',
                border: '1px solid #70C28A',
                backgroundColor: isTabletFrame ? '#70C28A' : 'transparent',
                color: isTabletFrame ? '#0F172A' : '#70C28A',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="टैबलेट बेज़ेल और फुल-स्क्रीन डेस्कटॉप दृश्य के बीच स्विच करें"
            >
              📱 {isTabletFrame ? 'टैबलेट व्यू' : 'फुल-स्क्रीन'}
            </button>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} color="#70C28A" />
            <span>Android 9.0+</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF' }}>
            <BatteryCharging size={13} color="#70C28A" /> 88%
          </span>
        </div>
      </div>

      {/* 2. Jharkhand e-Vidyavahini (EVV) & UDISE+ School Identification Ribbon */}
      <div
        style={{
          padding: '6px 16px',
          backgroundColor: '#18221E',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E5A93C', fontWeight: 700 }}>
            <Building size={14} />
            e-Vidyavahini (EVV 2.0):
          </span>

          {/* School Selector */}
          <select
            value={selectedSchoolId}
            onChange={handleSchoolChange}
            style={{
              backgroundColor: '#23302A',
              color: '#FFFFFF',
              border: '1px solid #3E5248',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {JHARKHAND_SCHOOL_PROFILES.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.district} • {sch.schoolName} (UDISE: {sch.udiseCode})
              </option>
            ))}
          </select>

          <span style={{ color: '#A2B3AC', fontSize: '0.75rem' }}>
            शिक्षक: <strong style={{ color: '#FFF' }}>{currentSchool.teacherName}</strong> ({currentSchool.evvTeacherId})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#70C28A', backgroundColor: '#132C1E', padding: '2px 8px', borderRadius: 'var(--radius-pill)', border: '1px solid #234E35' }}>
            JEPC PALASH 80:20 अनुपालन ✅
          </span>

          <button
            onClick={handleSyncEVV}
            style={{
              backgroundColor: isSyncingEVV ? '#0E5B37' : '#D95A27',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'var(--transition-fast)',
            }}
            title="e-Vidyavahini 2.0 राज्य सर्वर से छात्र उपस्थिति व FLN प्रगति सिंक करें"
          >
            <RefreshCw size={12} className={isSyncingEVV ? 'audio-pulse' : ''} />
            {isSyncingEVV ? 'सिंक हो रहा है...' : 'EVV सिंक (Sync)'}
          </button>
        </div>
      </div>
    </div>
  );
}
