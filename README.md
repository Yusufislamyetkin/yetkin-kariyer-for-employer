# YTK Career - İşveren Kariyer Platformu

YTK Career, işverenler için kapsamlı bir kariyer yönetim platformudur. Bu platform, işverenlerin iş ilanları, freelancer projeler, hackathon'lar yönetmesine, CV havuzuna erişmesine, mülakat sonuçlarını görüntülemesine ve başarılı kullanıcıları keşfetmesine olanak tanır.

## Özellikler

- **İş İlanları Yönetimi**: İlan oluşturma, düzenleme, başvuruları görüntüleme
- **Freelancer Projeler**: Proje oluşturma, teklif yönetimi
- **Hackathon Yönetimi**: Hackathon oluşturma, başvurular ve takımları görüntüleme
- **CV Havuzu**: Tüm kullanıcıların CV'lerini görüntüleme, filtreleme ve arama
- **Mülakat Sonuçları**: Tüm kullanıcıların mülakat sonuçlarını görüntüleme ve analiz
- **Başarılı Kullanıcılar**: Puan sıralamasına göre en başarılı kullanıcıları görüntüleme
- **Analytics**: Platform istatistikleri ve grafikler

## Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth v5 (Employer-only)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js & react-chartjs-2

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables'ı ayarlayın:
```bash
# .env.local dosyası oluşturun
POSTGRES_PRISMA_URL=your_database_url
POSTGRES_URL_NON_POOLING=your_database_url
AUTH_SECRET=your_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id (opsiyonel)
GOOGLE_CLIENT_SECRET=your_google_client_secret (opsiyonel)
```

3. Prisma client'ı generate edin:
```bash
npm run db:generate
```

4. Development server'ı başlatın:
```bash
npm run dev
```

## Deployment (Vercel)

1. Vercel'e projeyi import edin
2. Environment variables'ı ekleyin:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `AUTH_SECRET`
   - `GOOGLE_CLIENT_ID` (opsiyonel)
   - `GOOGLE_CLIENT_SECRET` (opsiyonel)
3. Domain'i `ytkcareer.com.tr` olarak ayarlayın

## Notlar

- Bu platform sadece `employer` rolündeki kullanıcılar tarafından erişilebilir
- Aynı PostgreSQL veritabanını `ytkacademy` projesi ile paylaşır
- Tüm kullanıcı verileri ve aktiviteleri aynı veritabanından okunur
