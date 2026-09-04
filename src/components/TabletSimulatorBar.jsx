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
  {
    id: 'school_gumla',
    district: 'गुमला (Gumla)',
    block: 'बिशुनपुर (Bishunpur)',
    cluster: 'बिशुनपुर (Bishunpur Central)',
    schoolName: 'राजकीय प्राथमिक विद्यालय, बिशुनपुर',
    udiseCode: '20220100803',
    defaultLang: 'sadri',
    langName: 'सादरी / नागपुरी (Sadri - नागपुरी)',
    teacherName: 'रोहित केरकेट्टा (Hindi Medium)',
    evvTeacherId: 'EVV-T73119',
  },
];

export function TabletSimulatorBar({
  isOffline,
  toggleOffline,
  selectedLang,
  onSelectLang,
  isTabletFrame,
  onToggleTabletFrame,
  deviceMode = 'ios',
  onChangeDeviceMode,
}) {
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => {
    const found = JHARKHAND_SCHOOL_PROFILES.find((s) => s.defaultLang === selectedLang);
    return found ? found.id : 'school_gumla';
  });
  const [isSyncingEVV, setIsSyncingEVV] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Automatically keep school profile aligned when language changes
  React.useEffect(() => {
    const school = JHARKHAND_SCHOOL_PROFILES.find((s) => s.defaultLang === selectedLang);
    if (school && school.id !== selectedSchoolId) {
      setSelectedSchoolId(school.id);
    }
  }, [selectedLang]);

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

  const isIOS = deviceMode === 'ios';

  return (
    <div
      style={{
        backgroundColor: '#111815',
        color: '#A2B3AC',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.76rem',
      }}
      className="tablet-status-bar"
    >
      {/* Sleek Primary Single-Line Bar (Teacher Friendly) */}
      <div
        style={{
          padding: '6px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: '#E2E8F0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏫</span>
            <span>{currentSchool.schoolName} ({currentSchool.district.split(' ')[0]})</span>
          </span>
          <span style={{ color: '#94A3B8' }}>
            शिक्षक: <strong style={{ color: '#FFFFFF' }}>{currentSchool.teacherName}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Offline Pill */}
          <span
            onClick={toggleOffline}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isOffline ? 'rgba(217, 90, 39, 0.2)' : 'rgba(14, 91, 55, 0.25)',
              color: isOffline ? '#FFA97A' : '#70C28A',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="क्लिक करके ऑफलाइन/ऑनलाइन स्थिति बदलें"
          >
            {isOffline ? <WifiOff size={11} /> : <Wifi size={11} />}
            {isOffline ? '100% ऑफ़लाइन' : 'ऑनलाइन'}
          </span>

          {/* Device Switcher Pills */}
          {onChangeDeviceMode && (
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '1px',
                borderRadius: '5px',
                gap: '2px',
              }}
            >
              <button
                onClick={() => onChangeDeviceMode('ios')}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.7rem',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: deviceMode === 'ios' ? '#0E5B37' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: deviceMode === 'ios' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                🍎 iPad
              </button>
              <button
                onClick={() => onChangeDeviceMode('android')}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.7rem',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: deviceMode === 'android' ? '#0E5B37' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: deviceMode === 'android' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                🤖 Android
              </button>
              <button
                onClick={() => onChangeDeviceMode('full')}
                style={{
                  padding: '2px 7px',
                  fontSize: '0.7rem',
                  borderRadius: '3px',
                  border: 'none',
                  backgroundColor: deviceMode === 'full' ? '#0E5B37' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: deviceMode === 'full' ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                💻 Full
              </button>
            </div>
          )}

          {/* Toggle Technical Specs & EVV Sync */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: '#CBD5E1',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="रैम, यूडाइस कोड, ई-विद्यावाहिनी और हार्डवेयर विवरण देखें"
          >
            {isExpanded ? '▲ विवरण छुपाएं' : '⚙️ तकनीकी विवरण'}
          </button>
        </div>
      </div>

      {/* Collapsible Administrative & Technical Details Drawer */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Hardware Strip */}
          <div
            style={{
              padding: '4px 16px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Cpu size={12} color="#70C28A" />
                <span>रैम: <strong style={{ color: '#FFF' }}>34 MB</strong> / 2048 MB (≤2GB Tablet)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <HardDrive size={12} color="#E5A93C" />
                <span>स्थानीय कैश: <strong style={{ color: '#FFF' }}>100% सिंक</strong> (1,240+ FLN शब्द)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#70C28A" />
                <span>{isIOS ? 'iPadOS 17.5+ / Neural Engine' : 'Android 9.0+'}</span>
              </span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFF' }}>
              <BatteryCharging size={12} color="#70C28A" /> 100% चार्ज
            </span>
          </div>

          {/* Jharkhand e-Vidyavahini Ribbon */}
          <div
            style={{
              padding: '6px 16px',
              backgroundColor: '#18221E',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#E5A93C', fontWeight: 700 }}>
                <Building size={13} />
                e-Vidyavahini 2.0:
              </span>

              <select
                value={selectedSchoolId}
                onChange={handleSchoolChange}
                style={{
                  backgroundColor: '#23302A',
                  color: '#FFFFFF',
                  border: '1px solid #3E5248',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
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

              <span style={{ color: '#A2B3AC', fontSize: '0.72rem' }}>
                शिक्षक ID: <strong style={{ color: '#FFF' }}>{currentSchool.evvTeacherId}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#70C28A', backgroundColor: '#132C1E', padding: '1px 7px', borderRadius: 'var(--radius-pill)', border: '1px solid #234E35' }}>
                JEPC SARJOM 80:20 अनुपालन ✅
              </span>

              <button
                onClick={handleSyncEVV}
                style={{
                  backgroundColor: isSyncingEVV ? '#0E5B37' : '#D95A27',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '3px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="e-Vidyavahini 2.0 राज्य सर्वर से छात्र उपस्थिति व FLN प्रगति सिंक करें"
              >
                <RefreshCw size={11} className={isSyncingEVV ? 'audio-pulse' : ''} />
                {isSyncingEVV ? 'सिंक...' : 'EVV सिंक'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
