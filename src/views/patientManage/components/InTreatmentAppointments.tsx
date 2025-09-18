"use client";

import { useState } from "react";
import { Card, Col, Row, Button, Tag, Spin, Empty, Space, Typography, Modal, Descriptions, Divider, Table } from "antd";
import { useGetAppointmentsByStatusQuery } from "@/api/app_apointment/apiAppointment";
import AppointmentDetail from "./AppointmentDetail";
import { MedicineBoxOutlined, EyeOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";
import InvoiceModal from "./InvoiceModal";
import { useGetMedicalRecordsQuery } from "@/api/app_medical_record/apiMedicalRecord";

const { Text } = Typography;

export default function InTreatmentAppointments() {
    const { data, isLoading } = useGetAppointmentsByStatusQuery({ status: "in_treatment" });
    const appointments = data?.data ?? [];
    const [selected, setSelected] = useState<any | null>(null);
    const [open, setOpen] = useState(false);
    const [openInvoice, setOpenInvoice] = useState(false);
    const [openMedicalRecord, setOpenMedicalRecord] = useState(false);

    if (isLoading) return <Spin />;
    if (!appointments.length) return <Empty description="Không có bệnh nhân đang điều trị" />;

    return (
        <>
            <Row gutter={[16, 16]}>
                {appointments.map((item: any) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                        <Card
                            hoverable
                            extra={<div style={{ display: "flex", alignItems: "center" }}>
                                <Tag color="purple" icon={<MedicineBoxOutlined />}>Đang điều trị</Tag>
                                <Button
                                    icon={<FileTextOutlined />}
                                    size="small"
                                    style={{ marginLeft: 8 }}
                                    onClick={() => { setSelected(item); setOpenInvoice(true); }}
                                >
                                    Hóa đơn
                                </Button>
                                <Button
                                    size="small"
                                    style={{ marginLeft: 8 }}
                                    onClick={() => { setSelected(item); setOpenMedicalRecord(true); }}
                                >
                                    Hồ sơ bệnh án
                                </Button>
                            </div>
                            }
                        >
                            <Space direction="vertical" size={6} style={{ width: "100%" }}>
                                <Text strong><UserOutlined />
                                    {item.patient_name}</Text>
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
                        </Card>
                    </Col>
                ))}
            </Row>
            <AppointmentDetail open={open} onClose={() => setOpen(false)} appointment={selected} />
            <InvoiceModal open={openInvoice} onClose={() => setOpenInvoice(false)} appointment={selected} />
            <MedicalRecordModal open={openMedicalRecord} onClose={() => setOpenMedicalRecord(false)} appointment={selected} />
        </>
    );
}



function MedicalRecordModal({ open, onClose, appointment }: { open: boolean; onClose: () => void; appointment: any | null; }) {
    const appointmentId = appointment?.id;
    const { data, isLoading } = useGetMedicalRecordsQuery(
        { appointment_id: appointmentId ?? undefined, page: 1, limit: 1 },
        { skip: !appointmentId }
    );

    const record = Array.isArray(data?.data) ? data?.data[0] : undefined;

    const medicationColumns = [
        { title: "Thuốc", dataIndex: ["medicine", "name"], key: "medicine" },
        { title: "Đơn vị", dataIndex: ["medicine", "unit"], key: "unit" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Liều lượng", dataIndex: "dosage", key: "dosage" },
        { title: "Hướng dẫn", dataIndex: "instructions", key: "instructions" },
    ];

    const serviceColumns = [
        { title: "Dịch vụ", dataIndex: ["package", "name"], key: "package" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    ];

    return (
        <Modal
            title="Hồ sơ bệnh án"
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            destroyOnHidden
        >
            <Spin spinning={isLoading}>
                {!record && !isLoading ? (
                    <Empty description="Chưa có hồ sơ bệnh án cho lịch hẹn này" />
                ) : (
                    <>
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Bệnh nhân" span={2}>{appointment?.patient_name}</Descriptions.Item>
                            <Descriptions.Item label="Triệu chứng" span={2}>{record?.symptoms || "—"}</Descriptions.Item>
                            <Descriptions.Item label="Chẩn đoán" span={2}>{record?.diagnosis || "—"}</Descriptions.Item>
                            <Descriptions.Item label="Ghi chú" span={2}>{record?.notes || "—"}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Đơn thuốc</Divider>
                        <Table
                            dataSource={record?.medications || []}
                            columns={medicationColumns}
                            rowKey={(r: any) => `med-${r.id}-${r.medicine_id}`}
                            pagination={false}
                            size="small"
                        />

                        <Divider orientation="left">Dịch vụ y tế</Divider>
                        <Table
                            dataSource={record?.services || []}
                            columns={serviceColumns}
                            rowKey={(r: any) => `svc-${r.id}-${r.package_id}`}
                            pagination={false}
                            size="small"
                        />
                    </>
                )}
            </Spin>
        </Modal>
    );
}

