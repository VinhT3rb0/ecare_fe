"use client"
import Navbar from "@/components/Navbar/NavBar";
import React from "react";
import { getCookie } from "cookies-next";
import Banner from "@/components/specialties/Banner";
import ServicesSection from "@/components/specialties/Service";
import StrengthSection from "@/components/specialties/StrengthSection";
import Footer from "@/components/Footer/Footer";
import ChatBox from "@/views/homePage/components/ChatBox";

function Departments() {
    const role = getCookie('role');
    return (
        <>
            <Navbar />
            <Banner
                title="CHĂM SÓC SỨC KHỎE TRỌN ĐỜI CHO BẠN"
                highlight="BỆNH VIỆN ĐKQT Thanh Bình"
                description="Bệnh viện Đa khoa Quốc tế Thanh Bình, bệnh viện tư nhân tại Hà Nội nổi tiếng trong lĩnh vực chăm sóc sức khỏe toàn diện. Thanh Bình được đánh giá là 1 trong những bệnh viện tốt nhất Hà Nội với điểm chất lượng dẫn đầu (top 3 bệnh viện tư nhân, top 5 toàn bệnh viện). Với đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại cùng dịch vụ y tế chất lượng cao, chúng tôi cam kết mang đến trải nghiệm chăm sóc sức khỏe tận tâm, chu đáo và chuyên nghiệp."
                image="/images/specialties/banner.jpg"
            />
            <ServicesSection />
            <StrengthSection />
            {(role === 'patient' || !role) && <ChatBox />}
            <Footer />
        </>
    )
}

export default Departments;