"use client";

import React, { useState } from "react";
import {
    Modal,
    Descriptions,
    Tag,
    Divider,
    Button,
    Spin,
    Space,
} from "antd";
import {
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import MedicalRecordForm from "./MedicalRecordForm";


interface AppointmentDetailModalProps {
    open: boolean;
    onClose: () => void;
    appointment: any;
    loading?: boolean;
    onManageMedicalRecord?: (appointmentId: number) => void;
    onSuccess?: () => void;
}

const statusColors: Record<string, string> = {
    pending: "orange",
    confirmed: "green",
    completed: "blue",
    cancel_requested: "gold",
    cancelled: "red",
    in_treatment: "purple",
};

const statusTexts: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancel_requested: "Yêu cầu hủy",
    cancelled: "Đã hủy",
    in_treatment: "Đang điều trị",
};

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    open,
    onClose,
    appointment,
    loading = false,
    onSuccess,
}) => {
    const [medicalRecordModalOpen, setMedicalRecordModalOpen] = useState(false);

    if (!appointment) return null;

    const handleOpenMedicalRecordModal = () => {
        setMedicalRecordModalOpen(true);
    };

    const handleCloseMedicalRecordModal = () => {
        setMedicalRecordModalOpen(false);
    };

    const handleMedicalRecordSuccess = () => {
        if (onSuccess) {
            onSuccess();
        }
        setMedicalRecordModalOpen(false);
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MedicineBoxOutlined style={{ color: "#0b6e64" }} />
                    <span style={{ color: "#0b6e64", fontWeight: 600 }}>
                        Chi tiết lịch hẹn #{appointment.id}
                    </span>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={600}
            footer={null}
            destroyOnHidden
        >
            <Spin spinning={loading}>
                <div style={{ marginBottom: 16 }}>
                    <Tag
                        color={statusColors[appointment.status]}
                        icon={appointment.status === "in_treatment" ? <MedicineBoxOutlined /> : undefined}
                        style={{ fontSize: 14, padding: "4px 12px" }}
                    >
                        {statusTexts[appointment.status]}
                    </Tag>
                </div>

                <Divider orientation="left">👤 Thông tin bệnh nhân</Divider>
                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Họ tên">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <UserOutlined style={{ color: "#1890ff" }} />
                            {appointment.patient_name}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">
                        {appointment.patient_dob
                            ? dayjs(appointment.patient_dob).format("DD/MM/YYYY")
                            : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giới tính">
                        {appointment.patient_gender === "male"
                            ? "Nam"
                            : appointment.patient_gender === "female"
                                ? "Nữ"
                                : "Khác"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <PhoneOutlined style={{ color: "#52c41a" }} />
                            {appointment.patient_phone}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <MailOutlined style={{ color: "#1890ff" }} />
                            {appointment.patient_email || "—"}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <HomeOutlined style={{ color: "#fa8c16" }} />
                            {appointment.patient_address}
                        </div>
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">📅 Thông tin lịch hẹn</Divider>
                <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Ngày hẹn">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <CalendarOutlined style={{ color: "#52c41a" }} />
                            {dayjs(appointment.appointment_date).format("DD/MM/YYYY")}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khung giờ">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ClockCircleOutlined style={{ color: "#1890ff" }} />
                            {appointment.time_slot}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Lý do khám">
                        {appointment.reason || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Khoa">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <MedicineBoxOutlined style={{ color: "#722ed1" }} />
                            {appointment.Department?.name || "—"}
                        </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bác sĩ">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <UserOutlined style={{ color: "#0b6e64" }} />
                            {appointment.Doctor?.full_name || "—"}
                        </div>
                    </Descriptions.Item>

                </Descriptions>

                {appointment.status === "in_treatment" && (
                    <div style={{ marginTop: 24, textAlign: "right" }}>
                        <Space>
                            <Button onClick={onClose}>
                                Đóng
                            </Button>
                            <Button
                                type="default"
                                size="large"
                                onClick={handleOpenMedicalRecordModal}
                                icon={<FileTextOutlined />}
                            >
                                Hồ sơ bệnh án
                            </Button>
                        </Space>
                    </div>
                )}

                {appointment.status !== "in_treatment" && (
                    <div style={{ marginTop: 24, textAlign: "right" }}>
                        <Button type="primary" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                )}
            </Spin>
            <MedicalRecordForm
                open={medicalRecordModalOpen}
                onClose={handleCloseMedicalRecordModal}
                medicalRecordId={appointment?.medical_record?.id}
                appointmentId={appointment?.id || 0}
                onSuccess={handleMedicalRecordSuccess}
            />
        </Modal>
    );
};

export default AppointmentDetailModal;
