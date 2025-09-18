"use client";

import React from "react";
import { Drawer, Descriptions, Tag, Divider, Typography, Button } from "antd";
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CheckSquareOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
import RescheduleAppointmentModal from "./RescheduleAppointmentModal";
import toast from "react-hot-toast";
import { useUpdateAppointmentMutation, useDoctorCancelAppointmentMutation } from "@/api/app_apointment/apiAppointment";

type Appointment = {
    id: number;
    patient_id?: number | null;
    patient_name: string;
    patient_dob: string;
    patient_phone: string;
    patient_email: string | null;
    patient_gender: "male" | "female" | "other";
    patient_address: string;
    doctor_id: number;
    department_id: number;
    schedule_id: number;
    appointment_date: string;
    time_slot: string;
    reason: string | null;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "cancel_requested";
    cancel_reason?: string | null;
    cancel_requested_at?: string | null;
    cancel_confirmed_at?: string | null;
    createdAt: string;
    updatedAt: string;
    Doctor?: {
        id: number;
        full_name: string;
        email: string;
        phone: string;
    };
    Department?: {
        id: number;
        name: string;
    };
};

export default function AppointmentDetail({
    open,
    onClose,
    appointment,
}: {
    open: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}) {
    const statusConfig: Record<
        Appointment["status"],
        { color: string; icon: React.ReactNode; label: string }
    > = {
        pending: { color: "gold", icon: <ClockCircleOutlined />, label: "Đang chờ" },
        cancel_requested: { color: "orange", icon: <ClockCircleOutlined />, label: "Yêu cầu hủy" } as any,
        confirmed: { color: "blue", icon: <CheckCircleOutlined />, label: "Đã xác nhận" },
        completed: { color: "green", icon: <CheckSquareOutlined />, label: "Đã hoàn thành" },
        cancelled: { color: "red", icon: <CloseCircleOutlined />, label: "Đã hủy" },
        in_treatment: { color: "purple", icon: <MedicineBoxOutlined />, label: "Đang điều trị" } as any,
    } as any;
    const [updateAppointment, { isLoading }] = useUpdateAppointmentMutation();
    const [doctorCancelAppointment, { isLoading: isCancelling }] = useDoctorCancelAppointmentMutation();

    const handleConfirm = async () => {
        if (!appointment) return;
        try {
            await updateAppointment({ id: appointment.id, data: { status: "confirmed" } }).unwrap();
            toast.success("Lịch hẹn đã được xác nhận");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Xác nhận thất bại");
        }
    };
    const handleCancel = async () => {
        if (!appointment) return;
        try {
            await doctorCancelAppointment({
                id: appointment.id,
                reason: "Bác sĩ hủy lịch hẹn"
            }).unwrap();
            toast.success("Lịch hẹn đã được hủy và đã gửi email thông báo cho bệnh nhân");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Hủy lịch hẹn thất bại");
        }
    };
    return (
        <Drawer
            title={
                appointment
                    ? `Chi tiết lịch hẹn #${appointment.id}`
                    : "Chi tiết lịch hẹn"
            }
            open={open}
            onClose={onClose}
            width={600}
        >
            {appointment && (
                <>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                        <RescheduleButton appointment={appointment} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <Tag
                            color={statusConfig[appointment.status].color}
                            icon={statusConfig[appointment.status].icon}
                        >
                            {statusConfig[appointment.status].label}
                        </Tag>
                    </div>
                    <Divider orientation="left">👤 Thông tin bệnh nhân</Divider>
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Họ tên">
                            {appointment.patient_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {new Date(appointment.patient_dob).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {appointment.patient_gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="SĐT">
                            <PhoneOutlined /> {appointment.patient_phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            <MailOutlined /> {appointment.patient_email ?? "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            <HomeOutlined /> {appointment.patient_address}
                        </Descriptions.Item>
                    </Descriptions>
                    <Divider orientation="left">📅 Thông tin lịch hẹn</Divider>
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Ngày hẹn">
                            <CalendarOutlined />{" "}
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khung giờ">
                            {appointment.time_slot}
                        </Descriptions.Item>
                        <Descriptions.Item label="Lý do khám">
                            {appointment.reason ?? "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khoa">
                            <MedicineBoxOutlined /> {appointment.Department?.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ">
                            {appointment.Doctor?.full_name} (
                            {appointment.Doctor?.email ?? "—"})
                        </Descriptions.Item>

                        {(appointment.status === "cancelled" || appointment.status === "cancel_requested") && (
                            <Descriptions.Item label="Lý do hủy">
                                {appointment.cancel_reason ?? "—"}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                    {appointment.status === "pending" && (
                        <div style={{ marginTop: 24, textAlign: "right" }}>
                            <Button type="primary" loading={isLoading} onClick={handleConfirm} style={{ marginRight: 8 }}>
                                Xác nhận lịch hẹn
                            </Button>
                            <Button danger loading={isCancelling} onClick={handleCancel}>
                                Hủy lịch hẹn
                            </Button>
                        </div>
                    )}
                    {appointment.status === "confirmed" && (
                        <div style={{ marginTop: 24, textAlign: "right" }}>
                            <Button danger loading={isCancelling} onClick={handleCancel}>
                                Hủy lịch hẹn
                            </Button>
                        </div>
                    )}
                    {appointment.status === "cancel_requested" && (
                        <div style={{ marginTop: 24, textAlign: "right" }}>
                            <Button type="primary" loading={isCancelling} onClick={handleCancel}>
                                Xác nhận hủy lịch
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Drawer>
    );
}

function RescheduleButton({ appointment }: { appointment: any }) {
    const [open, setOpen] = React.useState(false);

    if (!(appointment.status === "pending" || appointment.status === "confirmed")) {
        return null;
    }

    return (
        <>
            <Button type="primary" onClick={() => setOpen(true)}>Sửa giờ hẹn</Button>
            <RescheduleAppointmentModal
                open={open}
                onClose={() => setOpen(false)}
                appointment={appointment}
            />
        </>
    );
}
