"use client";

import { useState } from "react";
import { Input, List, Spin, Card, Pagination } from "antd";
import { useGetDoctorApprovedQuery, useGetDoctorByDepartmentQuery } from "@/api/app_doctor/apiDoctor";
import Image from "next/image";
import Link from "next/link";
import { useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";
import Navbar from "@/components/Navbar/NavBar";
import DoctorBanner from "@/components/doctor/DoctorBanner";
import { motion, Variants } from "framer-motion";
import Footer from "@/components/Footer/Footer";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.1 },
    }),
};

export default function DoctorDirectoryPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedDept, setSelectedDept] = useState<number | null>(null);

    const { data: deptData, isLoading: loadingDept } = useGetDepartmentsQuery({});
    const departments = deptData?.departments || [];

    // Query bác sĩ
    const { data: doctorData, isLoading: loadingDoctors } =
        selectedDept
            ? useGetDoctorByDepartmentQuery(selectedDept)
            : useGetDoctorApprovedQuery({ page, limit: 12, name: search });

    const doctors = doctorData?.doctors || doctorData?.approvedDoctors || [];
    const total = doctorData?.total || 0;

    return (
        <>
            <Navbar />
            <DoctorBanner />
            <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar trái: Departments */}
                <motion.aside
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="md:col-span-1 bg-white rounded-lg shadow p-4"
                >
                    <Input.Search
                        placeholder={selectedDept ? "Tìm kiếm khoa..." : "Tìm kiếm bác sĩ..."}
                        allowClear
                        onSearch={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                        className="mb-4"
                    />

                    {loadingDept ? (
                        <Spin />
                    ) : (
                        <List
                            dataSource={departments}
                            renderItem={(dept: any) => (
                                <List.Item
                                    className={`cursor-pointer px-2 py-2 rounded-md hover:bg-gray-200 ${selectedDept === dept.id ? "bg-gray-300 font-semibold" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedDept(dept.id);
                                        setPage(1);
                                        setSearch(""); // reset search khi chọn dept
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span>{dept.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {dept.doctor_count} bác sĩ
                                        </span>
                                    </div>
                                </List.Item>
                            )}
                        />
                    )}
                </motion.aside>

                {/* Main content: Doctors */}
                <div className="md:col-span-3">
                    {loadingDoctors ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {doctors.map((doc: any, index: number) => (
                                    <motion.div
                                        key={doc.user_id}
                                        custom={index}
                                        initial="hidden"
                                        whileInView="visible"
                                        variants={fadeUp}
                                        viewport={{ once: true, amount: 0.2 }}
                                        whileHover={{ scale: 1.03 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <Link href={`/doctors/${doc.user_id}`}>
                                            <Card
                                                hoverable
                                                className="rounded-xl shadow-md overflow-hidden"
                                                cover={
                                                    <Image
                                                        src={
                                                            doc.avatar_img ||
                                                            "/images/doctor-placeholder.jpg"
                                                        }
                                                        alt={doc.full_name}
                                                        width={300}
                                                        height={350}
                                                        className="object-cover w-full h-80"
                                                    />
                                                }
                                            >
                                                <h3 className="font-semibold text-lg text-green-900">
                                                    <span>{doc.education_level} - </span>
                                                    {doc.full_name}
                                                </h3>

                                                <p className="text-gray-500 text-xs">
                                                    {doc.departments
                                                        ?.map((d: any) => d.name)
                                                        .join(", ")}
                                                </p>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {!selectedDept && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        current={page}
                                        total={total}
                                        pageSize={12}
                                        onChange={(p) => setPage(p)}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
}
