import React from 'react'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold text-luxury-gold mb-4">
              Mois
            </h3>
            <p className="text-primary-300">
              Trải nghiệm sang trọng & đẳng cấp
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên Kết</h4>
            <ul className="space-y-2 text-primary-300">
              <li><a href="/" className="hover:text-luxury-gold">Trang Chủ</a></li>
              <li><a href="/hotels" className="hover:text-luxury-gold">Khách Sạn</a></li>
              <li><a href="/my-bookings" className="hover:text-luxury-gold">Đặt Phòng</a></li>
              <li><a href="/profile" className="hover:text-luxury-gold">Tài Khoản</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-primary-300">
              <li><a href="#" className="hover:text-luxury-gold">Trung Tâm Trợ Giúp</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Chính Sách Riêng Tư</a></li>
              <li><a href="#" className="hover:text-luxury-gold">Liên Hệ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên Hệ</h4>
            <div className="space-y-3 text-primary-300">
              <div className="flex items-center space-x-2">
                <MapPin size={18} />
                <span>Hồ Chí Minh, Việt Nam</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={18} />
                <span>+84 2839 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={18} />
                <span>info@mois.vn</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-400">
          <p>&copy; 2024 Mois Hotel Booking. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
