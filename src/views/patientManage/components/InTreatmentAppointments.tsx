"use client";

import { useState } from "react";
import { Card, Col, Row, Button, Tag, Spin, Empty, Space, Typography } from "antd";
import { useGetAppointmentsByStatusQuery } from "@/api/app_apointment/apiAppointment";
import AppointmentDetail from "./AppointmentDetail";
import { MedicineBoxOutlined, EyeOutlined, UserOutlined, CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import AddTreatmentServiceModal from "./AddTreatmentServiceModal";

const { Text } = Typography;

export default function InTreatmentAppointments() {
    const { data, isLoading } = useGetAppointmentsByStatusQuery({ status: "in_treatment" });
    const appointments = data?.data ?? [];
    const [selected, setSelected] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);

    if (isLoading) return <Spin />;
    if (!appointments.length) return <Empty description="Không có bệnh nhân đang điều trị" />;

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
                            extra={<Tag color="purple" icon={<MedicineBoxOutlined />}>Đang điều trị</Tag>}
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
                                icon={<PlusOutlined />}
                                style={{ marginTop: 8, marginLeft: 8 }}
                                onClick={() => { setSelected(item); setOpenAdd(true); }}
                            >
                                Thêm DV điều trị
                            </Button>
                        </Card>
                    </Col>
                ))}
            </Row>
            <AppointmentDetail open={open} onClose={() => setOpen(false)} appointment={selected} />
            <AddTreatmentServiceModal open={openAdd} onClose={() => setOpenAdd(false)} appointment={selected} />
        </>
    );
}


