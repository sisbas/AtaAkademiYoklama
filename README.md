# Ata Akademi Yoklama Sistemi

Ata Akademi için geliştirilen modern yoklama ve devamsızlık yönetim arayüzü. Proje React + Vite ile oluşturuldu ve Tailwind CSS ile stillendirildi. Tüm veriler kullanıcıların tarayıcısında saklanır; herhangi bir sunucuya ihtiyaç duymaz.

## Başlangıç

```bash
npm install
npm run dev
```

`npm run dev` komutu uygulamayı geliştirme modunda çalıştırır. Tarayıcınızda [http://localhost:5173](http://localhost:5173) adresini açarak görüntüleyebilirsiniz.

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
