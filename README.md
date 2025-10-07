# Ata Akademi Yoklama Sistemi

Ata Akademi öğrencilerinin yoklama kayıtlarını takip etmek için hazırlanmış web uygulaması. Bu sürüm Heroku üzerinde çalışacak şekilde yapılandırılmıştır ve PostgreSQL veritabanı kullanır.

## 🚀 Özellikler

- Express.js tabanlı HTTP sunucusu
- PostgreSQL veritabanı bağlantısı ve otomatik tablo oluşturma
- Heroku'ya hazır Procfile yapılandırması
- API uç noktaları için CORS, güvenlik (Helmet) ve sıkıştırma (compression) katmanları
- Tek sayfa uygulaması (SPA) için otomatik fallback yönlendirmesi

## 📦 Gerekli Araçlar

- [Node.js](https://nodejs.org/) 18 veya üzeri
- [npm](https://www.npmjs.com/) 9 veya üzeri
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- Yerel geliştirme için PostgreSQL (opsiyonel)

## 🔧 Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. Ortam değişkenlerini yapılandırmak için `.env` dosyasını düzenleyin (repo ile birlikte örnek dosya gelir):

   ```dotenv
   # Heroku ortamında DATABASE_URL otomatik tanımlanır
   # Yerelde kullanmak için aşağıdaki satırı açın ve kendi bilgilerinizle doldurun
   # DATABASE_URL=postgresql://localhost/ata_akademi
   PORT=3000
   NODE_ENV=development
   ```

## 🗄️ Veritabanı Kurulumu

Uygulama, `DATABASE_URL` değişkeni sağlandığında PostgreSQL'e bağlanır ve gerekli tabloları otomatik olarak oluşturur. Yerel geliştirme için:

1. PostgreSQL üzerinde bir veritabanı oluşturun:

   ```bash
   createdb ata_akademi
   ```

2. `.env` dosyasında `DATABASE_URL` değerini veritabanı bağlantı diziniz ile güncelleyin.

3. Öğrenci verilerini içeri aktarmak için `scripts/ingest_students.js` betiğini kullanabilirsiniz:

   ```bash
   npm run ingest
   ```

## 💻 Yerel Geliştirme

Sunucuyu yerelde başlatmak için:

```bash
npm start
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde çalışır. İstemci tarafı isteklerini `http://localhost:3000/api` tabanına yönlendirir.

## ☁️ Heroku Dağıtımı

1. Heroku uygulaması oluşturun:

   ```bash
   heroku create ata-akademi-yoklama
   ```

2. PostgreSQL eklentisini ekleyin:

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. Gerekli ortam değişkenlerini tanımlayın:

   ```bash
   heroku config:set NODE_ENV=production
   ```

   Heroku, `DATABASE_URL` değişkenini PostgreSQL eklentisi ile otomatik ekler.

4. Kodu deploy edin:

   ```bash
   git push heroku main
   ```

5. Öğrenci verilerini içeri aktarın (isteğe bağlı):

   ```bash
   heroku run npm run ingest
   ```

6. Logları takip etmek için:

   ```bash
   heroku logs --tail
   ```

## 📚 API Uç Noktaları

- `GET /api/health`: Servis durum kontrolü
- `GET /api/classes`: Sınıf listesini döndürür
- `GET /api/attendance?classId=...&date=YYYY-MM-DD`: Belirli bir sınıf ve tarih için yoklama verilerini döndürür
- `POST /api/attendance`: `{ studentId, date, status }` gövdesi ile yoklama kaydı oluşturur/günceller
- `DELETE /api/attendance`: `{ studentId, date }` gövdesi ile yoklama kaydını siler

## 🧪 Testler

Şu anda otomatik testler tanımlı değildir. `npm test` komutu bir hatırlatma mesajı döndürür.

## 🤝 Katkıda Bulunma

1. Depoyu fork'layın ve yeni bir branch oluşturun.
2. Değişikliklerinizi yapın ve `npm run lint` / `npm test` gibi kontrol komutları eklediğinizde çalıştırın.
3. Açıklayıcı commit mesajları ile değişikliklerinizi kaydedin.
4. Bir pull request açın.

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
