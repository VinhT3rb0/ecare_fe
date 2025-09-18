"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";

type ApiDoctor = {
    id: number;
    full_name: string;
    avatar_img: string;
    education_level: string;
    departments: { id: number; name: string }[];
};

type Props = {
    doctors: ApiDoctor[];
};

const DoctorCarousel: React.FC<Props> = ({ doctors }) => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <div className="px-6 py-10">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
                Đội ngũ bác sĩ
            </h2>
            <Slider {...settings}>
                {doctors.map((doc) => (
                    <div key={doc.id} className="px-4">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden text-center p-6 hover:shadow-xl transition">
                            <div className="relative w-48 h-48 mx-auto mb-4">
                                <Image
                                    src={doc.avatar_img}
                                    alt={doc.full_name}
                                    fill
                                    className="object-cover rounded-md"
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                {doc.departments?.[0]?.name || "Chưa có khoa"}
                            </p>
                            <p className="text-sm text-gray-600">{doc.education_level}</p>
                            <h3 className="text-lg font-semibold text-emerald-700 mt-2">
                                {doc.full_name}
                            </h3>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default DoctorCarousel;
