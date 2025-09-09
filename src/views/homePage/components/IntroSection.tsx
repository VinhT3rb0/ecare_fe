// components/IntroSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

interface IntroSectionProps {
    backgroundImage: string;
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

const IntroSection: React.FC<IntroSectionProps> = ({
    backgroundImage,
    featureImage,
}) => {
    return (
        <section
            className="relative w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative max-w-6xl mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                    className="group flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-xl w-80 h-80 lg:w-96 lg:h-96"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0}
                    variants={slideIn("left")}
                >
                    <Image
                        src={featureImage}
                        alt="Feature"
                        width={384}
                        height={384}
                        className="object-cover"
                    />
                </motion.div>

                <motion.div
                    className="text-white max-w-2xl space-y-6 text-justify"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={1}
                    variants={slideIn("right")}
                >
                    <h2
                        style={{ color: "#11A998" }}
                        className="text-3xl lg:text-4xl font-bold uppercase leading-snug"
                    >
                        Giới thiệu về phòng khám<br />Đa khoa Thanh Bình
                    </h2>
                    <p className="text-lg">
                        Phòng khám đa khoa Thanh Bình điều trị{' '}
                        <span className="font-semibold">tư vấn khám bệnh và điều trị chuyên sâu</span>{' '}
                        bằng và máy móc hỗ trợ hiện đại, an toàn,
                        không tác dụng phụ, không biến chứng, với sứ mệnh giúp
                        người Việt sống khỏe hơn.
                    </p>
                    <p className="text-lg">
                        Với đội ngũ Bác sĩ tư vấn, Kỹ thuật viên được đào tạo bài bản, giàu kinh nghiệm,
                        Thanh Bình chú trọng đặc biệt đến việc chăm sóc và đồng hành cùng bệnh nhân,
                        mang đến sự thay đổi rõ rệt. Các phương pháp trị liệu an toàn và hiệu quả áp dụng
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-base">
                        <li>Khám tổng quát và tầm soát sức khỏe định kỳ.</li>
                        <li>Điều trị chuyên sâu các bệnh nội khoa, cơ xương khớp, tiêu hóa, tim mạch.</li>
                        <li>Chăm sóc sức khỏe phụ nữ, nhi khoa, và tư vấn dinh dưỡng.</li>
                        <li>Thực hiện xét nghiệm, siêu âm, nội soi và các dịch vụ cận lâm sàng khác.</li>
                    </ul>
                </motion.div>
            </div>
        </section>
    );
};

export default IntroSection;
