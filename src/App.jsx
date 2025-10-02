import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Download,
  Loader2,
  RefreshCw,
  Save,
  Users,
  X
} from 'lucide-react';
import { fetchAllStudents } from './api/students';

const STORAGE_KEY = 'ata-akademi-data';
const STATUS_OPTIONS = ['geldi', 'gelmedi', 'mazeretli', 'izinli'];
const DAY_NAMES = ['pazar', 'pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma', 'cumartesi'];

const CLASS_ORDER = {
  TYT: 0,
  '9': 1,
  '10': 2,
  '11': 3,
  '12': 4,
  MEZUN: 5,
  GENEL: 6
};

const CLASS_PRESETS = {
  'TYT::': {
    name: 'TYT Sınıfı',
    schedule: { cumartesi: 6, pazar: 4 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  '9::': { name: '9. Sınıf', schedule: { cumartesi: 4, pazar: 4 } },
  '10::': { name: '10. Sınıf', schedule: { salı: 4, perşembe: 4 } },
  '10::A': { name: '10. Sınıf A', schedule: { salı: 4, perşembe: 4 } },
  '10::B': { name: '10. Sınıf B', schedule: { salı: 4, perşembe: 4 } },
  '11::SAY1': { name: '11 Say 1' },
  '11::SAY2': { name: '11 Say 2' },
  '11::EA1': { name: '11 Ea 1' },
  '11::EA2': { name: '11 Ea 2' },
  '11::TYT': { name: '11 TYT', schedule: { cumartesi: 6, pazar: 4 } },
  '12::': {
    name: '12. Sınıf',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::EA1': {
    name: '12 Ea 1',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::EA2': {
    name: '12 Ea 2',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::EA3': {
    name: '12 Ea 3',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::SAY1': {
    name: '12 Say 1',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::SAY2': {
    name: '12 Say 2',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::SAY3': {
    name: '12 Say 3',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  '12::TYT': {
    name: '12 TYT',
    schedule: { salı: 4, perşembe: 4, cumartesi: 6, pazar: 6 }
  },
  'MEZUN::': {
    name: 'Mezun',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MEA1': {
    name: 'Mezun Ea 1',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MEA2': {
    name: 'Mezun Ea 2',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MEA3': {
    name: 'Mezun Ea 3',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MSAY1': {
    name: 'Mezun Say 1',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MSAY2': {
    name: 'Mezun Say 2',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::MSAY3': {
    name: 'Mezun Say 3',
    schedule: { pazartesi: 6, salı: 6, perşembe: 6, cuma: 6 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  },
  'MEZUN::TYT': {
    name: 'Mezun TYT',
    schedule: { cumartesi: 6, pazar: 4 },
    absenceLimits: { excused: 20, unexcused: 20, total: 40 }
  }
};

const normalizeText = (value = '') => String(value ?? '').trim();
const normalizeGrade = (value = '') => normalizeText(value).toUpperCase();

const normalizeSection = (value = '') => {
  const normalized = normalizeText(value).toUpperCase();
  if (!normalized || normalized === 'NAN') {
    return '';
  }
  return normalized;
};

const buildClassKey = (grade, section) => `${grade || 'GENEL'}::${section || ''}`;

const formatClassLabel = (grade, section) => {
  const rawGrade = grade ? grade.toString() : '';
  const rawSection = section ? section.toString() : '';
  const upperGrade = rawGrade.toUpperCase();

  if (!rawGrade) {
    return rawSection ? `Genel ${rawSection}` : 'Genel';
  }

  if (/^[0-9]+$/.test(rawGrade)) {
    return rawSection ? `${rawGrade}. Sınıf ${rawSection}` : `${rawGrade}. Sınıf`;
  }

  if (upperGrade === 'MEZUN') {
    return rawSection ? `Mezun ${rawSection}` : 'Mezun';
  }

  if (upperGrade === 'TYT') {
    return rawSection ? `TYT ${rawSection}` : 'TYT Sınıfı';
  }

  return rawSection ? `${rawGrade} ${rawSection}` : rawGrade;
};

const getDefaultAbsenceLimit = (grade = '') => {
  const upper = grade.toString().toUpperCase();
  if (['12', 'MEZUN', 'TYT'].includes(upper)) {
    return { excused: 20, unexcused: 20, total: 40 };
  }
  return { excused: 10, unexcused: 10, total: 20 };
};

const resolveClassMeta = (grade, section) => {
  const classKey = buildClassKey(grade, section);
  const fallbackKeys = [
    classKey,
    buildClassKey(grade, ''),
    buildClassKey('', section)
  ];

  const preset = fallbackKeys.reduce((acc, key) => acc || CLASS_PRESETS[key], null);

  return {
    classKey,
    grade,
    section,
    name: preset?.name || formatClassLabel(grade, section),
    schedule: preset?.schedule || {},
    absenceLimits: preset?.absenceLimits || getDefaultAbsenceLimit(grade)
  };
};

const createStudentRecord = (student, index) => {
  const grade = normalizeGrade(student.sinif || '');
  const section = normalizeSection(student.sube || '');
  const classKey = buildClassKey(grade, section);
  const identifier =
    student.id !== undefined && student.id !== null
      ? `db-${student.id}`
      : `${classKey}-${normalizeText(student.ad)}-${normalizeText(student.soyad)}-${index}`;

  return {
    ...student,
    grade,
    section,
    classKey,
    dbId: identifier,
    fullName: [normalizeText(student.ad), normalizeText(student.soyad)]
      .filter(Boolean)
      .join(' ')
      .trim()
  };
};

const describeStudentLoadError = (error) => {
  if (!error) {
    return 'Öğrenci verileri yüklenirken bir sorun oluştu.';
  }

  const details = [
    typeof error?.payload?.error === 'string' ? error.payload.error : '',
    typeof error?.message === 'string' ? error.message : '',
    typeof error?.rawBody === 'string' ? error.rawBody : ''
  ]
    .map((value) => value.toLowerCase())
    .filter(Boolean);

  const includes = (needle) => details.some((value) => value.includes(needle));

  if (includes('neon_database_url')) {
    return 'Öğrenci verileri yüklenemedi çünkü Netlify fonksiyonu NEON_DATABASE_URL ortam değişkeni ile yapılandırılmamış. Neon bağlantı bilgisini ekleyip yeniden deneyin.';
  }

  if (includes('failed to fetch') || includes('networkerror')) {
    return 'Öğrenci verileri yüklenemedi. İnternet bağlantınızı ve VITE_STUDENTS_API / Netlify yapılandırmanızı kontrol edin.';
  }

  if (typeof error?.status === 'number') {
    return `Öğrenci verileri yüklenemedi (HTTP ${error.status}). Sunucu yanıtını kontrol edin ve ardından tekrar deneyin.`;
  }

  return 'Öğrenci verileri yüklenirken bir sorun oluştu.';
};

const getStatusColor = (status) => {
  const colors = {
    geldi: 'bg-green-500 hover:bg-green-600',
    gelmedi: 'bg-red-500 hover:bg-red-600',
    mazeretli: 'bg-yellow-500 hover:bg-yellow-600',
    izinli: 'bg-blue-500 hover:bg-blue-600'
  };
  return colors[status] || 'bg-gray-300 hover:bg-gray-400';
};

const getStatusIcon = (status) => {
  const icons = {
    geldi: <Check className="w-4 h-4" />,
    gelmedi: <X className="w-4 h-4" />,
    mazeretli: <AlertCircle className="w-4 h-4" />,
    izinli: <Calendar className="w-4 h-4" />
  };
  return icons[status] || null;
};

const AttendanceSystem = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedClassKey, setSelectedClassKey] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [savedRecords, setSavedRecords] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('attendance');
  const controllerRef = useRef(null);

  const persistRecords = useCallback((records) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          records
        })
      );
    } catch (error) {
      console.warn('Yerel kayıtlar kaydedilemedi', error);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setLoadError('');

    try {
      const { rows } = await fetchAllStudents({ signal: controller.signal });
      if (!controller.signal.aborted) {
        setStudents(rows.map((student, index) => createStudentRecord(student, index)));
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Öğrenci verileri alınamadı', error);
      setLoadError(describeStudentLoadError(error));
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStudents();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [loadStudents]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const records = parsed.records || {};
      const hasNewFormat = Object.keys(records).some((key) => key.includes('::'));
      setSavedRecords(hasNewFormat ? records : {});
    } catch (error) {
      console.warn('Yerel kayıtlar okunamadı', error);
    }
  }, []);

  const classMetaList = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      const meta = resolveClassMeta(student.grade, student.section);
      if (!map.has(meta.classKey)) {
        map.set(meta.classKey, meta);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const orderA = CLASS_ORDER[a.grade] ?? 99;
      const orderB = CLASS_ORDER[b.grade] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.classKey.localeCompare(b.classKey);
    });
  }, [students]);

  const classMetaMap = useMemo(() => {
    const map = new Map();
    classMetaList.forEach((meta) => map.set(meta.classKey, meta));
    return map;
  }, [classMetaList]);

  useEffect(() => {
    if (classMetaList.length === 0) {
      setSelectedClassKey('');
      return;
    }

    if (!selectedClassKey || !classMetaMap.has(selectedClassKey)) {
      setSelectedClassKey(classMetaList[0].classKey);
    }
  }, [classMetaList, classMetaMap, selectedClassKey]);

  const selectedClassMeta = useMemo(() => {
    if (!selectedClassKey) return null;
    return classMetaMap.get(selectedClassKey) || null;
  }, [classMetaMap, selectedClassKey]);

  const classStudents = useMemo(() => {
    if (!selectedClassKey) return [];
    return students.filter((student) => student.classKey === selectedClassKey);
  }, [students, selectedClassKey]);

  useEffect(() => {
    if (!selectedClassKey || !selectedDate) {
      setAttendance({});
      setMessage({ type: '', text: '' });
      return;
    }

    const key = `${selectedClassKey}-${selectedDate}`;
    const record = savedRecords[key];
    if (record) {
      setAttendance({ ...record });
      setMessage({ type: 'info', text: 'Bu tarih için kayıtlı yoklama yüklendi.' });
    } else {
      setAttendance({});
      setMessage({ type: '', text: '' });
    }
  }, [selectedClassKey, selectedDate, savedRecords]);

  const lessonCount = useMemo(() => {
    if (!selectedClassMeta || !selectedDate) return 0;
    const date = new Date(`${selectedDate}T00:00:00`);
    const dayName = DAY_NAMES[date.getDay()];
    return selectedClassMeta.schedule[dayName] || 0;
  }, [selectedClassMeta, selectedDate]);

  const getAbsenceLimit = useCallback(
    (classKey) => {
      const meta = classMetaMap.get(classKey);
      if (meta) return meta.absenceLimits;
      const [gradePart] = (classKey || '').split('::');
      return getDefaultAbsenceLimit(gradePart || '');
    },
    [classMetaMap]
  );

  const handleAttendanceChange = useCallback((studentId, lessonNumber, status) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${lessonNumber}`]: status
    }));
  }, []);

  const saveAttendance = useCallback(() => {
    if (!selectedClassMeta) {
      setMessage({ type: 'error', text: 'Lütfen önce bir sınıf seçin.' });
      return;
    }

    if (lessonCount === 0) {
      setMessage({ type: 'error', text: 'Bu gün için ders programı bulunmuyor.' });
      return;
    }

    const key = `${selectedClassMeta.classKey}-${selectedDate}`;
    setSavedRecords((prev) => {
      const next = { ...prev, [key]: { ...attendance } };
      persistRecords(next);
      return next;
    });
    setMessage({ type: 'success', text: 'Yoklama kaydedildi!' });
  }, [attendance, lessonCount, persistRecords, selectedClassMeta, selectedDate]);

  const calculateStudentStats = useCallback(
    (studentId, classKey) => {
      let totalLessons = 0;
      let attended = 0;
      let absent = 0;
      let excused = 0;
      let onLeave = 0;

      Object.entries(savedRecords).forEach(([recordKey, record]) => {
        if (!recordKey.startsWith(`${classKey}-`)) return;
        Object.entries(record).forEach(([key, status]) => {
          if (!key.startsWith(`${studentId}-`)) return;
          totalLessons += 1;
          if (status === 'geldi') attended += 1;
          else if (status === 'gelmedi') absent += 1;
          else if (status === 'mazeretli') excused += 1;
          else if (status === 'izinli') onLeave += 1;
        });
      });

      const attendanceRate = totalLessons > 0 ? (attended / totalLessons) * 100 : 0;
      return { totalLessons, attended, absent, excused, onLeave, attendanceRate };
    },
    [savedRecords]
  );

  const calculateClassStats = useCallback(
    (classKey) => {
      const relevantStudents = students.filter((student) => student.classKey === classKey);
      if (!relevantStudents.length) return null;

      let totalAttendance = 0;
      let countedStudents = 0;

      relevantStudents.forEach((student) => {
        const stats = calculateStudentStats(student.dbId, classKey);
        if (stats.totalLessons > 0) {
          totalAttendance += stats.attendanceRate;
          countedStudents += 1;
        }
      });

      return countedStudents > 0 ? totalAttendance / countedStudents : 0;
    },
    [calculateStudentStats, students]
  );

  const getStudentStatus = useCallback(
    (studentId, classKey) => {
      const stats = calculateStudentStats(studentId, classKey);
      const limits = getAbsenceLimit(classKey);
      const totalAbsences = stats.absent + stats.excused;

      if (
        stats.absent >= limits.unexcused ||
        stats.excused >= limits.excused ||
        totalAbsences >= limits.total
      ) {
        return {
          status: 'critical',
          color: 'bg-red-100 border-red-500',
          textColor: 'text-red-800'
        };
      }

      if (
        stats.absent >= limits.unexcused * 0.8 ||
        stats.excused >= limits.excused * 0.8 ||
        totalAbsences >= limits.total * 0.8
      ) {
        return {
          status: 'warning',
          color: 'bg-yellow-100 border-yellow-500',
          textColor: 'text-yellow-800'
        };
      }

      return {
        status: 'normal',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800'
      };
    },
    [calculateStudentStats, getAbsenceLimit]
  );

  const downloadCSV = useCallback(() => {
    if (!selectedClassMeta || lessonCount === 0) return;
    const className = selectedClassMeta.name || selectedClassMeta.classKey;

    let csv = `Sınıf:,${className}\nTarih:,${selectedDate}\n\n`;
    csv +=
      'Öğrenci Adı,' +
      Array.from({ length: lessonCount }, (_, i) => `${i + 1}. Ders`).join(',') +
      '\n';

    classStudents.forEach((student) => {
      const row = [student.fullName];
      for (let i = 1; i <= lessonCount; i += 1) {
        const status = attendance[`${student.dbId}-${i}`] || '-';
        const statusText =
          status === 'geldi'
            ? 'G'
            : status === 'gelmedi'
            ? 'Y'
            : status === 'mazeretli'
            ? 'M'
            : status === 'izinli'
            ? 'İ'
            : '-';
        row.push(statusText);
      }
      csv += row.join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Yoklama_${className.replace(/\s+/g, '_')}_${selectedDate}.csv`;
    link.click();
    setMessage({ type: 'success', text: 'CSV dosyası indirildi!' });
  }, [attendance, classStudents, lessonCount, selectedClassMeta, selectedDate]);

  const handleRefresh = useCallback(() => {
    loadStudents();
  }, [loadStudents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Ata Akademi Yoklama Sistemi</h1>
          </div>

          <div className="flex gap-4 mb-6 border-b">
            {[
              { key: 'attendance', label: 'Yoklama Gir' },
              { key: 'reports', label: 'Raporlar' },
              { key: 'students', label: 'Öğrenciler' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {message.text && (
            <div
              className={`p-4 rounded-lg mb-4 flex items-center justify-between ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : message.type === 'info'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {loadError && (
            <div className="p-4 rounded-lg mb-4 bg-red-100 text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Veri Yükleme Hatası</p>
                <p className="text-sm">{loadError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sınıf Seçin</label>
              <select
                value={selectedClassKey}
                onChange={(event) => setSelectedClassKey(event.target.value)}
                disabled={loading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              >
                <option value="">Sınıf seçiniz...</option>
                {classMetaList.map((meta) => (
                  <option key={meta.classKey} value={meta.classKey}>
                    {meta.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Seçin</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Öğrenci verileri yükleniyor...</span>
            </div>
          )}

          {activeTab === 'attendance' && selectedClassMeta && classStudents.length > 0 && lessonCount > 0 && (
            <div>
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-800">
                    {classStudents.length} öğrenci • {lessonCount} ders
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    {selectedClassMeta.name} -
                    {` ${new Date(selectedDate).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCSV}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <Download className="w-4 h-4" /> CSV İndir
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left border font-semibold">Öğrenci</th>
                      {Array.from({ length: lessonCount }, (_, i) => (
                        <th key={`lesson-${i + 1}`} className="p-3 text-center border font-semibold">
                          {i + 1}. Ders
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((student) => (
                      <tr key={student.dbId} className="odd:bg-white even:bg-gray-50">
                        <td className="p-3 border font-medium text-gray-700">{student.fullName}</td>
                        {Array.from({ length: lessonCount }, (_, lessonIndex) => {
                          const lessonNumber = lessonIndex + 1;
                          const currentStatus = attendance[`${student.dbId}-${lessonNumber}`];
                          return (
                            <td key={`${student.dbId}-${lessonNumber}`} className="p-2 border">
                              <div className="flex items-center justify-center gap-2">
                                {STATUS_OPTIONS.map((status) => (
                                  <button
                                    key={`${student.dbId}-${lessonNumber}-${status}`}
                                    type="button"
                                    onClick={() => handleAttendanceChange(student.dbId, lessonNumber, status)}
                                    title={
                                      status === 'geldi'
                                        ? 'Geldi'
                                        : status === 'gelmedi'
                                        ? 'Gelmedi'
                                        : status === 'mazeretli'
                                        ? 'Mazeretli'
                                        : 'İzinli'
                                    }
                                    className={`p-2 rounded transition-all ${
                                      currentStatus === status
                                        ? `${getStatusColor(status)} text-white shadow-md`
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                    }`}
                                  >
                                    {getStatusIcon(status)}
                                  </button>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={saveAttendance}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" /> Yoklamayı Kaydet
              </button>
            </div>
          )}

          {activeTab === 'attendance' && selectedClassMeta && lessonCount === 0 && (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Ders Programı Bulunamadı</p>
                <p className="text-sm">
                  Seçilen sınıfın bu gün ({
                    new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long' })
                  }) için ders programı bulunmuyor.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && selectedClassMeta && classStudents.length === 0 && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 flex items-start gap-3">
              <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Öğrenci Bulunamadı</p>
                <p className="text-sm">Bu sınıf için kayıtlı öğrenci bulunamadı. Lütfen veritabanını kontrol edin.</p>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-2">Devamsızlık Hakları</p>
                    <ul className="space-y-1">
                      <li>
                        <strong>9-10-11. Sınıflar:</strong> 10 Mazeretli + 10 Mazeretsiz = 20 Toplam
                      </li>
                      <li>
                        <strong>12-Mezun-TYT:</strong> 20 Mazeretli + 20 Mazeretsiz = 40 Toplam
                      </li>
                      <li>
                        <strong>Sıfırlama Tarihi:</strong> 16 Ocak 2026
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" />
                Sınıf Devamlılık İstatistikleri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {classMetaList.map((meta) => {
                  const stats = calculateClassStats(meta.classKey);
                  if (stats === null) return null;
                  return (
                    <div key={meta.classKey} className="bg-white border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-700 mb-2">{meta.name}</h3>
                      <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.toFixed(1)}%</div>
                      <div className="mt-2 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(stats, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedClassMeta && classStudents.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6" />
                    Öğrenci Devamsızlık Raporu - {selectedClassMeta.name}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left border font-semibold">Öğrenci</th>
                          <th className="p-3 text-center border font-semibold">Toplam Ders</th>
                          <th className="p-3 text-center border font-semibold">Geldi</th>
                          <th className="p-3 text-center border font-semibold">Gelmedi</th>
                          <th className="p-3 text-center border font-semibold">Mazeretli</th>
                          <th className="p-3 text-center border font-semibold">İzinli</th>
                          <th className="p-3 text-center border font-semibold">Devam %</th>
                          <th className="p-3 text-center border font-semibold">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student) => {
                          const stats = calculateStudentStats(student.dbId, selectedClassMeta.classKey);
                          const statusInfo = getStudentStatus(student.dbId, selectedClassMeta.classKey);
                          const limits = getAbsenceLimit(selectedClassMeta.classKey);
                          return (
                            <tr
                              key={student.dbId}
                              className={`border-l-4 ${statusInfo.color} hover:bg-gray-50 transition-colors`}
                            >
                              <td className="p-3 border font-medium">{student.fullName}</td>
                              <td className="p-3 text-center border">{stats.totalLessons}</td>
                              <td className="p-3 text-center border text-green-600 font-semibold">{stats.attended}</td>
                              <td className="p-3 text-center border text-red-600 font-semibold">
                                {stats.absent}/{limits.unexcused}
                              </td>
                              <td className="p-3 text-center border text-yellow-600 font-semibold">
                                {stats.excused}/{limits.excused}
                              </td>
                              <td className="p-3 text-center border text-blue-600 font-semibold">{stats.onLeave}</td>
                              <td className="p-3 text-center border font-bold text-lg">
                                {stats.attendanceRate.toFixed(1)}%
                              </td>
                              <td className={`p-3 text-center border ${statusInfo.textColor} text-xl`}>
                                {statusInfo.status === 'critical'
                                  ? '🔴'
                                  : statusInfo.status === 'warning'
                                  ? '⚠️'
                                  : '✅'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedClassMeta && classStudents.length === 0 && (
                <div className="p-6 bg-white border rounded-lg text-gray-600">
                  Bu sınıf için öğrenci bulunamadı.
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 p-4 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-lg font-semibold text-indigo-900">
                    📊 Toplam kayıtlı öğrenci: {students.length}
                  </p>
                  {selectedClassMeta && (
                    <p className="text-sm text-indigo-700 mt-1">
                      {selectedClassMeta.name}: {classStudents.length} öğrenci
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Verileri Yenile
                </button>
              </div>

              {selectedClassMeta && classStudents.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-lg mb-4 text-gray-800">
                    {selectedClassMeta.name} Öğrencileri ({classStudents.length}):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {classStudents.map((student, index) => (
                      <div
                        key={student.dbId}
                        className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {index + 1}. {student.fullName}
                          </span>
                          <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            {student.section || 'GENEL'}
                          </span>
                        </div>
                        {Array.isArray(student.iletisim) && student.iletisim.length > 0 ? (
                          <div className="mt-3 space-y-2 text-sm">
                            {student.iletisim.map((contact, contactIndex) => (
                              <div key={`${student.dbId}-contact-${contactIndex}`} className="flex items-start gap-2">
                                <span className="uppercase tracking-wide text-gray-500 font-medium min-w-[100px]">
                                  {normalizeText(contact.alan)}:
                                </span>
                                <span className="text-gray-700">{normalizeText(contact.deger) || '-'}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-gray-400 italic">İletişim bilgisi bulunmuyor.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white border rounded-lg text-gray-600 flex items-start gap-3">
                  <Users className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Öğrenci Bulunamadı</p>
                    <p className="text-sm">Seçilen sınıf için öğrenci bulunmuyor veya veriler henüz yüklenmedi.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSystem;
