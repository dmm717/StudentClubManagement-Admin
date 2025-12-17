# Student Club Management System - Admin Interface

Hệ thống quản lý câu lạc bộ sinh viên - Giao diện Admin

## 📋 Mô tả dự án

Đây là giao diện quản trị viên (Admin) của hệ thống quản lý câu lạc bộ sinh viên, được xây dựng bằng React + Vite.

### Main Actors
- **Admin**: Quản trị viên hệ thống (đã hoàn thành)
- Student: Sinh viên (chưa triển khai)
- Club Leader: Trưởng câu lạc bộ (chưa triển khai)

### Main Features (Admin)
✅ **CRUD Club**: Quản lý câu lạc bộ (Tạo, Xem, Sửa, Xóa)
✅ **CRUD Membership**: Quản lý thành viên (Tạo, Xem, Sửa, Xóa)
✅ **Thu phí hoạt động**: Quản lý và xác nhận thanh toán phí
✅ **Duyệt yêu cầu**: Xét duyệt đơn gia nhập câu lạc bộ
✅ **Báo cáo CLB**: Thống kê thành viên, doanh thu, và các báo cáo khác

### Workflows
1. **Setup 1: CRUD Club** - Quản lý thông tin câu lạc bộ
2. **Setup 2: CRUD Member Profile** - Quản lý hồ sơ thành viên
3. **Processing 1: Đơn gia nhập – duyệt – nộp phí** - Quy trình xét duyệt và thu phí
4. **Processing 2: Xử lý ngoại lệ** - Xử lý các trường hợp đặc biệt
5. **Report: Thống kê** - Báo cáo tổng hợp và phân tích

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository** (nếu có) hoặc đi đến thư mục dự án:
```bash
cd "Student Club Management System"
```

2. **Cài đặt dependencies**:
```bash
npm install
```

3. **Chạy ứng dụng ở chế độ development**:
```bash
npm run dev
```

4. **Mở trình duyệt** và truy cập:
```
http://localhost:5173
```

## 🔐 Đăng nhập

**Tài khoản Admin mặc định:**
- Username: `admin`
- Password: `admin123`

## 📁 Cấu trúc dự án (đã chuẩn hoá theo style SWP-391)

```text
src/
├── api/
│   ├── config/
│   │   ├── constants.js      # API_BASE_URL, SIGNALR_HUB_URL
│   │   └── client.js         # Axios client + interceptors (auth, 401/403)
│   ├── services/             # Service cho từng module (giữ nguyên logic cũ)
│   │   ├── auth.service.js
│   │   ├── clubLeaderRequest.service.js
│   │   ├── clubs.service.js
│   │   ├── accounts.service.js
│   │   ├── leaderClubs.service.js
│   │   ├── activities.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   └── index.js          # Placeholder cho các helper API chung
│   └── index.js              # Gom export tất cả service
│
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx   # Layout chính cho Admin
│   │   ├── AdminLayout.css
│   │   └── index.js
│   ├── ui/
│   │   ├── PageWrapper.jsx   # UI wrapper cho trang (tránh overflow ngang)
│   │   └── index.js
│   ├── NotificationBell.jsx  # Component chuông thông báo (dùng hook SignalR)
│   ├── ProtectedRoute.jsx    # Bảo vệ route admin bằng localStorage
│   └── index.js              # Barrel export cho components
│
├── context/
│   └── AppContext.jsx        # Scaffold context global (chưa dùng nhiều)
│
├── hooks/
│   └── useNotifications.js   # Hook quản lý kết nối SignalR và danh sách noti
│
├── pages/
│   └── admin/                # Các trang của Admin
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Clubs.jsx
│       ├── Accounts.jsx
│       ├── Activities.jsx
│       ├── Requests.jsx
│       ├── Reports.jsx
│       ├── *.css             # CSS riêng cho từng trang
│       └── index.js          # Barrel export (nếu sau này cần dùng)
│
├── routes/
│   └── AppRoutes.jsx         # Định nghĩa toàn bộ router (giống AppRoutes.tsx bên SWP-391)
│
├── services/
│   ├── api.js                # Re-export từ src/api/services (giữ import cũ không bị vỡ)
│   └── config.js             # Re-export từ src/api/config/constants
│
├── store/
│   └── index.js              # Scaffold cho store (chuẩn bị nếu cần Redux/Zustand)
│
├── utils/                    # Các utility functions chung (notifications, iconSizes, colors, ...)
├── assets/                   # Hình ảnh, icon, ...
├── App.jsx                   # Component gốc, chỉ wrap Router + AppRoutes (đơn giản như SWP-391)
├── App.css                   # CSS toàn cục
├── main.jsx                  # Entry point
└── index.css                 # Global styles/reset
```

## 🎨 Các trang chức năng

### 1. 🏠 Dashboard (Trang chủ)
- Tổng quan hệ thống
- Thống kê nhanh: Tổng CLB, thành viên, doanh thu
- Danh sách yêu cầu và thanh toán gần đây
- Thao tác nhanh

**Route:** `/admin/dashboard`

### 2. 🏛️ Quản lý Câu lạc bộ
- **Danh sách CLB** (`/admin/clubs`): Xem, tìm kiếm, lọc CLB
- **Thêm CLB mới** (`/admin/clubs/new`): Tạo CLB mới
- **Sửa CLB** (`/admin/clubs/:id/edit`): Chỉnh sửa thông tin CLB
- **Xóa CLB**: Xóa CLB khỏi hệ thống

