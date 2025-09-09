"use client";

import React, { useMemo, useState } from "react";
import { Table, Tag, Button, Space, Spin, Modal, Input, message } from "antd";
import dayjs from "dayjs";
import { useGetAppointmentsByPatientQuery, useRequestCancelAppointmentMutation } from "@/api/app_apointment/apiAppointment";
import { getAccessTokenFromCookie } from "@/utils/token";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PatientsAppointment: React.FC = () => {
    const router = useRouter();
    const currentUserId = useMemo(() => {
        try {
            const token = getAccessTokenFromCookie();
            if (!token) return null;
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
        } catch {
            return null;
        }
    }, []);

    const { data: appointments, isLoading } = useGetAppointmentsByPatientQuery(
        { patient_id: Number(currentUserId) || 0 },
        { skip: !currentUserId }
    );

    const [requestCancel] = useRequestCancelAppointmentMutation();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const openCancelModal = (id: number) => {
        setSelectedId(id);
        setCancelReason("");
        setCancelModalOpen(true);
    };

    const handleSubmitCancel = async () => {
        if (!selectedId) return;
        try {
            await requestCancel({ id: selectedId, reason: cancelReason }).unwrap();
            toast.success("Đã gửi yêu cầu hủy");
            setCancelModalOpen(false);
        } catch (e) {
            toast.error("Gửi yêu cầu hủy thất bại");
        }
    };

    const handleDeposit = (appointment: any) => {
        router.push(`/management/payment/deposit?appointment_id=${appointment.id}`);
    };

    const columns = [
        {
            title: "Bác sĩ",
            key: "doctor_name",
            render: (_: any, record: any) => record?.Doctor?.User?.full_name || record?.Doctor?.full_name || "-",
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
            title: "Phòng khám",
            key: "room",
            render: (_: any, record: any) => record?.DoctorSchedule?.Room?.name || "-",
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
            render: (status: string) => {
                const color = status === "pending" ? "orange" : status === "confirmed" ? "green" : status === "cancel_requested" ? "gold" : "red";
                return <Tag color={color}>{status?.toUpperCase?.() || status}</Tag>;
            },
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any) => (
                <Space>
                    {(record.status === "pending" || record.status === "confirmed") && (
                        <Button danger onClick={() => openCancelModal(record.id)}>Yêu cầu hủy</Button>
                    )}
                </Space>
            )
        }
    ];

    if (!currentUserId) {
        return <div>Vui lòng đăng nhập để xem lịch khám.</div>;
    }

    if (isLoading) {
        return <Spin tip="Đang tải lịch khám..." />;
    }

    return (
        <div>
            <Table
                columns={columns}
                dataSource={appointments?.data || []}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Yêu cầu hủy lịch"
                open={cancelModalOpen}
                onOk={handleSubmitCancel}
                onCancel={() => setCancelModalOpen(false)}
                okText="Gửi yêu cầu"
                cancelText="Đóng"
            >
                <p>Vui lòng nhập lý do hủy:</p>
                <Input.TextArea rows={4} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            </Modal>
        </div>
    );
};

export default PatientsAppointment;
