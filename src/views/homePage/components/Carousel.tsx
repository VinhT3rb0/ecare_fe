// src/components/Carousel/Carousel.tsx
import React from "react";
import { Carousel } from "antd";

const carouselData = [
    {
        image: "/images/homePage/homepage1.jpg",
        text: "Khám phá dịch vụ y tế hiện đại",
    },
    {
        image: "/images/homePage/homepage2.jpg",
        text: "Chăm sóc sức khỏe toàn diện",
    },
    {
        image: "/images/homePage/homepage3.jpg",
        text: "Đội ngũ chuyên gia tận tâm",
    },
];

const CustomCarousel: React.FC = () => (
    <Carousel autoplay>
        {carouselData.map((item, idx) => (
            <div key={idx}>
                <div
                    className="relative w-full h-[400px] md:h-[700px] flex items-center justify-center"
                    style={{
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="text-white text-2xl md:text-4xl font-bold text-center px-4 mb-6">
                            {item.text}
                        </div>
                        <a
                            href="/signin"
                            className="inline-block px-6 py-2 !bg-teal-600 !text-white font-semibold rounded-full shadow-lg hover:!bg-teal-700 transition"
                        >
                            Đặt lịch khám ngay
                        </a>
                    </div>
                </div>
            </div>
        ))}
    </Carousel>
);

export default CustomCarousel;
