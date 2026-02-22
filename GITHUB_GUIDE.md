# 🚀 Hướng Dẫn Upload Lên GitHub

## ✅ **CÁC FILE CẦN UPLOAD (Commit)**

### **1. Core HTML Files** ✅
```
✅ index.html              # Homepage chính
✅ admin.html              # Admin dashboard
✅ privacy-policy.html     # Privacy policy page
✅ terms-of-service.html   # Terms of service page
```

### **2. Documentation** ✅
```
✅ README.md               # Project documentation
✅ ADMIN_FEATURES.md       # Admin features guide
✅ GITHUB_GUIDE.md         # GitHub upload guide (file này)
```

### **3. Configuration Files** ✅
```
✅ package.json            # Project metadata
✅ .gitignore              # Git ignore rules
```

### **4. Public Assets** ✅
```
✅ public/
   ✅ manifest.json        # PWA manifest
   ✅ service-worker.js    # Service worker (offline mode)
   ✅ robots.txt           # SEO robots file
   ✅ sitemap.xml          # SEO sitemap
   ✅ fonts/               # Custom fonts (nếu có)
   ✅ images/              # Public images
```

### **5. Source Code** ✅
```
✅ src/
   ✅ css/                 # All CSS files
      ✅ base/
      ✅ components/
      ✅ layouts/
      ✅ utilities/
      ✅ style.css
   
   ✅ js/                  # All JavaScript files
      ✅ config/
      ✅ features/
      ✅ managers/
      ✅ services/
      ✅ state/
      ✅ utils/
      ✅ main.js
      ✅ admin-app.js
   
   ✅ assets/              # Asset files
      ✅ images/           # Product images, logos, etc.
```

---

## ❌ **CÁC FILE KHÔNG NÊN UPLOAD (Đã được gitignore)**

### **1. System Files** ❌
```
❌ .DS_Store              # macOS system file
❌ Thumbs.db              # Windows thumbnail cache
❌ ._*                    # macOS resource forks
❌ Desktop.ini            # Windows desktop settings
```

### **2. Editor/IDE Files** ❌
```
❌ .vscode/               # VS Code settings
❌ .idea/                 # IntelliJ IDEA settings
❌ *.sublime-*            # Sublime Text files
```

### **3. Dependencies** ❌
```
❌ node_modules/          # NPM packages (sẽ install lại)
❌ package-lock.json      # Lock file (tự generate)
```

### **4. Build/Temp Files** ❌
```
❌ dist/                  # Build output
❌ build/                 # Build artifacts
❌ .cache/                # Cache files
❌ *.log                  # Log files
❌ *.tmp                  # Temporary files
```

### **5. Python Cache** ❌ (Từ http.server local)
```
❌ __pycache__/           # Python bytecode cache
❌ *.pyc                  # Python compiled files
```

### **6. Sensitive Data** ❌ ⚠️ **QUAN TRỌNG**
```
❌ .env                   # Environment variables
❌ .env.local             # Local env config
❌ config/api-keys.js     # API keys (nếu có)
❌ config/analytics.js    # Real analytics IDs
```

---

## 📝 **BƯỚC ĐỂ UPLOAD LÊN GITHUB**

