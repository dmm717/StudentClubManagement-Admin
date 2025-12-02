// Mock data for Student Club Management System

export const clubs = [
  {
    id: 1,
    name: 'Câu lạc bộ Lập trình',
    code: 'CLB001',
    description: 'Câu lạc bộ dành cho sinh viên yêu thích lập trình và công nghệ',
    leader: 'Nguyễn Văn A',
    foundedDate: '2023-01-15',
    memberCount: 45,
    fee: 100000,
    status: 'active'
  },
  {
    id: 2,
    name: 'Câu lạc bộ Tiếng Anh',
    code: 'CLB002',
    description: 'Nơi rèn luyện và phát triển kỹ năng tiếng Anh',
    leader: 'Trần Thị B',
    foundedDate: '2023-02-20',
    memberCount: 38,
    fee: 80000,
    status: 'active'
  },
  {
    id: 3,
    name: 'Câu lạc bộ Nhiếp ảnh',
    code: 'CLB003',
    description: 'Khám phá nghệ thuật nhiếp ảnh và sáng tạo hình ảnh',
    leader: 'Lê Văn C',
    foundedDate: '2023-03-10',
    memberCount: 32,
    fee: 120000,
    status: 'active'
  },
  {
    id: 4,
    name: 'Câu lạc bộ Âm nhạc',
    code: 'CLB004',
    description: 'Phát triển tài năng âm nhạc và biểu diễn',
    leader: 'Phạm Thị D',
    foundedDate: '2023-04-05',
    memberCount: 28,
    fee: 150000,
    status: 'active'
  },
  {
    id: 5,
    name: 'Câu lạc bộ Thiện nguyện',
    code: 'CLB005',
    description: 'Hoạt động vì cộng đồng và xã hội',
    leader: 'Hoàng Văn E',
    foundedDate: '2023-05-12',
    memberCount: 52,
    fee: 50000,
    status: 'inactive'
  }
];

export const members = [
  {
    id: 1,
    studentId: 'SV001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@student.edu.vn',
    phone: '0123456789',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    joinDate: '2023-06-01',
    role: 'Trưởng CLB',
    feeStatus: 'paid',
    status: 'active'
  },
  {
    id: 2,
    studentId: 'SV002',
    fullName: 'Trần Thị B',
    email: 'tranthib@student.edu.vn',
    phone: '0123456788',
    clubId: 2,
    clubName: 'Câu lạc bộ Tiếng Anh',
    joinDate: '2023-06-05',
    role: 'Trưởng CLB',
    feeStatus: 'paid',
    status: 'active'
  },
  {
    id: 3,
    studentId: 'SV003',
    fullName: 'Lê Văn C',
    email: 'levanc@student.edu.vn',
    phone: '0123456787',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    joinDate: '2023-06-10',
    role: 'Thành viên',
    feeStatus: 'paid',
    status: 'active'
  },
  {
    id: 4,
    studentId: 'SV004',
    fullName: 'Phạm Thị D',
    email: 'phamthid@student.edu.vn',
    phone: '0123456786',
    clubId: 3,
    clubName: 'Câu lạc bộ Nhiếp ảnh',
    joinDate: '2023-06-15',
    role: 'Thành viên',
    feeStatus: 'pending',
    status: 'active'
  },
  {
    id: 5,
    studentId: 'SV005',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@student.edu.vn',
    phone: '0123456785',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    joinDate: '2023-06-20',
    role: 'Thành viên',
    feeStatus: 'overdue',
    status: 'active'
  }
];

export const joinRequests = [
  {
    id: 1,
    studentId: 'SV010',
    fullName: 'Đặng Văn F',
    email: 'dangvanf@student.edu.vn',
    phone: '0123456780',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    requestDate: '2023-11-25',
    reason: 'Tôi rất đam mê lập trình và muốn học hỏi thêm',
    status: 'pending'
  },
  {
    id: 2,
    studentId: 'SV011',
    fullName: 'Vũ Thị G',
    email: 'vuthig@student.edu.vn',
    phone: '0123456779',
    clubId: 2,
    clubName: 'Câu lạc bộ Tiếng Anh',
    requestDate: '2023-11-26',
    reason: 'Muốn cải thiện kỹ năng tiếng Anh giao tiếp',
    status: 'pending'
  },
  {
    id: 3,
    studentId: 'SV012',
    fullName: 'Bùi Văn H',
    email: 'buivanh@student.edu.vn',
    phone: '0123456778',
    clubId: 3,
    clubName: 'Câu lạc bộ Nhiếp ảnh',
    requestDate: '2023-11-27',
    reason: 'Yêu thích nhiếp ảnh và muốn phát triển kỹ năng',
    status: 'approved'
  },
  {
    id: 4,
    studentId: 'SV013',
    fullName: 'Đinh Thị I',
    email: 'dinhthii@student.edu.vn',
    phone: '0123456777',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    requestDate: '2023-11-28',
    reason: 'Muốn tham gia các dự án thực tế',
    status: 'rejected'
  }
];

export const fees = [
  {
    id: 1,
    memberId: 1,
    memberName: 'Nguyễn Văn A',
    studentId: 'SV001',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    amount: 100000,
    paymentDate: '2023-06-01',
    paymentMethod: 'Chuyển khoản',
    semester: 'HK1 2023-2024',
    status: 'completed',
    note: ''
  },
  {
    id: 2,
    memberId: 2,
    memberName: 'Trần Thị B',
    studentId: 'SV002',
    clubId: 2,
    clubName: 'Câu lạc bộ Tiếng Anh',
    amount: 80000,
    paymentDate: '2023-06-05',
    paymentMethod: 'Tiền mặt',
    semester: 'HK1 2023-2024',
    status: 'completed',
    note: ''
  },
  {
    id: 3,
    memberId: 4,
    memberName: 'Phạm Thị D',
    studentId: 'SV004',
    clubId: 3,
    clubName: 'Câu lạc bộ Nhiếp ảnh',
    amount: 120000,
    paymentDate: null,
    paymentMethod: '',
    semester: 'HK1 2023-2024',
    status: 'pending',
    note: ''
  },
  {
    id: 4,
    memberId: 5,
    memberName: 'Hoàng Văn E',
    studentId: 'SV005',
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    amount: 100000,
    paymentDate: null,
    paymentMethod: '',
    semester: 'HK1 2023-2024',
    status: 'overdue',
    note: 'Quá hạn 15 ngày'
  }
];

export const adminUser = {
  id: 1,
  username: 'admin',
  password: 'admin123',
  fullName: 'Quản trị viên',
  email: 'admin@system.edu.vn',
  role: 'admin'
};

