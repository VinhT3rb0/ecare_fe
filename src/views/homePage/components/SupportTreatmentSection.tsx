// components/SupportTreatmentSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

interface SupportTreatmentSectionProps {
    backgroundImage?: string;
    featureImage: string;
}

const slideIn = (direction: "left" | "right"): Variants => ({
    hidden: {
        opacity: 0,
        x: direction === "left" ? -50 : 50,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
});

const SupportTreatmentSection: React.FC<SupportTreatmentSectionProps> = ({
    backgroundImage = '/images/homePage/backgroundTreatment.jpg',
    featureImage,
}) => {
    return (
        <section
            className="relative w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="absolute inset-0 bg-white/80"></div>
            <div className="relative max-w-6xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    variants={slideIn("left")}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
                        Hỗ trợ khám & điều trị hiệu quả
                    </h2>
                    <p className="text-gray-700">
                        Các phương pháp xử lý an toàn và hiệu quả tại Phòng khám Đa khoa Thanh Bình:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
                        <li>Khám tổng quát và tầm soát sức khỏe định kỳ.</li>
                        <li>Điều trị chuyên sâu các bệnh nội khoa, cơ xương khớp, tiêu hóa, tim mạch.</li>
                        <li>Chăm sóc sức khỏe phụ nữ, nhi khoa, và tư vấn dinh dưỡng.</li>
                        <li>Thực hiện xét nghiệm, siêu âm, nội soi và các dịch vụ cận lâm sàng khác.</li>
                    </ul>
                    <button
                        className="mt-4 inline-block px-6 py-2 border border-blue-800 text-blue-800 font-medium rounded-full hover:bg-blue-800 hover:!text-white transition"
                        onClick={() => window.location.href = '/contact'}
                    >
                        Liên hệ đặt lịch
                    </button>
                </motion.div>

                {/* Slide-in Image từ phải với hover zoom */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    variants={slideIn("right")}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="rounded-2xl overflow-hidden shadow-lg w-full max-w-md">
                        <Image
                            src={featureImage}
                            alt="Điều trị hỗ trợ"
                            width={600}
                            height={400}
                            className="object-cover"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SupportTreatmentSection;
