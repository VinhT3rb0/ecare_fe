"use client";

import {
    FacebookOutlined,
    YoutubeOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="relative bg-gradient-to-r from-[#fcfdfd] to-[#f4f6f6] text-gray-700 py-12 overflow-hidden">
            {/* Overlay mờ trắng để làm sáng chữ */}
            <div className="absolute inset-0 bg-white/30"></div>

            {/* Logo background mờ */}
            <div className="absolute inset-0 opacity-5 flex items-center justify-center">
                <Image
                    src="/images/logoEcare.png"
                    alt="Background Logo"
                    width={600}
                    height={400}
                    className="object-contain"
                />
            </div>

            {/* Nội dung chính */}
            <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 px-6">
                {/* Giới thiệu */}
                <div>
                    <Image
                        src="/images/logoEcare.png"
                        alt="Logo"
                        width={160}
                        height={80}
                        className="mb-4"
                    />
                    <p className="text-sm leading-relaxed text-gray-600">
                        Hệ thống chăm sóc sức khỏe Ecare – Nơi kết nối đội ngũ bác sĩ giỏi,
                        công nghệ hiện đại, mang đến dịch vụ y tế chất lượng và tận tâm cho
                        mọi gia đình.
                    </p>
                </div>

                {/* Liên kết nhanh */}
                <div>
                    <h4 className="text-lg font-semibold mb-4 text-[#0A3C73]">Liên kết nhanh</h4>
                    <ul className="space-y-2 text-gray-600">
                        <li><a href="/" className="hover:text-[#0A3C73] transition">Trang chủ</a></li>
                        <li><a href="/about" className="hover:text-[#0A3C73] transition">Giới thiệu</a></li>
                        <li><a href="/services" className="hover:text-[#0A3C73] transition">Dịch vụ</a></li>
                        <li><a href="/doctors" className="hover:text-[#0A3C73] transition">Đội ngũ bác sĩ</a></li>
                        <li><a href="/contact" className="hover:text-[#0A3C73] transition">Liên hệ</a></li>
                    </ul>
                </div>

                {/* Dịch vụ */}
                <div>
                    <h4 className="text-lg font-semibold mb-4 text-[#0A3C73]">Dịch vụ</h4>
                    <ul className="space-y-2 text-gray-600">
                        <li>Khám sức khỏe tổng quát</li>
                        <li>Tư vấn trực tuyến</li>
                        <li>Xét nghiệm – Chẩn đoán</li>
                        <li>Điều trị chuyên khoa</li>
                    </ul>
                </div>

                {/* Liên hệ */}
                <div>
                    <h4 className="text-lg font-semibold mb-4 text-[#0A3C73]">Liên hệ</h4>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-center gap-2"><PhoneOutlined /> 0936 388 288</li>
                        <li className="flex items-center gap-2"><MailOutlined /> contact@ecare.vn</li>
                        <li className="flex items-center gap-2"><EnvironmentOutlined /> 123 Nguyễn Trãi, Hà Nội</li>
                    </ul>

                    {/* Social */}
                    <div className="flex gap-4 mt-4 text-xl">
                        <a href="#" className="hover:text-[#0A3C73] text-gray-500"><FacebookOutlined /></a>
                        <a href="#" className="hover:text-[#0A3C73] text-gray-500"><YoutubeOutlined /></a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="relative border-t border-gray-300 mt-10 pt-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Ecare. All rights reserved.
            </div>
        </footer>
    );
}
