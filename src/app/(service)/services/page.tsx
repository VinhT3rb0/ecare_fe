"use client";

import { useState } from "react";
import { Input, List, Spin, Card, Pagination, Tag } from "antd";
import { useGetPackagesByDepartmentQuery, useGetPackagesQuery } from "@/api/app_package/apiPackage";
import { useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";
import Image from "next/image";
import Navbar from "@/components/Navbar/NavBar";
import ServiceBanner from "@/components/service/ServiceBanner";
import Footer from "@/components/Footer/Footer";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, delay: i * 0.1 },
    }),
};

export default function ServicesDirectoryPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedDept, setSelectedDept] = useState<number | null>(null);

    const { data: deptData, isLoading: loadingDept } = useGetDepartmentsQuery({});
    const departments = deptData?.departments || [];

    const listQuery = selectedDept
        ? useGetPackagesByDepartmentQuery({ departmentId: selectedDept, page, limit: 12, name: search || undefined })
        : useGetPackagesQuery({ page, limit: 12, name: search || undefined });

    const { data, isLoading } = listQuery as any;
    const services = data?.data || [];
    const total = data?.total || 0;

    const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + " đ";

    return (
        <>
            <Navbar />
            <div className="h-20" />
            <ServiceBanner />
            <section className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar trái: Tìm kiếm + Khoa */}
                <motion.aside
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="md:col-span-1 bg-white rounded-lg shadow p-4"
                >
                    <Input.Search
                        placeholder="Tìm kiếm dịch vụ..."
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
                            header={<div className="font-medium">Chuyên khoa</div>}
                            dataSource={departments}
                            renderItem={(dept: any) => (
                                <List.Item
                                    className={`cursor-pointer px-2 py-2 rounded-md hover:bg-gray-200 ${selectedDept === dept.id ? "bg-gray-300 font-semibold" : ""}`}
                                    onClick={() => {
                                        setSelectedDept(dept.id);
                                        setPage(1);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span>{dept.name}</span>
                                        <span className="text-xs text-gray-500">{dept.doctor_count} bác sĩ</span>
                                    </div>
                                </List.Item>
                            )}
                        />
                    )}
                </motion.aside>

                {/* Main content: Services */}
                <div className="md:col-span-3">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((svc: any, index: number) => {
                                    const price = Number(svc.price || 0);
                                    const discount = Number(svc.discount || 0);
                                    const hasDiscount = discount > 0;
                                    const discounted = hasDiscount ? Math.round(price * (1 - discount / 100)) : price;
                                    return (
                                        <motion.div
                                            key={svc.id}
                                            custom={index}
                                            initial="hidden"
                                            whileInView="visible"
                                            variants={fadeUp}
                                            viewport={{ once: true, amount: 0.2 }}
                                            whileHover={{ scale: 1.03 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            <Card
                                                hoverable
                                                className="rounded-xl shadow-md overflow-hidden h-full"
                                                cover={
                                                    <Image
                                                        src={svc.image_url || "/images/doctor-placeholder.jpg"}
                                                        alt={svc.name}
                                                        width={300}
                                                        height={350}
                                                        className="object-cover w-full h-80"
                                                    />
                                                }
                                            >
                                                <div className="flex flex-col justify-between h-40">
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-green-900 line-clamp-2 min-h-[3rem]">{svc.name}</h3>
                                                        <p className="text-gray-500 text-xs mb-2">{svc.Department?.name || "—"}</p>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[#064E3B] font-bold text-lg whitespace-nowrap">{formatCurrency(discounted)}</span>
                                                        {hasDiscount && (
                                                            <>
                                                                <span className="line-through text-gray-400 text-sm whitespace-nowrap">{formatCurrency(price)}</span>
                                                                <Tag color="red" className="whitespace-nowrap">-{discount}%</Tag>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={page}
                                    total={total}
                                    pageSize={12}
                                    onChange={(p) => setPage(p)}
                                    showSizeChanger={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
}


