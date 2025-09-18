"use client";

import { useState } from "react";
import { Card, Col, Row, Button, Tag, Spin, Empty, Space, Typography } from "antd";
import { useGetAppointmentsByStatusQuery } from "@/api/app_apointment/apiAppointment";
import AppointmentDetail from "./AppointmentDetail";
import { CheckCircleOutlined, EyeOutlined, UserOutlined, CalendarOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useStartTreatmentMutation } from "@/api/app_apointment/apiAppointment";
import { useCreateInvoiceMutation } from "@/api/app_invoice/apiInvoice";
import { useCreateMedicalRecordMutation } from "@/api/app_medical_record/apiMedicalRecord";
import toast from "react-hot-toast";

const { Text } = Typography;

export default function ConfirmedAppointments() {
    const { data, isLoading } = useGetAppointmentsByStatusQuery({ status: "confirmed" });
    const appointments = data?.data ?? [];
    const [selected, setSelected] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [startTreatment, { isLoading: isStarting }] = useStartTreatmentMutation();
    const [createInvoice] = useCreateInvoiceMutation();
    const [createMedicalRecord] = useCreateMedicalRecordMutation();

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
                                loading={isStarting}
                                style={{ marginTop: 8, marginLeft: 8 }}
                                onClick={async () => {
                                    try {
                                        // Bắt đầu điều trị
                                        await startTreatment({ id: item.id }).unwrap();
                                        try {
                                            await createMedicalRecord({
                                                appointment_id: item.id,
                                                symptoms: "",
                                                diagnosis: "",
                                                notes: "",
                                                medications: [],
                                                services: []
                                            }).unwrap();
                                        } catch (medicalRecordErr: any) {
                                            console.error("Error creating medical record:", medicalRecordErr);
                                            // Không dừng quá trình nếu tạo medical record thất bại
                                        }

                                        // Tạo hóa đơn
                                        try {
                                            await createInvoice({
                                                appointment_id: item.id,
                                                patient_id: item.patient_id
                                            }).unwrap();
                                        } catch (invoiceErr: any) {
                                            console.error("Error creating invoice:", invoiceErr);
                                            // Không dừng quá trình nếu tạo invoice thất bại
                                        }

                                        toast.success("Đã bắt đầu điều trị và tạo hồ sơ bệnh án");
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
