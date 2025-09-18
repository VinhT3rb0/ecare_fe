"use client";

import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Select,
    Table,
    Space,
    Divider,
    Typography,
    Card,
    Row,
    Col,
    Spin,
} from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
    MedicineBoxOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import {
    useGetMedicalRecordByIdQuery,
    useUpdateMedicalRecordMutation,
    useGetMedicalRecordsQuery,
} from "@/api/app_medical_record/apiMedicalRecord";
import { useGetMedicinesQuery } from "@/api/app_medicine/apiMedicine";
import { useGetPackagesQuery } from "@/api/app_package/apiPackage";
import MedicationForm from "./MedicationForm";
import ServiceForm from "./ServiceForm";
import toast from "react-hot-toast";

const { TextArea } = Input;

interface MedicalRecordFormProps {
    open: boolean;
    onClose: () => void;
    appointmentId: number;
    medicalRecordId?: number;
    onSuccess?: () => void;
}

interface Medication {
    medicine_id: number;
    quantity: number;
    dosage: string;
    instructions: string;
}

interface Service {
    package_id: number;
    quantity: number;
    notes: string;
}

const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
    open,
    onClose,
    appointmentId,
    medicalRecordId,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [medications, setMedications] = useState<Medication[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [medicationModalOpen, setMedicationModalOpen] = useState(false);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | undefined>();
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | undefined>();

    const { data: recordsByAppointment, isLoading: loadingByAppointment } = useGetMedicalRecordsQuery(
        { appointment_id: appointmentId },
        { skip: !appointmentId }
    );
    console.log(recordsByAppointment);

    const resolvedMedicalRecordId = React.useMemo(() => {
        if (medicalRecordId) return medicalRecordId;
        const data = recordsByAppointment?.data;
        if (Array.isArray(data) && data.length > 0) return data[0].id;
        return undefined;
    }, [medicalRecordId, recordsByAppointment]);

    const { data: medicalRecord, isLoading: loadingRecord } = useGetMedicalRecordByIdQuery(
        resolvedMedicalRecordId || 0,
        { skip: !resolvedMedicalRecordId }
    );
    const { data: medicinesData } = useGetMedicinesQuery();
    const { data: packagesData } = useGetPackagesQuery();
    const [updateMedicalRecord, { isLoading: isUpdating }] = useUpdateMedicalRecordMutation();

    // Load existing data
    useEffect(() => {
        if (medicalRecord?.data && !Array.isArray(medicalRecord.data)) {
            const record = medicalRecord.data;
            form.setFieldsValue({
                symptoms: record.symptoms,
                diagnosis: record.diagnosis,
                notes: record.notes,
            });
            setMedications(record.medications || []);
            setServices(record.services || []);
            setIsEditing(true);
        } else {
            form.resetFields();
            setMedications([]);
            setServices([]);
            setIsEditing(false);
        }
    }, [medicalRecord, form]);

    // Medicine columns
    const medicineColumns = [
        {
            title: "Thuốc",
            dataIndex: "medicine_id",
            key: "medicine_id",
            render: (medicineId: number) => {
                const medicine = medicinesData?.data?.find((m: any) => m.id === medicineId);
                return medicine ? medicine.name : "Không tìm thấy";
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Liều lượng",
            dataIndex: "dosage",
            key: "dosage",
        },
        {
            title: "Hướng dẫn",
            dataIndex: "instructions",
            key: "instructions",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any, index: number) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => handleEditMedication(index)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            const newMedications = medications.filter((_, i) => i !== index);
                            setMedications(newMedications);
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    // Service columns
    const serviceColumns = [
        {
            title: "Dịch vụ",
            dataIndex: "package_id",
            key: "package_id",
            render: (packageId: number) => {
                const service = packagesData?.data?.find((p: any) => p.id === packageId);
                return service ? service.name : "Không tìm thấy";
            },
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Kết quả",
            dataIndex: "notes",
            key: "notes",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any, index: number) => (
                <Space>
                    <Button
                        type="link"
                        onClick={() => handleEditService(index)}
                    >
                        Sửa
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            const newServices = services.filter((_, i) => i !== index);
                            setServices(newServices);
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    const handleAddMedication = () => {
        setEditingMedicationIndex(undefined);
        setMedicationModalOpen(true);
    };

    const handleAddService = () => {
        setEditingServiceIndex(undefined);
        setServiceModalOpen(true);
    };

    const handleSaveMedication = (medication: any) => {
        if (editingMedicationIndex !== undefined) {
            const newMedications = [...medications];
            newMedications[editingMedicationIndex] = medication;
            setMedications(newMedications);
        } else {
            setMedications([...medications, medication]);
        }
    };

    const handleSaveService = (service: any) => {
        if (editingServiceIndex !== undefined) {
            const newServices = [...services];
            newServices[editingServiceIndex] = service;
            setServices(newServices);
        } else {
            setServices([...services, service]);
        }
    };

    const handleEditMedication = (index: number) => {
        setEditingMedicationIndex(index);
        setMedicationModalOpen(true);
    };

    const handleEditService = (index: number) => {
        setEditingServiceIndex(index);
        setServiceModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...values,
                medications: medications.filter(m => m.medicine_id > 0),
                services: services.filter(s => s.package_id > 0),
            };

            if (!resolvedMedicalRecordId) {
                toast.error("Không tìm thấy hồ sơ bệnh án để cập nhật.");
                return;
            }

            await updateMedicalRecord({
                id: resolvedMedicalRecordId,
                data,
            }).unwrap();
            toast.success("Cập nhật hồ sơ bệnh án thành công!");

            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Có lỗi xảy ra!");
        }
    };

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileTextOutlined style={{ color: "#0b6e64" }} />
                    <span style={{ color: "#0b6e64", fontWeight: 600 }}>
                        {isEditing ? "Cập nhật hồ sơ bệnh án" : "Tạo hồ sơ bệnh án"}
                    </span>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={1000}
            footer={null}
        >
            <Spin spinning={loadingRecord || loadingByAppointment}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        symptoms: "",
                        diagnosis: "",
                        notes: "",
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Triệu chứng"
                                name="symptoms"
                                rules={[{ required: true, message: "Vui lòng nhập triệu chứng" }]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Mô tả triệu chứng của bệnh nhân..."
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Chẩn đoán"
                                name="diagnosis"
                                rules={[{ required: true, message: "Vui lòng nhập chẩn đoán" }]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Chẩn đoán bệnh..."
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Ghi chú thêm"
                        name="notes"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Ghi chú thêm về tình trạng bệnh nhân..."
                        />
                    </Form.Item>

                    <Divider orientation="left">
                        <MedicineBoxOutlined style={{ marginRight: 8 }} />
                        Kê đơn thuốc
                    </Divider>

                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Space style={{ marginBottom: 16 }}>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddMedication}
                            >
                                Thêm thuốc
                            </Button>
                        </Space>

                        <Table
                            dataSource={medications}
                            columns={medicineColumns}
                            pagination={false}
                            size="small"
                            rowKey={(record) => `medication-${record.medicine_id}`}
                        />
                    </Card>

                    <Divider orientation="left">
                        <ShoppingCartOutlined style={{ marginRight: 8 }} />
                        Đề xuất dịch vụ y tế
                    </Divider>

                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Space style={{ marginBottom: 16 }}>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddService}
                            >
                                Thêm dịch vụ
                            </Button>
                        </Space>

                        <Table
                            dataSource={services}
                            columns={serviceColumns}
                            pagination={false}
                            size="small"
                            rowKey={(record) => `service-${record.package_id}`}
                        />
                    </Card>

                    <div style={{ textAlign: "right", marginTop: 24 }}>
                        <Space>
                            <Button onClick={onClose}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isUpdating}
                                disabled={!resolvedMedicalRecordId}
                                icon={<FileTextOutlined />}
                            >
                                Cập nhật hồ sơ bệnh án
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Spin>

            {/* Medication Modal */}
            <MedicationForm
                open={medicationModalOpen}
                onClose={() => {
                    setMedicationModalOpen(false);
                    setEditingMedicationIndex(undefined);
                }}
                onSave={handleSaveMedication}
                medicines={medicinesData?.data || []}
                initialData={editingMedicationIndex !== undefined ? medications[editingMedicationIndex] : undefined}
                index={editingMedicationIndex}
            />

            {/* Service Modal */}
            <ServiceForm
                open={serviceModalOpen}
                onClose={() => {
                    setServiceModalOpen(false);
                    setEditingServiceIndex(undefined);
                }}
                onSave={handleSaveService}
                packages={packagesData?.data || []}
                initialData={editingServiceIndex !== undefined ? services[editingServiceIndex] : undefined}
                index={editingServiceIndex}
            />
        </Modal>
    );
};

export default MedicalRecordForm;