**Chức năng:**
- Tìm kiếm theo tên, mã CLB
- Lọc theo trạng thái (hoạt động/ngừng)
- Thống kê số lượng CLB
- CRUD đầy đủ

### 3. 👥 Quản lý Thành viên
- **Danh sách thành viên** (`/admin/members`): Xem, tìm kiếm, lọc thành viên
- **Thêm thành viên** (`/admin/members/new`): Đăng ký thành viên mới
- **Sửa thành viên** (`/admin/members/:id/edit`): Cập nhật thông tin
- **Xóa thành viên**: Xóa thành viên khỏi hệ thống

**Chức năng:**
- Tìm kiếm theo tên, MSSV, email
- Lọc theo CLB và trạng thái phí
- Xem vai trò (Trưởng CLB/Thành viên)
- Quản lý trạng thái thanh toán phí

### 4. 💰 Quản lý Phí hoạt động
**Route:** `/admin/fees`

**Chức năng:**
- Xem danh sách phí cần thu
- Thống kê doanh thu (đã thu/chưa thu)
- Xác nhận thanh toán phí
- Chọn phương thức thanh toán (Tiền mặt/Chuyển khoản)
- Quản lý phí quá hạn
- Tìm kiếm và lọc theo trạng thái

### 5. 📝 Duyệt yêu cầu gia nhập
**Route:** `/admin/requests`

**Chức năng:**
- Xem danh sách đơn đăng ký
- Thống kê yêu cầu (chờ duyệt/đã duyệt/từ chối)
- Xem chi tiết đơn đăng ký
- Duyệt hoặc từ chối yêu cầu
- Xem lý do tham gia của sinh viên
- Tìm kiếm và lọc theo trạng thái

### 6. 📈 Báo cáo & Thống kê
**Route:** `/admin/reports`

**3 loại báo cáo:**

#### a) 📊 Tổng quan
- Tổng số CLB, thành viên
- Tổng doanh thu và số tiền chưa thu
- Biểu đồ trạng thái thanh toán

#### b) 🏛️ Báo cáo theo CLB
- Bảng thống kê từng CLB
- Số thành viên thực tế
- Số thành viên đã đóng phí
- Tỷ lệ thanh toán (%)
- Doanh thu từng CLB

#### c) 💰 Báo cáo Doanh thu
- Tổng doanh thu đã thu
- Doanh thu chưa thu
- Dự kiến tổng doanh thu
- Xếp hạng CLB theo doanh thu
- Biểu đồ doanh thu

**Chức năng bổ sung:**
- In báo cáo
- Xuất báo cáo (demo)

## 🎯 Các tính năng nổi bật

### 🎨 Giao diện đẹp và hiện đại
- Thiết kế responsive, thân thiện với mọi thiết bị
- Màu sắc và icon trực quan
- Animation mượt mà
- Gradient và shadow đẹp mắt

### ⚡ Hiệu suất cao
- React Router cho navigation nhanh
- Component-based architecture
- Tối ưu re-rendering

### 🔒 Bảo mật
- Protected routes (yêu cầu đăng nhập)
- Lưu session trong localStorage
- Redirect tự động khi chưa đăng nhập

### 📱 Responsive Design
- Tương thích desktop, tablet, mobile
- Sidebar thu gọn trên mobile
- Table scroll ngang khi cần thiết

### 🎭 UX tốt
- Modal xác nhận trước khi xóa
- Validation form đầy đủ
- Loading states và animations
- Error messages rõ ràng
- Success notifications

## 💾 Dữ liệu

Hiện tại dự án sử dụng **mock data** (dữ liệu mẫu) được lưu trong `src/data/mockData.js`.

Để tích hợp với backend thật:
1. Thay thế các import mock data
2. Tạo service layer để call API
3. Sử dụng React Query hoặc Redux để quản lý state
4. Xử lý loading và error states

## 🛠️ Công nghệ sử dụng

- **React 19.2.0** - UI Library
- **React Router DOM 7.x** - Routing
- **Vite 7.x** - Build tool và dev server
- **CSS3** - Styling (không dùng framework CSS)
- **ESLint** - Code linting

## 📝 Script commands

```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌟 Demo Flow

### Workflow 1: Quản lý CLB
1. Đăng nhập với admin/admin123
2. Vào "Quản lý CLB"
3. Thêm CLB mới
4. Sửa thông tin CLB
5. Xóa CLB (có confirm)

### Workflow 2: Quản lý thành viên
1. Vào "Quản lý thành viên"
2. Thêm thành viên mới
3. Gán vào CLB
4. Xem trạng thái phí

### Workflow 3: Duyệt đơn → Thu phí
1. Vào "Duyệt yêu cầu"
2. Xem chi tiết đơn đăng ký
3. Duyệt đơn
4. Vào "Quản lý phí"
5. Xác nhận thanh toán phí cho thành viên mới

### Workflow 4: Xem báo cáo
1. Vào "Báo cáo"
2. Xem tổng quan hệ thống
3. Xem báo cáo theo CLB
4. Xem báo cáo doanh thu
5. In báo cáo

## 🎓 Ghi chú

- Dự án này chỉ bao gồm giao diện **Admin**
- Dữ liệu là **mock data**, thay đổi sẽ không được lưu khi refresh
- Để sử dụng thực tế cần tích hợp backend API
- UI/UX được thiết kế theo best practices hiện đại

## 📧 Liên hệ

Nếu có thắc mắc về dự án, vui lòng liên hệ qua các kênh hỗ trợ.

---

**Happy Coding! 🚀**
#   S t u d e n t C l u b M a n a g e m e n t - A d m i n 
 
 