### **Bước 1: Kiểm tra Git đã cài chưa**
```bash
git --version
```
Nếu chưa có thì [download Git](https://git-scm.com/downloads)

### **Bước 2: Khởi tạo Git (nếu chưa làm)**
```bash
cd "/Users/macbookofhien/Documents/Web Lap Xuong"
git init
```

### **Bước 3: Kiểm tra files sẽ được commit**
```bash
# Xem files sẽ được track
git status

# Xem files bị ignore
git status --ignored
```

### **Bước 4: Add tất cả files (trừ những cái trong .gitignore)**
```bash
git add .
```

### **Bước 5: Commit với message**
```bash
git commit -m "Initial commit: DeltaDev Link - Complete security & GDPR compliance"
```

### **Bước 6: Tạo repo trên GitHub**
1. Vào https://github.com
2. Click "New repository"
3. Đặt tên: `deltadev-link` hoặc `lap-xuong-website`
4. **KHÔNG** chọn "Initialize with README" (vì đã có rồi)
5. Click "Create repository"

### **Bước 7: Connect local repo với GitHub**
```bash
# Thay YOUR_USERNAME và YOUR_REPO bằng tên thật
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Example:
# git remote add origin https://github.com/nthehien04/deltadev-link.git
```

### **Bước 8: Push code lên GitHub**
```bash
# Push lần đầu (-u để set upstream)
git push -u origin main

# Nếu branch là master thay vì main:
# git push -u origin master
```

---

## ⚠️ **TRƯỚC KHI UPLOAD - CHECKLIST BẢO MẬT**

### **🔴 CẦN KIỂM TRA TRƯỚC:**

1. **Analytics IDs** - Vẫn còn placeholder? ✅ OK để public
   ```javascript
   // index.html vẫn có:
   G-XXXXXXXXXX        ✅ OK (placeholder)
   GTM-XXXXXXX         ✅ OK (placeholder)
   YOUR_PIXEL_ID_HERE  ✅ OK (placeholder)
   ```
   ⚠️ **Nếu thay bằng real IDs thì KHÔNG nên public repo!**

2. **Personal Info** - Kiểm tra không có:
   - ❌ Passwords
   - ❌ API keys thật
   - ❌ Credit card info
   - ❌ Private addresses/phone (đã có trong code - OK vì là business info)

3. **Business Sensitive** - Có thể public:
   - ✅ Business name: DeltaDev Link (OK)
   - ✅ Phone: 0373948649 (OK - đây là contact info công khai)
   - ✅ Address: Cai Be, Tien Giang (OK - địa chỉ business)
   - ✅ Email: support@deltadevlink.com (OK)

---

## 🎯 **REPO SETTINGS KHUYẾN NGHỊ**

### **Nếu muốn repo PRIVATE:**
```
✅ Private repo (không ai thấy code)
- Chỉ bạn có quyền truy cập
- Tốt nếu có real analytics IDs
- GitHub Free: Unlimited private repos
```

### **Nếu muốn repo PUBLIC:**
```
✅ Public repo (mọi người thấy code)
- Showcase portfolio
- Open source project
- Tốt cho SEO (GitHub ranking)
- ⚠️ PHẢI chắc không có sensitive data
```

**Khuyến nghị:** Bắt đầu với **PRIVATE** → sau đó đổi Public khi đã check kỹ!

---

## 🔄 **CẬP NHẬT SAU NÀY**

### **Khi thay đổi code:**
```bash
# 1. Check xem thay đổi gì
git status

# 2. Add files đã thay đổi
git add .

# 3. Commit với message rõ ràng
git commit -m "Fix: Update cookie consent banner styling"

# 4. Push lên GitHub
git push
```

### **Tạo branch mới cho features:**
```bash
# Tạo branch mới
git checkout -b feature/new-payment-method

# Làm việc, commit như thường
git add .
git commit -m "Add: MoMo payment integration"

# Push branch lên GitHub
git push -u origin feature/new-payment-method

# Merge vào main khi xong (trên GitHub hoặc local)
```

---

## 📦 **SIZE REPO DỰ KIẾN**

```
Total size: ~5-10 MB (ước tính)

Breakdown:
- HTML/CSS/JS:     ~500 KB
- Images:          ~4-8 MB (tuỳ số lượng ảnh)
- Documentation:   ~50 KB
- Config files:    ~10 KB
```

⚠️ **GitHub free limit:** 100 MB/file, 100 GB/repo
✅ Project này nhỏ gọn, không vấn đề!

---

## 🎉 **SAU KHI UPLOAD XONG**

### **Thêm badges vào README.md:**
```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.0.0-green.svg)
![Security](https://img.shields.io/badge/security-GDPR%20compliant-brightgreen.svg)
```

### **Enable GitHub Pages (nếu muốn):**
1. Vào repo Settings
2. Tìm "Pages"
3. Source: main branch
4. Save
5. Website sẽ live tại: `https://YOUR_USERNAME.github.io/YOUR_REPO`

**Note:** GitHub Pages chỉ support static sites (HTML/CSS/JS) - perfect cho project này! 🎯

---

## ✅ **TÓM TẮT**

| Action | Command |
|--------|---------|
| Init Git | `git init` |
| Check status | `git status` |
| Add all | `git add .` |
| Commit | `git commit -m "message"` |
| Add remote | `git remote add origin <URL>` |
| Push | `git push -u origin main` |
| Update | `git add . && git commit -m "msg" && git push` |

---

**Questions?** 
- DM me: 0373948649
- Email: support@deltadevlink.com

**Happy coding!** 🚀
