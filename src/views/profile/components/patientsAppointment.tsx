"use client";

import React, { useMemo, useState } from "react";
import { Table, Tag, Button, Space, Spin, Modal, Input } from "antd";
import dayjs from "dayjs";
import { useGetAppointmentsByPatientQuery, useRequestCancelAppointmentMutation } from "@/api/app_apointment/apiAppointment";
import { getAccessTokenFromCookie } from "@/utils/token";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppointmentDetailModal from "./appointmentDetailModal";
import { EyeOutlined } from "@ant-design/icons";

const PatientsAppointment: React.FC = () => {
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
    // Map status -> màu
    const statusColors: Record<string, string> = {
        pending: "gold",
        confirmed: "green",
        cancel_requested: "orange",
        cancelled: "red",
        completed: "blue",
        in_treatment: "purple",
    };

    // Map status -> text hiển thị
    const statusTexts: Record<string, string> = {
        pending: "Chờ xử lý",
        confirmed: "Đã xác nhận",
        cancel_requested: "Yêu cầu hủy",
        cancelled: "Đã hủy",
        completed: "Hoàn tất",
        in_treatment: "Đang điều trị",
    };

    const [requestCancel] = useRequestCancelAppointmentMutation();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

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

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            pending: { color: "gold", label: "Chờ xử lý" },
            confirmed: { color: "green", label: "Đã xác nhận" },
            cancel_requested: { color: "orange", label: "Yêu cầu hủy" },
            cancelled: { color: "red", label: "Đã hủy" },
            completed: { color: "blue", label: "Hoàn tất" },
            in_treatment: { color: "purple", label: "Đang điều trị" },
        };
        const { color, label } = statusMap[status] || { color: "default", label: status || "Không xác định" };
        return <Tag color={color}>{label}</Tag>;
    };

    const columns = [
        {
            title: "Bác sĩ",
            key: "doctor_name",
            render: (_: any, record: any) => record?.Doctor?.full_name || "-",
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
            title: "Khoa",
            key: "department",
            render: (_: any, record: any) => record?.Department?.name || "-",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => getStatusTag(status),
        },
        {
            key: "action",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => { setSelectedAppointment(record); setDetailModalOpen(true); }}>
                        <EyeOutlined />
                    </Button>
                    {(record.status === "pending" || record.status === "confirmed") && (
                        <Button danger onClick={() => openCancelModal(record.id)}>Yêu cầu hủy</Button>
                    )}
                </Space>
            ),
        },
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

            {/* Modal chi tiết */}
            <AppointmentDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                appointment={selectedAppointment}
                statusColors={statusColors}
                statusTexts={statusTexts}
            />

            {/* Modal yêu cầu hủy */}
            <Modal
                title="Yêu cầu hủy lịch"
                open={cancelModalOpen}
                onOk={handleSubmitCancel}
                onCancel={() => setCancelModalOpen(false)}
                okText="Gửi yêu cầu"
                cancelText="Đóng"
            >
                <p>Vui lòng nhập lý do hủy:</p>
                <Input.TextArea
                    rows={4}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default PatientsAppointment;
