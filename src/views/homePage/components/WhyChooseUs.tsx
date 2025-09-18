"use client";

import { motion } from "framer-motion";
import { Stethoscope, HeartPulse, BriefcaseMedical, Globe } from "lucide-react";

const features = [
    {
        icon: <Stethoscope className="w-6 h-6 text-emerald-700" />,
        title: "Đội ngũ bác sĩ chuyên môn cao",
        desc: "Đội ngũ bác sĩ, chuyên gia giàu kinh nghiệm, có thâm niên công tác tại các bệnh viện lớn và được đào tạo chuyên sâu tại các nước có nền y học phát triển.",
    },
    {
        icon: <HeartPulse className="w-6 h-6 text-emerald-700" />,
        title: "Trang thiết bị hiện đại",
        desc: "Máy móc, trang thiết bị nhập khẩu từ Anh, Mỹ, Nhật, Hàn... đảm bảo tiêu chuẩn quốc tế.",
    },
    {
        icon: <BriefcaseMedical className="w-6 h-6 text-emerald-700" />,
        title: "Dịch vụ y tế chuyên nghiệp",
        desc: "Tận tâm trong từng quy trình từ thăm khám, điều trị đến chăm sóc sau điều trị.",
    },
    {
        icon: <Globe className="w-6 h-6 text-emerald-700" />,
        title: "Đẩy mạnh hợp tác quốc tế",
        desc: "Không ngừng mở rộng hợp tác y tế với nhiều hiệp hội, tổ chức lớn trên thế giới.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="bg-gray-50 py-16">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                {/* Left */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-emerald-900 mb-4">
                        Lý do để khách hàng tin - yêu <span className="text-emerald-700">Thanh Bình</span>?
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Với hơn 20 năm phát triển, Thanh Bình là một trong những hệ thống y tế tư nhân uy tín hàng đầu, tiên phong kết hợp
                        giữa chăm sóc sức khỏe hiện đại và dịch vụ tiêu chuẩn khách sạn 5*, mang đến cho khách hàng trải nghiệm y tế
                        toàn diện, an tâm và đẳng cấp.
                    </p>
                    <motion.button
                        style={{ color: "#fff" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-[#11A998] font-medium rounded-full shadow-md hover:bg-[#0A3A67] transition"
                    >
                        Xem tất cả dịch vụ
                    </motion.button>
                </motion.div>

                {/* Right */}
                <div className="grid sm:grid-cols-2 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-xl shadow p-6 border border-gray-100"
                        >
                            <div className="mb-3">{f.icon}</div>
                            <h4 className="font-semibold text-emerald-900 mb-2">{f.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
