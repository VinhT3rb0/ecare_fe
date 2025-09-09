"use client";
import Image from "next/image";

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

export default function StrengthSection() {
    return (
        <section className="relative bg-gradient-to-r from-[#0A3C73] to-[#00A78E] py-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center px-6">
                {/* Cột ảnh */}
                <div className="relative h-[1250px] rounded-xl overflow-hidden shadow-lg">
                    <Image
                        src="/images/specialties/content1.yhwDzSr-_aTOh1.webp"
                        alt="Đội ngũ bác sĩ"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Cột nội dung */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
                        ĐỘI NGŨ BÁC SĨ <span className="text-[#00FFCF]">CHUYÊN GIA ĐẦU NGÀNH</span>
                    </h2>

                    <div className="space-y-6">
                        {highlights.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-lg"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00A78E] text-white font-bold shrink-0 shadow-md">
                                    {index + 1}
                                </div>
                                <p className="text-[#0A3C73] text-base md:text-lg font-medium leading-relaxed">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
