"use client";

import React, { useEffect, useState } from "react";
import { Table, Tag, Spin } from "antd";
import dayjs from "dayjs";
import { useGetInvoicesByPatientQuery } from "@/api/app_invoice/apiInvoice";
import MyInvoiceDetail from "./MyInvoiceDetail";

interface InvoicePageProps {
    patientId?: number;
}

const MyInvoices: React.FC<InvoicePageProps> = ({ patientId }) => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const { data, isLoading, refetch } = useGetInvoicesByPatientQuery(
        { patient_id: patientId ?? 0 },
        { skip: !patientId }
    );

    useEffect(() => {
        if (patientId) refetch();
    }, [patientId, refetch]);

    const columns = [
        {
            title: "Bác sĩ",
            key: "doctor",
            render: (_: any, record: any) => {
                const doctor = record.Appointment.Doctor.full_name;
                return doctor
            },
        },
        {
            title: "Ngày khám",
            key: "appointment",
            render: (_: any, record: any) => {
                const appt = record.Appointment;
                return appt
                    ? `${dayjs(appt.appointment_date).format(
                        "DD/MM/YYYY"
                    )} ${appt.time_slot}`
                    : "-";
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const statusMap: Record<string, { color: string; label: string }> = {
                    unpaid: { color: "gold", label: "Chờ thanh toán" },
                    paid: { color: "green", label: "Đã thanh toán" },
                    cancelled: { color: "red", label: "Đã hủy" },
                };
                const { color, label } =
                    statusMap[status] || { color: "default", label: status || "Không rõ" };
                return <Tag color={color}>{label}</Tag>;
            },
        },
        {
            title: "Thông tin lịch hẹn",
            key: "appointment",
            render: (_: any, record: any) => {
                const appt = record.Appointment;
                return appt
                    ? `${appt.patient_name} - ${dayjs(appt.appointment_date).format(
                        "DD/MM/YYYY"
                    )} ${appt.time_slot}`
                    : "-";
            },
        },
    ];

    if (!patientId) {
        return <p className="text-gray-600">Vui lòng đăng nhập để xem hóa đơn.</p>;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Spin size="large" tip="Đang tải hóa đơn..." />
            </div>
        );
    }

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedInvoice(record);
                        setDetailOpen(true);
                    },
                })}
            />

            <MyInvoiceDetail
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                invoice={selectedInvoice}
            />
        </div>
    );
};

export default MyInvoices;
