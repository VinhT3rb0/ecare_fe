// CompletedPatientsAppointments.tsx
"use client";

import React, { useState } from "react";
import { Table, Button, Space, Tag, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { getCookie } from "cookies-next";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import { useGetAppointmentsByDoctorQuery } from "@/api/app_apointment/apiAppointment";
import MedicalRecordView from "./components/MedicalRecordView";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;

const statusColors: Record<string, string> = {
    completed: "blue",
};

const CompletedPatientsAppointments: React.FC = () => {
    const userId = getCookie("idUser") as string | undefined;
    const { data: myDoctorData } = useGetMyDoctorQuery(userId as string, {
        skip: !userId,
    });
    const doctorId = myDoctorData?.id ? Number(myDoctorData.id) : undefined;

    const { data: appointments, isLoading: isLoadingAppointments } =
        useGetAppointmentsByDoctorQuery(
            { doctor_id: doctorId || 0, status: "completed" }, // 👈 truyền doctor_id + status
            { skip: !doctorId }
        );

    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    const columns = [
        {
            title: "Tên bệnh nhân",
            dataIndex: "patient_name",
            key: "patient_name",
        },
        {
            title: "Ngày hẹn",
            dataIndex: "appointment_date",
            key: "appointment_date",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Giờ hẹn",
            dataIndex: "time_slot",
            key: "time_slot",
        },
        {
            title: "Lý do khám",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status] || "default"}>
                    {status === "completed" ? "Đã hoàn thành" : status.toUpperCase()}
                </Tag>
            ),
        },
        {
            key: "action",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => setSelectedAppointmentId(record.id)}>
                        <EyeOutlined />
                    </Button>
                </Space>
            ),
        },
    ];

    if (isLoadingAppointments) {
        return <Spin tip="Đang tải danh sách bệnh nhân đã khám..." />;
    }

    return (
        <div>
            <Title level={3} style={{ color: "#0b6e64" }}>Danh sách bệnh nhân đã khám</Title>
            <Table
                columns={columns}
                dataSource={appointments?.data || []}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                bordered
            />
            <MedicalRecordView
                open={!!selectedAppointmentId}
                onClose={() => setSelectedAppointmentId(null)}
                appointmentId={selectedAppointmentId || 0}
            />
        </div>
    );
};

export default CompletedPatientsAppointments;
