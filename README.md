# BizLegal website

Static, responsive website for `bizlegal.asia`.

## Cấu trúc

- `index.html`: main service website and contact form
- `privacy.html`: privacy and personal data policy
- `terms.html`: terms and conditions
- `cookies.html`: cookie policy
- `assets/styles.css`: shared responsive design system
- `assets/i18n.js`: Vietnamese, English, Simplified Chinese and Korean content
- `assets/app.js`: navigation, reveal motion, contact submission and consent management
- `content/articles.json`: nội dung tiếng Việt và dữ liệu dùng chung (ngày, nguồn tham khảo)
- `content/articles.en.json`, `articles.zh.json`, `articles.ko.json`: nội dung Anh, Trung và Hàn theo cùng `slug`
- `scripts/build-articles.mjs`: tạo trang danh mục, trang chi tiết, tìm kiếm, phân trang và sitemap
- `insights/`, `en/insights/`, `zh/insights/`, `ko/insights/`: thư viện và trang bài viết SEO tĩnh cho 4 ngôn ngữ

## Đăng bài mới không cần CMS

1. Sao chép một bài hiện có trong cả bốn tệp `content/articles*.json` và giữ cùng một `slug`.
2. Cập nhật nội dung từng ngôn ngữ. Ngày và nguồn tham khảo chỉ cần quản lý trong `articles.json` tiếng Việt.
3. Chạy `npm run build` hoặc `node scripts/build-articles.mjs` tại thư mục website.
4. Kiểm tra bài tại bốn thư mục ngôn ngữ, sau đó upload toàn bộ website.

Script tự sắp xếp bài mới nhất, tạo danh mục 12 bài mỗi trang, bộ lọc, tìm kiếm, `hreflang` và `sitemap.xml`. Với khoảng 100 bài, quy trình vẫn giữ nguyên; không cần sửa template thủ công.

## Deployment

Upload the contents of this directory to the web root. The contact form sends JSON to `POST /api/contact`; connect this endpoint before launch. Until connected, the form reports a clear error and does not show a false success state.

Cookie consent is stored under `bizlegal_cookie_consent_v1` for up to 180 days. Analytics and marketing are off by default. Integrations should listen for the `bizlegal:consent-changed` browser event and load non-essential scripts only when the matching consent is `true`.

Review the legal-policy copy with qualified Vietnamese counsel before production publication and add a dedicated privacy contact channel when available.
