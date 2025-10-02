# Ata Akademi Yoklama Sistemi

Ata Akademi için geliştirilen modern yoklama ve devamsızlık yönetim arayüzü. Proje React + Vite ile oluşturuldu ve Tailwind CSS ile stillendirildi. Artık yoklama ekranında görünen tüm öğrenci verileri Neon üzerinde tutulan PostgreSQL veritabanından dinamik olarak çekilmektedir. Netlify Functions aracılığıyla çalışan sunucusuz API, istemcinin doğrudan veritabanı kimlik bilgilerini bilmesine gerek kalmadan güvenli veri aktarımı sağlar.

## Veri Kaynağı ve Sunucusuz API

- Netlify Functions içinde bulunan `students-db` fonksiyonu, `NEON_DATABASE_URL`, `NETLIFY_DATABASE_URL` veya `DATABASE_URL` ortam değişkenlerinden birinde tanımlanan Neon veritabanına bağlanır.
- Varsayılan kurulumda istemci `/.netlify/functions/students-db` uç noktasına istek gönderir. Geliştirme ortamında Netlify CLI ile çalışmak istemiyorsanız `VITE_STUDENTS_API` değişkeni ile tam URL verebilirsiniz.
- `PUBLIC_MODE=true` şeklinde bir ortam değişkeni tanımlandığında API, ad ve soyad alanlarını maskeleyerek döndürür.

### Ortam Değişkenleri

Yerel geliştirme sırasında `.env` dosyası oluşturup aşağıdaki değişkenleri tanımlayabilirsiniz:

```bash
# Netlify Neon eklentisi kullanıyorsanız `NETLIFY_DATABASE_URL` değişkeni otomatik atanır.
NEON_DATABASE_URL="postgresql://<kullanici>:<sifre>@<sunucu>/<veritabani>?sslmode=require"
NEON_SSL_DISABLED=false
PUBLIC_MODE=false
# İsteğe bağlı olarak istemcinin kullanacağı doğrudan bir uç nokta tanımlayabilirsiniz
# VITE_STUDENTS_API="https://<proje>.netlify.app/.netlify/functions/students-db"
```

`netlify dev` komutu ile fonksiyonları yerel olarak çalıştırırken bu değişkenler otomatik olarak okunacaktır.

## Başlangıç

```bash
npm install
# Neon bağlantısını sağlayacak ortam değişkenlerini ayarladıktan sonra
netlify dev
```

`netlify dev` komutu hem Vite geliştirme sunucusunu hem de Netlify Functions katmanını birlikte çalıştırır. Tarayıcınızda [http://localhost:8888](http://localhost:8888) adresini açarak uygulamayı görüntüleyebilirsiniz. Sadece Vite sunucusunu (`npm run dev`) çalıştırmak isterseniz API isteklerini yönlendirecek `VITE_STUDENTS_API` değişkenini sağlamanız gerekir.

### Sorun Giderme

- **"Neon bağlantı adresi tanımlı değil" hatası**: Fonksiyon hiçbir bağlantı dizesi bulamadı demektir. Netlify Neon eklentisi kullanıyorsanız site ayarlarında `NETLIFY_DATABASE_URL` değişkeninin tanımlı olduğundan emin olun; manuel kurulumda `NEON_DATABASE_URL` veya `DATABASE_URL` değişkenine bağlantı dizesini girin. Yerelde çalışırken `.env` dosyanıza aynı değerleri ekleyebilirsiniz. Uygulama bu durumla karşılaştığında arayüzde ayrıntılı bir uyarı mesajı gösterir.

## Üretim İçin Derleme

```bash
npm run build
```

Derleme işlemi `dist/` klasöründe statik dosyalar oluşturur. Bu çıktı Netlify, Vercel veya GitHub Pages gibi statik barındırma servislerine kolaylıkla dağıtılabilir.

İsteğe bağlı olarak yerel olarak derlenmiş uygulamayı test etmek için:

```bash
npm run preview
```

## Netlify Dağıtımı

1. Bu projeyi GitHub hesabınıza aktarın.
2. Netlify üzerinde yeni bir site oluştururken GitHub deposunu seçin.
3. Build komutu olarak `npm run build`, yayın dizini olarak `dist` değerlerini kullanın.

## Teknolojiler

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide React](https://lucide.dev)

## Lisans

Bu proje Ata Akademi iç kullanımına yönelik olarak hazırlanmıştır.
