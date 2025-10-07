# Ata Akademi Backend

Bu depo Ata Akademi yoklama takip sistemi için Express ve PostgreSQL tabanlı API hizmetini içerir. Proje Heroku üzerinde çalışacak şekilde yapılandırılmıştır.

## Kurulum

```bash
cd ataakademi-backend
npm install
cp .env.example .env # değerleri düzenleyin
npm run dev
```

## Çevre Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `PORT` | Sunucunun dinleyeceği port (varsayılan 3000) |
| `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| `CORS_ORIGINS` | Virgülle ayrılmış izinli origin listesi |
| `RATE_LIMIT_WINDOW_MS` | Rate limit penceresi (ms) |
| `RATE_LIMIT_MAX` | Rate limit penceresi başına istek sayısı |

## Kullanılabilir Scriptler

- `npm start`: Üretim modunda sunucuyu başlatır
- `npm run dev`: Nodemon ile geliştirme ortamını başlatır
- `npm run seed`: Şema ve varsayılan verileri yükler

## API Uç Noktaları

- `GET /api/health`
- `GET /api/classes`
- `GET /api/attendance?classId=...&date=YYYY-MM-DD`
- `POST /api/attendance`
- `GET /api/reports?classId=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

## Heroku Deployment Adımları

1. Heroku hesabı oluşturun veya giriş yapın.
2. [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) aracını kurun ve `heroku login` komutuyla giriş yapın.
3. Proje dizininde yeni bir uygulama oluşturun:
   ```bash
   heroku create ata-akademi-yoklama
   ```
4. PostgreSQL eklentisini ekleyin:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
5. Oluşan `DATABASE_URL` değişkenini doğrulayın:
   ```bash
   heroku config:get DATABASE_URL
   ```
6. Opsiyonel olarak CORS ve rate limit değerlerini ayarlayın:
   ```bash
   heroku config:set CORS_ORIGINS="https://ata-akademi-frontend.netlify.app"
   heroku config:set RATE_LIMIT_WINDOW_MS=60000 RATE_LIMIT_MAX=120
   ```
7. Kodları Heroku'ya gönderin:
   ```bash
   git push heroku main
   ```
8. Veritabanını initialize edin:
   ```bash
   heroku run npm --prefix ataakademi-backend run seed
   ```
9. Uygulamanın çalıştığını kontrol edin:
   ```bash
   heroku open
   ```

## Test Senaryoları

```bash
# Sınıfları listele
curl https://ata-akademi-yoklama.herokuapp.com/api/classes

# Belirli gün için yoklama listele
curl "https://ata-akademi-yoklama.herokuapp.com/api/attendance?classId=tyt-sinifi&date=2024-05-01"

# Yoklama kaydet
curl -X POST https://ata-akademi-yoklama.herokuapp.com/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"date":"2024-05-01","status":"geldi"}'

# Rapor al
curl "https://ata-akademi-yoklama.herokuapp.com/api/reports?classId=tyt-sinifi&startDate=2024-05-01&endDate=2024-05-31"
```

## Frontend Bağlantısı

Frontend tarafında API tabanı otomatik algılanıyorsa ek ayar gerekmeyebilir. Aksi durumda aşağıdaki örnek kullanılabilir:

```javascript
const API_BASE = window.location.hostname.includes('herokuapp.com')
  ? 'https://ata-akademi-yoklama.herokuapp.com/api'
  : 'http://localhost:3000/api';
```

Netlify dağıtımı kullanıyorsanız `CORS_ORIGINS` değişkeninde Netlify domainini eklemeyi unutmayın.
