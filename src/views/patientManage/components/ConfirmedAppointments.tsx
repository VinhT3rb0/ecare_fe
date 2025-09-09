"use client";

import { useState } from "react";
import { Card, Col, Row, Button, Tag, Spin, Empty, Space, Typography } from "antd";
import { useGetAppointmentsByStatusQuery } from "@/api/app_apointment/apiAppointment";
import AppointmentDetail from "./AppointmentDetail";
import { CheckCircleOutlined, EyeOutlined, UserOutlined, CalendarOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useUpdateAppointmentMutation } from "@/api/app_apointment/apiAppointment";
import { useCreateInvoiceMutation } from "@/api/app_invoice/apiInvoice";
import toast from "react-hot-toast";

const { Text } = Typography;

export default function ConfirmedAppointments() {
    const { data, isLoading } = useGetAppointmentsByStatusQuery({ status: "confirmed" });
    const appointments = data?.data ?? [];
    const [selected, setSelected] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation();
    const [createInvoice] = useCreateInvoiceMutation();

    if (isLoading) return <Spin />;
    if (!appointments.length) return <Empty description="Không có lịch hẹn đã xác nhận" />;

    return (
        <>
            <Row gutter={[16, 16]}>
                {appointments.map((item: any) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                        <Card
                            hoverable
                            title={
                                <Space>
                                    <UserOutlined />
                                    <Text strong>{item.patient_name}</Text>
                                </Space>
                            }
                            extra={<Tag color="blue" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>}
                        >
                            <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                <Text><CalendarOutlined /> {item.appointment_date} • {item.time_slot}</Text>
                                <Text>Bác sĩ: {item.Doctor.full_name}</Text>
                                <Text>{item.Department.name}</Text>
                            </Space>
                            <Button
                                type="default"
                                icon={<EyeOutlined />}
                                style={{ marginTop: 12 }}
                                onClick={() => { setSelected(item); setOpen(true); }}
                            >
                                Xem chi tiết
                            </Button>
                            <Button
                                type="primary"
                                danger={false}
                                icon={<PlayCircleOutlined />}
                                loading={isUpdating}
                                style={{ marginTop: 8, marginLeft: 8 }}
                                onClick={async () => {
                                    try {
                                        await updateAppointment({ id: item.id, data: { status: "in_treatment" } }).unwrap();
                                        try {
                                            await createInvoice({ appointment_id: item.id, patient_id: item.patient_id }).unwrap();
                                        } catch { }
                                        toast.success("Đã bắt đầu điều trị");
                                    } catch (err: any) {
                                        toast.error(err?.data?.message || "Không thể bắt đầu điều trị");
                                    }
                                }}
                            >
                                Bắt đầu điều trị
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>
            <AppointmentDetail open={open} onClose={() => setOpen(false)} appointment={selected} />
        </>
    );
}
