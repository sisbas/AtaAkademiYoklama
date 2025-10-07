# Heroku Postgres Öğrenci İçe Aktarma Kılavuzu

Bu rehber, Heroku Postgres veritabanını provision etme, şema oluşturma ve `/mnt/data` klasöründeki Excel dosyalarını `scripts/ingest_students.js` betiği ile içe aktarma adımlarını açıklar. Betik idempotent çalışır; aynı kayıtları tekrar eklemez ve eksik veri durumlarında anomalileri raporlar.

## 1. Heroku Postgres eklentisini oluştur

```bash
heroku addons:create heroku-postgresql:hobby-basic -a HEROKU_APP_NAME --name ata-akademi-db --region eu
heroku config:get DATABASE_URL -a HEROKU_APP_NAME
```

Çıkan `DATABASE_URL` değerini projedeki `.env` dosyasına ekleyin:

```bash
echo "DATABASE_URL=postgres://..." >> .env
```

> Saat dilimi varsayılan olarak `Europe/Istanbul` olduğundan, Heroku uygulamasının `TZ` yapılandırmasını `heroku config:set TZ=Europe/Istanbul -a HEROKU_APP_NAME` komutu ile güncelleyebilirsiniz.

## 2. Veri dosyalarını hazırlayın

`/mnt/data` klasöründe içeri aktarılacak tüm `.xlsx` dosyalarının bulunduğundan emin olun. Betik klasördeki tüm alt dizinleri dolaşarak Excel dosyalarını otomatik algılar.

## 3. Betiği çalıştırın

Önce bağımlılıkları kurun:

```bash
npm install
```

Ardından içe aktarma betiğini çalıştırın:

```bash
npm run ingest
```

Betik, Postgres bağlantısı için `DATABASE_URL` env değişkenini kullanır. Çalışma sırasında:

- Şema (extension, tablolar ve indeksler) idempotent olarak oluşturulur.
- Sınıf adları Türkçe karakterler normalize edilerek kodlanır ve uygun sınıf seviyeleri çıkarılır.
- Öğrenci isimleri "ad" ve "soyad" olarak ayrıştırılır, veritabanına eklenir ve sınıf-öğrenci ilişkileri oluşturulur.
- Tekrarlanan kayıtlar `ON CONFLICT` kuralları sayesinde engellenir.
- İşlem tek transaction içinde gerçekleştirilir.
- Anomaliler (boş adlar, ayrıştırılamayan isimler, eksik sütunlar vb.) konsola JSON olarak yazdırılır.

## 4. Doğrulama sorguları

Betiğin sonunda aşağıdaki sorguların çıktıları loglanır:

```sql
select count(*) as class_count from class_groups;
select count(*) as student_count from students;
select cg.name, count(e.id) as student_in_class
from enrollments e
join class_groups cg on cg.id=e.class_group_id
group by cg.name
order by student_in_class desc
limit 5;
```

## 5. Dataclip oluşturma

Heroku Dataclip arayüzünde aşağıdaki sorguları kullanarak raporları kaydedin:

### Ata Akademi — Sınıf Bazlı Öğrenci Sayıları

```sql
select
  cg.code,
  cg.name,
  coalesce(count(e.id),0) as student_count
from class_groups cg
left join enrollments e on e.class_group_id = cg.id
group by cg.code, cg.name
order by cg.name;
```

### Tüm Öğrenci Listesi (Ad, Soyad, Sınıf) _(isteğe bağlı)_

```sql
select
  s.first_name,
  s.last_name,
  cg.name as class_name
from enrollments e
join students s on s.id=e.student_id
join class_groups cg on cg.id=e.class_group_id
order by cg.name, s.last_name, s.first_name;
```

## 6. Beklenen log çıktıları

Betiğin başarıyla tamamlanması halinde konsolda aşağıdaki bilgiler raporlanır:

- Kullanılan `DATABASE_URL`
- İşlenen Excel dosyası sayısı ve toplam öğrenci satırı
- `students`, `class_groups` ve `enrollments` tablolarındaki kayıt adetleri
- En çok öğrencisi olan ilk 5 sınıf
- Tespit edilen anomaliler (varsa)
- Dataclip sorgu metinleri

Bu çıktılar, yükleme işlemini ve doğrulama adımlarını belgelemek için saklanabilir.
