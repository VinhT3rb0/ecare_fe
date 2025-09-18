"use client";

import React from "react";
import { Button, Descriptions, Divider, Popconfirm, Space, Spin, Tag } from "antd";
import dayjs from "dayjs";
import {
    useApproveCancelAppointmentMutation,
    useRejectCancelAppointmentMutation,
    useStartTreatmentMutation,
} from "@/api/app_apointment/apiAppointment";
import toast from "react-hot-toast";
import { useCreateMedicalRecordMutation } from "@/api/app_medical_record/apiMedicalRecord";
import { useCreateInvoiceMutation } from "@/api/app_invoice/apiInvoice";
import { PlayCircleOutlined } from "@ant-design/icons";
interface AppointmentDetailProps {
    loading: boolean;
    detailData: any;
    onClose: () => void;
    onUpdateStatus: (id: number, status: string) => Promise<void>;
    onStartTreatment?: (id: number) => Promise<void>;
    refetch: () => void;
    statusColors: Record<string, string>;
    statusTexts: Record<string, string>;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
    loading,
    detailData,
    onClose,
    onUpdateStatus,
    refetch,
    statusColors,
    statusTexts,
}) => {
    const [createMedicalRecord] = useCreateMedicalRecordMutation();
    const [createInvoice] = useCreateInvoiceMutation();

    const [approveCancel] = useApproveCancelAppointmentMutation();
    const [rejectCancel] = useRejectCancelAppointmentMutation();
    const [startTreatment, { isLoading: isStarting }] = useStartTreatmentMutation();

    if (loading) return <Spin />;
    if (!detailData) return null;

    return (
        <>
            <Descriptions column={1} bordered size="small" style={{ fontWeight: 600 }}>
                <Descriptions.Item label="Bệnh nhân">{detailData.data?.patient_name}</Descriptions.Item>
                <Descriptions.Item label="Điện thoại">{detailData.data?.patient_phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{detailData.data?.patient_email || "-"}</Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                    {detailData.data?.patient_gender === "male"
                        ? "Nam"
                        : detailData.data?.patient_gender === "female"
                            ? "Nữ"
                            : "Khác"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{detailData.data?.patient_address || "-"}</Descriptions.Item>
                <Descriptions.Item label="Ngày khám">
                    {dayjs(detailData.data?.appointment_date).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Khung giờ">{detailData.data?.time_slot}</Descriptions.Item>
                <Descriptions.Item label="Lý do khám">{detailData.data?.reason || "-"}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={statusColors[detailData.data?.status]}>
                        {statusTexts[detailData.data?.status] || detailData.data?.status?.toUpperCase?.()}
                    </Tag>
                </Descriptions.Item>
                {detailData.data?.cancel_reason && (
                    <Descriptions.Item label="Lý do hủy">{detailData.data.cancel_reason}</Descriptions.Item>
                )}
            </Descriptions>

            <Divider />

            {/* Action buttons */}
            {detailData.data?.status === "pending" && (
                <Space>
                    <Button type="primary" onClick={() => onUpdateStatus(detailData.data.id, "confirmed")}>
                        Xác nhận
                    </Button>
                    <Button danger onClick={() => onUpdateStatus(detailData.data.id, "cancelled")}>
                        Hủy
                    </Button>
                </Space>
            )}
            {detailData.data?.status === "in_treatment" && (
                <Button type="primary" onClick={() => onUpdateStatus(detailData.data.id, "completed")}>
                    Hoàn thành
                </Button>
            )}
            {detailData.data?.status === "confirmed" && (
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    loading={isStarting}
                    onClick={async () => {
                        try {
                            // Bắt đầu điều trị
                            await startTreatment({ id: detailData.data.id }).unwrap();

                            // Tạo hồ sơ bệnh án mặc định
                            try {
                                await createMedicalRecord({
                                    appointment_id: detailData.data.id,
                                    symptoms: "",
                                    diagnosis: "",
                                    notes: "",
                                    medications: [],
                                    services: []
                                }).unwrap();
                            } catch (err) {
                                console.error("Error creating medical record:", err);
                            }

                            // Tạo hóa đơn
                            try {
                                await createInvoice({
                                    appointment_id: detailData.data.id,
                                    patient_id: detailData.data.patient_id
                                }).unwrap();
                            } catch (err) {
                                console.error("Error creating invoice:", err);
                            }

                            toast.success("Đã bắt đầu điều trị và tạo hồ sơ bệnh án");
                            refetch(); // refresh danh sách
                            onClose();
                        } catch (err: any) {
                            toast.error(err?.data?.message || "Không thể bắt đầu điều trị");
                        }
                    }}
                >
                    Bắt đầu điều trị
                </Button>
            )}
            {detailData.data?.status === "cancel_requested" && (
                <Space>
                    <Popconfirm
                        title="Xác nhận hủy lịch?"
                        onConfirm={async () => {
                            try {
                                await approveCancel({ id: detailData.data.id }).unwrap();
                                toast.success("Đã hủy lịch.");
                                refetch();
                                onClose();
                            } catch {
                                toast.error("Thao tác thất bại");
                            }
                        }}
                    >
                        <Button danger>Xác nhận hủy</Button>
                    </Popconfirm>
                    <Popconfirm
                        title="Từ chối yêu cầu hủy?"
                        onConfirm={async () => {
                            try {
                                await rejectCancel({ id: detailData.data.id }).unwrap();
                                toast.success("Đã từ chối yêu cầu.");
                                refetch();
                                onClose();
                            } catch {
                                toast.error("Thao tác thất bại");
                            }
                        }}
                    >
                        <Button>Từ chối</Button>
                    </Popconfirm>
                </Space>
            )}
        </>
    );
};

export default AppointmentDetail;
