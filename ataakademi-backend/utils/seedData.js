const dotenv = require('dotenv');

dotenv.config();

const pool = require('../config/database');
const { createClassesTable, upsertClass } = require('../models/class');
const {
  createStudentsTable,
  insertStudent,
  countStudentsInClass,
} = require('../models/student');
const { createAttendanceTable } = require('../models/attendance');

const DEFAULT_CLASSES = [
  { id: 'tyt-sinifi', name: 'TYT Sınıfı' },
  { id: '9-sinif', name: '9. Sınıf' },
  { id: '10-sinif', name: '10. Sınıf' },
  { id: '11-say-1', name: '11 Say 1' },
  { id: '11-say-2', name: '11 Say 2' },
  { id: '11-ea-1', name: '11 Ea 1' },
  { id: '11-ea-2', name: '11 Ea 2' },
  { id: '12-say-1', name: '12 Say 1' },
  { id: '12-say-2', name: '12 Say 2' },
  { id: '12-say-3', name: '12 Say 3' },
  { id: '12-ea-1', name: '12 Ea 1' },
  { id: '12-ea-2', name: '12 Ea 2' },
  { id: '12-ea-3', name: '12 Ea 3' },
  { id: 'mezun-ea-1', name: 'Mezun Ea 1' },
  { id: 'mezun-ea-2', name: 'Mezun Ea 2' },
  { id: 'mezun-ea-3', name: 'Mezun Ea 3' },
  { id: 'mezun-say-1', name: 'Mezun Say 1' },
  { id: 'mezun-say-2', name: 'Mezun Say 2' },
  { id: 'mezun-say-3', name: 'Mezun Say 3' },
];

const FIRST_NAMES = [
  'Ahmet',
  'Ayşe',
  'Mehmet',
  'Fatma',
  'Ali',
  'Zeynep',
  'Mustafa',
  'Elif',
  'Emre',
  'Merve',
  'Deniz',
  'Gamze',
  'Efe',
  'Selin',
  'Kerem',
  'Buse',
  'Yusuf',
  'Melisa',
  'Can',
  'Hülya',
  'Onur',
  'Duygu',
  'Sena',
  'Hakan',
  'Sude',
  'Berke',
  'İrem',
  'Tunç',
  'Eylül',
  'Burak',
];

const LAST_NAMES = [
  'Yılmaz',
  'Demir',
  'Şahin',
  'Çelik',
  'Kaya',
  'Yıldız',
  'Yıldırım',
  'Aydın',
  'Öztürk',
  'Arslan',
  'Doğan',
  'Çetin',
  'Polat',
  'Koç',
  'Aslan',
  'Korkmaz',
  'Eren',
  'Taş',
  'Uçar',
  'Bulut',
  'Bozkurt',
  'Avcı',
  'Sezer',
  'Özdemir',
  'Karaca',
  'Aksoy',
  'Bektaş',
  'Kurt',
  'Erdoğan',
  'Özkan',
];

const randomFrom = (array) => array[Math.floor(Math.random() * array.length)];

const generateStudents = (classId, targetCount) => {
  return Array.from({ length: targetCount }).map((_, index) => {
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    const studentNumber = `${classId}-${(index + 1).toString().padStart(3, '0')}`;

    return {
      name: `${firstName} ${lastName}`,
      classId,
      studentNumber,
    };
  });
};

const seedDefaultClasses = async () => {
  for (const classInfo of DEFAULT_CLASSES) {
    await upsertClass(classInfo);

    const currentCount = await countStudentsInClass(classInfo.id);
    if (currentCount >= 20) {
      continue;
    }

    const targetCount = 20 + Math.floor(Math.random() * 11); // 20-30 arası
    const studentsToCreate = targetCount - currentCount;
    const students = generateStudents(classInfo.id, studentsToCreate);

    for (const student of students) {
      await insertStudent(student);
    }
  }
};

const initializeDatabase = async () => {
  await createClassesTable();
  await createStudentsTable();
  await createAttendanceTable();
  await seedDefaultClasses();
};

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Veritabanı başarıyla hazırlandı ve örnek veriler eklendi.');
    })
    .catch((error) => {
      console.error('Seed işlemi sırasında hata:', error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = {
  DEFAULT_CLASSES,
  initializeDatabase,
  seedDefaultClasses,
};
