"use client";

import { useState } from "react";
import { Card, Col, Row, Button, Tag, Spin, Empty, Space, Typography } from "antd";
import { useGetAppointmentsByStatusQuery } from "@/api/app_apointment/apiAppointment";
import AppointmentDetail from "./AppointmentDetail";
import { ClockCircleOutlined, EyeOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function PendingAppointments() {
    const { data, isLoading } = useGetAppointmentsByStatusQuery({ status: "pending" });
    const appointments = data?.data ?? [];
    const [selected, setSelected] = useState<any | null>(null);
    const [open, setOpen] = useState(false);

    if (isLoading) return <Spin />;
    if (!appointments.length) return <Empty description="Không có lịch hẹn đang chờ" />;

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
                            extra={<Tag color="gold" icon={<ClockCircleOutlined />}>Đang chờ</Tag>}
                        >
                            <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                <Text><CalendarOutlined /> {item.appointment_date} • {item.time_slot}</Text>
                                <Text>Bác sĩ: {item.Doctor.full_name}</Text>
                                <Text>{item.Department.name}</Text>
                            </Space>
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                style={{ marginTop: 12 }}
                                onClick={() => { setSelected(item); setOpen(true); }}
                            >
                                Xem chi tiết
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>
            <AppointmentDetail open={open} onClose={() => setOpen(false)} appointment={selected} />
        </>
    );
}
