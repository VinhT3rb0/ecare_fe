"use client";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const highlights = [
    "Quy tụ hơn 500 bác sĩ giỏi chuyên môn, tay nghề cao thuộc nhiều chuyên khoa mũi nhọn.",
    "Nhiều năm kinh nghiệm công tác tại các bệnh viện tuyến trung ương như: Bệnh viện 108, 103, Xanh Pôn, Phụ sản Hà Nội,…",
    "Từng giữ nhiều chức vụ quan trọng tại các bệnh viện tuyến đầu như: Giám đốc bệnh viện, viện trưởng, phó viện trưởng, trưởng khoa,…",
    "Bác sĩ tư vấn bệnh, trả lời tận tâm, 'khám bệnh bằng cả trái tim, giao tiếp bằng nụ cười'.",
    "Liên tục cập nhật kiến thức, công nghệ y khoa tiên tiến trong và ngoài nước, mang đến phác đồ điều trị hiệu quả, hiện đại.",
    "Thấu hiểu tâm lý người bệnh, đặc biệt là trẻ em, phụ nữ mang thai và người cao tuổi.",
    "Thực hiện chẩn đoán chính xác, điều trị chuẩn xác, hạn chế xâm lấn tối đa.",
    "Đội ngũ bác sĩ thường xuyên tham gia các chương trình từ thiện, khám chữa bệnh miễn phí cho người nghèo, vùng sâu vùng xa.",
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: i * 0.15,
            ease: "easeOut",
        },
    }),
};

export default function StrengthSection() {
    return (
        <section className="relative bg-gradient-to-r from-[#0A3C73] to-[#00A78E] py-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6">
                {/* Cột ảnh */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative h-[600px] md:h-[750px] lg:h-[850px] rounded-xl overflow-hidden shadow-lg"
                >
                    <Image
                        src="/images/specialties/content1.yhwDzSr-_aTOh1.webp"
                        alt="Đội ngũ bác sĩ"
                        fill
                        className="object-cover"
                    />
                </motion.div>

                {/* Cột nội dung */}
                <div>
                    {/* Tiêu đề */}
                    <motion.h2
                        initial={{ opacity: 0, y: -30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="text-3xl md:text-4xl font-extrabold text-white mb-8"
                    >
                        ĐỘI NGŨ BÁC SĨ{" "}
                        <span className="text-[#00FFCF]">CHUYÊN GIA ĐẦU NGÀNH</span>
                    </motion.h2>

                    {/* Highlights */}
                    <div className="space-y-6">
                        {highlights.map((item, index) => (
                            <motion.div
                                key={index}
                                custom={index}
                                initial="hidden"
                                whileInView="visible"
                                variants={fadeUp}
                                viewport={{ once: true, amount: 0.2 }}
                                className="flex items-start gap-4 bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00A78E] text-white font-bold shrink-0 shadow-md">
                                    {index + 1}
                                </div>
                                <p className="text-[#0A3C73] text-base md:text-lg font-medium leading-relaxed">
                                    {item}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
