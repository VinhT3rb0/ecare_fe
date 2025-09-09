"use client";

import { useParams } from "next/navigation";
import { Spin, Card, Tag, Divider, Button, Space } from "antd";
import Image from "next/image";
import Link from "next/link";
import { PhoneOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import Navbar from "@/components/Navbar/NavBar";
import Footer from "@/components/Footer/Footer";

export default function DoctorDetailPage() {
    const { id } = useParams();
    const { data: doctor, isLoading } = useGetMyDoctorQuery(id as string, {
        skip: !id,
    });

    // Loading / not found
    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="h-20" />
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
                <Footer />
            </>
        );
    }

    if (!doctor) {
        return (
            <>
                <Navbar />
                <div className="h-20" />
                <p className="text-center py-20">Không tìm thấy bác sĩ</p>
                <Footer />
            </>
        );
    }

    // Helper
    const genderLabel = doctor.gender === "male" ? "Nam" : doctor.gender === "female" ? "Nữ" : "Khác";

    return (
        <>
            <Navbar />
            <div className="h-28" />
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/doctors" className="inline-flex items-center text-[#064E3B] hover:underline">
                            <ArrowLeftOutlined />
                            <span className="ml-2">Quay lại</span>
                        </Link>
                        <nav className="text-sm text-gray-500 ml-4">
                            <Link href="/" className="hover:text-[#11A998]">Trang chủ</Link>
                            <span className="mx-2 text-gray-300">{'>'}</span>
                            <Link href="/doctors" className="hover:text-[#11A998]">Danh sách bác sĩ</Link>
                            <span className="mx-2 text-gray-300">{'>'}</span>
                            <span className="text-[#064E3B] font-semibold">{doctor.full_name}</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <section className="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: sticky card với avatar + contact/CTA */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28"> {/* top-28 để tránh Navbar (điều chỉnh nếu Navbar cao hơn) */}
                        <Card className="rounded-xl shadow-lg overflow-hidden">
                            <div className="w-full h-80 relative rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                    src={doctor.avatar_img || "/images/doctor-placeholder.jpg"}
                                    alt={doctor.full_name}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </div>

                            <div className="text-center mt-4">
                                <h1 className="text-2xl font-bold text-[#064E3B]">{doctor.full_name}</h1>
                                {doctor.education_level && (
                                    <p className="text-sm text-[#11A998] font-medium mt-1">{doctor.education_level}</p>
                                )}
                                <p className="text-gray-600 mt-2">{genderLabel} • {doctor.experience_years} năm kinh nghiệm</p>
                                <p className="text-gray-600 text-sm mt-1">{doctor.email}</p>
                                <p className="text-gray-600 text-sm mt-1">{doctor.phone}</p>

                                <Divider />

                                <Space direction="vertical" size="small" className="w-full">
                                    <a href={`tel:${doctor.phone}`} className="w-full">
                                        <Button block icon={<PhoneOutlined />} size="large" style={{ borderColor: "#11A998", color: "#064E3B", background: "#ffffff" }}>
                                            Gọi bác sĩ
                                        </Button>
                                    </a>
                                    <Button block type="primary" size="large" style={{ background: "#11A998", borderColor: "#11A998" }}>
                                        Đặt lịch khám
                                    </Button>
                                </Space>
                            </div>
                        </Card>

                        {/* Quick info */}
                        <Card className="mt-4 rounded-xl shadow-md">
                            <h3 className="font-semibold text-[#064E3B] mb-2">Thông tin nhanh</h3>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li><strong>Chuyên khoa:</strong> {doctor.departments?.map((d: any) => d.name).join(", ") || "—"}</li>
                                <li><strong>Email:</strong> {doctor.email || "—"}</li>
                                <li><strong>SĐT:</strong> {doctor.phone || "—"}</li>
                                <li><strong>Trình độ:</strong> {doctor.education_level || "—"}</li>
                            </ul>
                        </Card>
                    </div>
                </aside>

                {/* RIGHT: main detail */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title card */}
                    <Card className="rounded-xl shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-[#064E3B] mb-1">{doctor.full_name}</h2>
                                <p className="text-sm text-gray-600">{doctor.education_level} • {doctor.Degrees?.[0]?.specialization || "Chuyên môn chưa cập nhật"}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {doctor.departments?.map((d: any) => (
                                        <Tag key={d.id} color="#064E3B" className="text-[#064E3B] border-none">{d.name}</Tag>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* About / Bio */}
                    <Card
                        title={<span className="text-[#064E3B] font-semibold">Lịch sử học vấn</span>}
                        className="rounded-xl shadow-md"
                    >
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {doctor.education_history ||
                                "Bác sĩ chưa cập nhật lịch sử học vấn. Vui lòng liên hệ phòng khám để biết thêm chi tiết."}
                        </p>
                    </Card>

                    {/* Degrees / Qualifications */}
                    <Card title={<span className="text-[#064E3B] font-semibold">Trình độ & Chuyên môn</span>} className="rounded-xl shadow-md">
                        {doctor.Degrees?.length > 0 ? (
                            doctor.Degrees.map((deg: any) => (
                                <div key={deg.id} className="mb-4">
                                    <h4 className="text-lg font-semibold text-[#064E3B]">{deg.specialization}</h4>
                                    <p className="text-sm text-gray-700">{deg.practice_scope}</p>
                                    <p className="text-xs text-gray-500 mt-1">Cấp tại {deg.issue_place} — {deg.issue_date}</p>
                                    <Divider />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">Chưa có thông tin văn bằng</p>
                        )}
                    </Card>

                    {/* Department descriptions */}
                    <Card title={<span className="text-[#064E3B] font-semibold">Mô tả chuyên khoa</span>} className="rounded-xl shadow-md">
                        {doctor.departments?.map((d: any) => (
                            <div key={d.id} className="mb-6">
                                <h4 className="text-base font-semibold text-green-800">{d.name}</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">{d.description}</p>
                            </div>
                        ))}
                    </Card>
                </div>
            </section>

            <Footer />
        </>
    );
}
