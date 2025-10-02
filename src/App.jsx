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
  MEZUN: 5
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

const getDefaultAbsenceLimit = (grade) => {
  const upper = (grade || '').toUpperCase();
  if (upper === '12' || upper === 'MEZUN' || upper === 'TYT') {
    return { excused: 20, unexcused: 20, total: 40 };
  }
  return { excused: 10, unexcused: 10, total: 20 };
};

const resolveClassMeta = (grade, section) => {
  const key = buildClassKey(grade, section);
  const preset =
    CLASS_PRESETS[key] ||
    CLASS_PRESETS[buildClassKey(grade, '')] ||
    CLASS_PRESETS[buildClassKey('', section)] ||
    {};

  return {
    classKey: key,
    grade,
    section,
    name: preset.name || formatClassLabel(grade, section),
    schedule: preset.schedule || {},
    absenceLimits: preset.absenceLimits || getDefaultAbsenceLimit(grade)
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
    return 'Öğrenci verileri yüklenemedi çünkü NEON_DATABASE_URL tanımlı değil. Netlify ayarlarındaki ortam değişkenini güncelleyip tekrar deneyin.';
  }

  if (includes('failed to fetch') || includes('networkerror')) {
    return 'Öğrenci verileri yüklenemedi. İnternet bağlantınızı ve VITE_STUDENTS_API / Netlify yapılandırmanızı kontrol edin.';
  }

  if (typeof error?.status === 'number') {
    return `Öğrenci verileri yüklenemedi (HTTP ${error.status}). Sunucu yanıtını kontrol edip tekrar deneyin.`;
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
  const [activeTab, setActiveTab] = useState('attendance');
  const [message, setMessage] = useState(null);
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

  const classMetaMap = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      if (!map.has(student.classKey)) {
        map.set(student.classKey, resolveClassMeta(student.grade, student.section));
      }
    });
    return map;
  }, [students]);

  const classMetaList = useMemo(() => {
    const metas = Array.from(classMetaMap.values());
    metas.sort((a, b) => {
      const orderA = CLASS_ORDER[a.grade] ?? 99;
      const orderB = CLASS_ORDER[b.grade] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name, 'tr');
    });
    return metas;
  }, [classMetaMap]);

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
      setMessage(null);
      return;
    }

    const key = `${selectedClassKey}-${selectedDate}`;
    const record = savedRecords[key];
    if (record) {
      setAttendance({ ...record });
      setMessage({ type: 'info', text: 'Bu tarih için kayıtlı yoklama yüklendi.' });
    } else {
      setAttendance({});
      setMessage(null);
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
    if (!selectedClassMeta) return;
    const lessonTotal = lessonCount;
    const className = selectedClassMeta.name || selectedClassMeta.classKey;

    let csv = `Sınıf:,${className}\nTarih:,${selectedDate}\n\n`;
    csv += 'Öğrenci Adı,' +
      Array.from({ length: lessonTotal }, (_, i) => `${i + 1}. Ders`).join(',') +
      '\n';

    classStudents.forEach((student) => {
      const row = [student.fullName];
      for (let i = 1; i <= lessonTotal; i += 1) {
        row.push(attendance[`${student.dbId}-${i}`] || '-');
      }
      csv += row.join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Yoklama_${className.replace(/\s+/g, '_')}_${selectedDate}.csv`;
    link.click();
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

          {message && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {loadError && (
            <div className="p-4 rounded-lg mb-4 bg-red-100 text-red-700">{loadError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sınıf Seçin
              </label>
              <select
                value={selectedClassKey}
                onChange={(event) => setSelectedClassKey(event.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih Seçin
              </label>
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

          {activeTab === 'attendance' &&
            selectedClassMeta &&
            classStudents.length > 0 &&
            lessonCount > 0 && (
              <div>
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg flex justify-between items-center">
                  <p className="text-sm font-medium text-indigo-800">
                    {classStudents.length} öğrenci • {lessonCount} ders
                  </p>
                  <button
                    type="button"
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" /> CSV İndir
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left font-semibold text-gray-700 border">
                          Öğrenci Adı
                        </th>
                        {Array.from({ length: lessonCount }, (_, index) => (
                          <th
                            key={index}
                            className="p-3 text-center font-semibold text-gray-700 border"
                          >
                            {index + 1}. Ders
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student) => (
                        <tr key={student.dbId} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800 border">
                            {student.fullName}
                          </td>
                          {Array.from({ length: lessonCount }, (_, index) => {
                            const key = `${student.dbId}-${index + 1}`;
                            const currentStatus = attendance[key] || '';
                            return (
                              <td key={index} className="p-2 border">
                                <div className="flex gap-1 justify-center">
                                  {STATUS_OPTIONS.map((status) => (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() =>
                                        handleAttendanceChange(student.dbId, index + 1, status)
                                      }
                                      className={`p-2 rounded transition-all ${
                                        currentStatus === status
                                          ? `${getStatusColor(status)} text-white`
                                          : 'bg-gray-100 text-gray-400'
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
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              Seçilen sınıfın bu gün için ders programı bulunmuyor.
            </div>
          )}

          {activeTab === 'attendance' && selectedClassMeta && classStudents.length === 0 && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              Bu sınıf için kayıtlı öğrenci bulunamadı.
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Devamsızlık Hakları:</strong> 9-10-11: 10+10 | 12-Mezun-TYT: 20+20{' '}
                <strong>Sıfırlama:</strong> 16 Ocak 2026
              </div>

              <h2 className="text-xl font-bold mb-4">Sınıf Devamlılık İstatistikleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {classMetaList.map((meta) => {
                  const stats = calculateClassStats(meta.classKey);
                  if (stats === null) return null;
                  return (
                    <div key={meta.classKey} className="bg-white border rounded-lg p-4 shadow-sm">
                      <h3 className="font-semibold text-gray-700 mb-2">{meta.name}</h3>
                      <div className="text-2xl font-bold text-indigo-600">{stats.toFixed(1)}%</div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${Math.min(stats, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedClassMeta && classStudents.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Öğrenci Devamsızlık Raporu</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 text-left border">Öğrenci</th>
                          <th className="p-2 text-center border">Toplam</th>
                          <th className="p-2 text-center border">Geldi</th>
                          <th className="p-2 text-center border">Gelmedi</th>
                          <th className="p-2 text-center border">Mazeretli</th>
                          <th className="p-2 text-center border">Devam %</th>
                          <th className="p-2 text-center border">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student) => {
                          const stats = calculateStudentStats(student.dbId, selectedClassMeta.classKey);
                          const statusInfo = getStudentStatus(student.dbId, selectedClassMeta.classKey);
                          const limits = getAbsenceLimit(selectedClassMeta.classKey);
                          return (
                            <tr key={student.dbId} className={`border-l-4 ${statusInfo.color}`}>
                              <td className="p-2 border">{student.fullName}</td>
                              <td className="p-2 text-center border">{stats.totalLessons}</td>
                              <td className="p-2 text-center border text-green-600">{stats.attended}</td>
                              <td className="p-2 text-center border text-red-600">
                                {stats.absent}/{limits.unexcused}
                              </td>
                              <td className="p-2 text-center border text-yellow-600">
                                {stats.excused}/{limits.excused}
                              </td>
                              <td className="p-2 text-center border font-bold">
                                {stats.attendanceRate.toFixed(1)}%
                              </td>
                              <td className={`p-2 text-center border ${statusInfo.textColor}`}>
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
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Toplam kayıtlı öğrenci: {students.length}</p>
                  {selectedClassMeta && (
                    <p className="text-sm text-gray-600">
                      {selectedClassMeta.name}: {classStudents.length} öğrenci
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Verileri Yenile
                </button>
              </div>

              {selectedClassMeta && classStudents.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="font-medium mb-3">
                    {selectedClassMeta.name} Öğrencileri ({classStudents.length}):
                  </p>
                  {classStudents.map((student, index) => (
                    <div key={student.dbId} className="bg-white p-3 rounded-lg mb-2 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          {index + 1}. {student.fullName}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600">
                          {student.section || 'GENEL'}
                        </span>
                      </div>
                      {Array.isArray(student.iletisim) && student.iletisim.length > 0 ? (
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                          {student.iletisim.map((contact, contactIndex) => (
                            <div key={`${student.dbId}-contact-${contactIndex}`}>
                              <span className="uppercase tracking-wide text-gray-500">
                                {normalizeText(contact.alan)}:
                              </span>{' '}
                              <span>{normalizeText(contact.deger) || '-'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-gray-500">İletişim bilgisi bulunmuyor.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white border rounded-lg text-gray-600">
                  Seçilen sınıf için öğrenci bulunmuyor.
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
