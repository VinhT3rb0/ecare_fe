"use client";
import { Typography, Card } from "antd";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const { Title, Paragraph } = Typography;

interface Service {
    title: string;
    description: string;
    image: string;
}

const services: Service[] = [
    {
        title: "Khám chữa bệnh đa chuyên khoa",
        description:
            "Nội, Ngoại, Sản, Nhi, Ung bướu, Tiêu hóa, Gan mật, Tai mũi họng, Mắt, Răng hàm mặt, Cơ xương khớp, Nội tiết, Dinh dưỡng...",
        image: "/images/specialties/26d57e56cf54857fd8a8b9f4a56a3403.jpg",
    },
    {
        title: "Tầm soát dự phòng bệnh",
        description:
            "Các gói khám sức khỏe tổng quát, tầm soát ung thư, tim mạch, tiểu đường... phù hợp mọi lứa tuổi.",
        image: "/images/specialties/5b2f38b36ea96da0f4475f5381defe79.jpg",
    },
    {
        title: "Điều trị nội trú",
        description:
            "Phòng lưu viện hiện đại, tiện nghi đầy đủ giúp bệnh nhân yên tâm nghỉ ngơi và phục hồi, theo sát 24/7.",
        image: "/images/specialties/c12cf2d14146be8898350147f242402d.jpg",
    },
    {
        title: "Thai sản trọn gói",
        description:
            "Chăm sóc mẹ và bé toàn diện từ thai kỳ đến sau sinh với nhiều gói dịch vụ phù hợp.",
        image: "/images/specialties/8a476bf80e9cadeea2ff66ba11aa0e76.jpg",
    },
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: i * 0.2,
            ease: "easeOut",
        },
    }),
};

export default function ServicesSection() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center px-4">
                {/* Tiêu đề */}
                <Title
                    level={2}
                    className="!text-[#0A3C73] text-3xl md:text-5xl font-extrabold mb-12"
                >
                    Đa dạng <span className="text-[#00A78E]">chuyên khoa</span>, dịch vụ
                </Title>

                {/* Danh sách dịch vụ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            variants={fadeUp}
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="h-full"
                        >
                            <Card
                                hoverable
                                className="h-full flex flex-col justify-between rounded-xl border-2 border-[#00A78E] hover:border-[#0ACFB1] transition-all shadow-md"
                                cover={
                                    <Image
                                        src={service.image}
                                        alt={service.title}
                                        width={500}
                                        height={350}
                                        className="rounded-t-xl object-cover h-56"
                                    />
                                }
                            >
                                <div className="flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-[#00A78E] mb-2">
                                        {service.title}
                                    </h3>
                                    <Paragraph className="text-gray-600 text-sm leading-relaxed flex-grow">
                                        {service.description}
                                    </Paragraph>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
