"use client";

import Breadcrumb from "../Breadcrum/Breadcrum";

export default function DoctorBanner() {
    return (
        <div className="relative w-full h-80 md:h-[200px] lg:h-[280px] flex items-center justify-center">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/doctors/doctor.jpg')" }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
                    Danh sách bác sĩ
                </h1>
                <Breadcrumb
                    items={[
                        { label: "Trang chủ", href: "/" },
                        { label: "Danh sách bác sĩ" },
                    ]}
                />
            </div>
        </div>
    );
}
