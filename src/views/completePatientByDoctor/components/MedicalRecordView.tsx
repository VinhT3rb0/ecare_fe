"use client";

import React, { useMemo } from "react";
import { Modal, Descriptions, Table, Spin, Divider, Typography, Card } from "antd";
import {
    FileTextOutlined,
    MedicineBoxOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import {
    useGetMedicalRecordByIdQuery,
    useGetMedicalRecordsQuery,
} from "@/api/app_medical_record/apiMedicalRecord";
import { useGetMedicinesQuery } from "@/api/app_medicine/apiMedicine";
import { useGetPackagesQuery } from "@/api/app_package/apiPackage";

interface MedicalRecordViewProps {
    open: boolean;
    onClose: () => void;
    appointmentId: number;
    medicalRecordId?: number;
}

interface MedicalRecord {
    id: number;
    appointment_id: number;
    symptoms: string;
    diagnosis: string;
    notes: string;
    created_at?: string;
    Appointment?: {
        patient_name?: string;
        patient_dob?: string;
        patient_phone?: string;
        patient_email?: string;
        patient_gender?: string;
        patient_address?: string;
        Doctor?: { full_name?: string };
        Department?: { name?: string };
        appointment_date?: string;
        time_slot?: string;
    };
    medications?: MedicationRow[];
    services?: ServiceRow[];
}

interface MedicationRow {
    id: number;
    medical_record_id?: number;
    medicine_id?: number;
    quantity?: number;
    dosage?: string;
    instructions?: string | null;
    medicine?: {
        id?: number;
        name?: string;
        unit?: string;
        price?: string;
        description?: string;
    };
}

interface ServiceRow {
    id: number;
    medical_record_id?: number;
    package_id?: number;
    quantity?: number;
    notes?: string | null;
    package?: {
        id?: number;
        name?: string;
        price?: string;
        description?: string;
    };
}

const MedicalRecordView: React.FC<MedicalRecordViewProps> = ({
    open,
    onClose,
    appointmentId,
    medicalRecordId,
}) => {
    // 1) Get list by appointment (may return array) to resolve id if not provided
    const { data: recordsByAppointment, isLoading: loadingByAppointment } =
        useGetMedicalRecordsQuery({ appointment_id: appointmentId }, { skip: !appointmentId });

    // choose resolved id: provided medicalRecordId > first element from list > undefined
    const resolvedMedicalRecordId = useMemo<number | undefined>(() => {
        if (medicalRecordId) return medicalRecordId;
        const data = recordsByAppointment?.data;
        if (Array.isArray(data) && data.length > 0) {
            // If the list contains objects, try to pick the first object's id
            const first = data[0];
            if (first && typeof first === "object" && "id" in first) {
                // @ts-ignore - we checked shape at runtime
                return Number(first.id);
            }
        }
        return undefined;
    }, [medicalRecordId, recordsByAppointment]);

    // 2) Get detail by id (this returns either object or array depending on your API)
    const { data: medicalRecord, isLoading: loadingRecord } = useGetMedicalRecordByIdQuery(
        resolvedMedicalRecordId || 0,
        { skip: !resolvedMedicalRecordId }
    );

    const { data: medicinesData } = useGetMedicinesQuery();
    const { data: packagesData } = useGetPackagesQuery();

    // 3) Normalize medicalRecord?.data => single MedicalRecord | undefined
    const record = useMemo<MedicalRecord | undefined>(() => {
        const d = medicalRecord?.data;
        if (!d) return undefined;
        if (Array.isArray(d)) {
            // if array, use first element (or undefined)
            const first = d[0];
            if (!first) return undefined;
            return first as MedicalRecord;
        }
        // assume object
        return d as MedicalRecord;
    }, [medicalRecord]);

    // columns for medications and services (use nested dataIndex to read medicine/package)
    const medicineColumns = [
        {
            title: "Tên thuốc",
            dataIndex: ["medicine", "name"],
            key: "medicine_name",
            render: (_: any, row: MedicationRow) =>
                row.medicine?.name ?? medicinesData?.data?.find((m: any) => m.id === row.medicine_id)?.name ??
                "Không tìm thấy",
        },
        {
            title: "Đơn vị",
            dataIndex: ["medicine", "unit"],
            key: "medicine_unit",
            render: (_: any, row: MedicationRow) =>
                row.medicine?.unit ?? medicinesData?.data?.find((m: any) => m.id === row.medicine_id)?.unit ??
                "-",
        },
        { title: "Liều lượng", dataIndex: "dosage", key: "dosage" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
        { title: "Hướng dẫn", dataIndex: "instructions", key: "instructions" },
    ];

    const serviceColumns = [
        {
            title: "Tên dịch vụ",
            dataIndex: ["package", "name"],
            key: "package_name",
            render: (_: any, row: ServiceRow) =>
                row.package?.name ?? packagesData?.data?.find((p: any) => p.id === row.package_id)?.name ??
                "Không tìm thấy",
        },
        { title: "Số lượng", dataIndex: "quantity", key: "svc_quantity" },
        {
            title: "Mô tả",
            dataIndex: ["package", "description"],
            key: "package_description",
            render: (_: any, row: ServiceRow) =>
                row.package?.description ??
                packagesData?.data?.find((p: any) => p.id === row.package_id)?.description ??
                "-",
        },
    ];

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileTextOutlined style={{ color: "#0b6e64" }} />
                    <span style={{ color: "#0b6e64", fontWeight: 600 }}>Hồ sơ bệnh án</span>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={900}
            footer={null}
        >
            <Spin spinning={loadingRecord || loadingByAppointment}>
                {record ? (
                    <>
                        <Descriptions bordered column={1} style={{ marginBottom: 12 }}>
                            <Descriptions.Item label="Bệnh nhân">
                                {record.Appointment?.patient_name ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Triệu chứng">
                                {record.symptoms ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chẩn đoán">
                                {record.diagnosis ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú">
                                {record.notes ?? "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {record.created_at ? new Date(record.created_at).toLocaleString() : "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">
                            <MedicineBoxOutlined style={{ marginRight: 8 }} /> Thuốc đã kê
                        </Divider>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Table<MedicationRow>
                                dataSource={record.medications ?? []}
                                rowKey={(m) => String(m.id)}
                                columns={medicineColumns}
                                pagination={false}
                                size="small"
                            />
                        </Card>

                        <Divider orientation="left">
                            <ShoppingCartOutlined style={{ marginRight: 8 }} /> Dịch vụ y tế
                        </Divider>
                        <Card size="small">
                            <Table<ServiceRow>
                                dataSource={record.services ?? []}
                                rowKey={(s) => String(s.id)}
                                columns={serviceColumns}
                                pagination={false}
                                size="small"
                            />
                        </Card>
                    </>
                ) : (
                    <Typography.Text>Không có hồ sơ bệnh án.</Typography.Text>
                )}
            </Spin>
        </Modal>
    );
};

export default MedicalRecordView;
