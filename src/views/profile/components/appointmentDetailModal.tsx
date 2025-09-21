"use client";

import React, { useState } from "react";
import { Modal, Descriptions, Spin, Tag, List, Divider, Card, Empty, Button } from "antd";
import { LoadingOutlined, MedicineBoxOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetMedicalRecordsQuery } from "@/api/app_medical_record/apiMedicalRecord";
import ReviewModal from "./reviewModal";

interface AppointmentDetailModalProps {
    open: boolean;
    onClose: () => void;
    appointment: any;
    statusColors: Record<string, string>;
    statusTexts: Record<string, string>;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
    open,
    onClose,
    appointment,
    statusColors,
    statusTexts,
}) => {
    const { data: medicalRecordData, isLoading } = useGetMedicalRecordsQuery(
        { appointment_id: appointment?.id },
        { skip: !appointment?.id }
    );
    const [reviewOpen, setReviewOpen] = useState(false);
    const medicalRecord = Array.isArray(medicalRecordData?.data)
        ? medicalRecordData?.data[0]
        : medicalRecordData?.data;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1100}
        >
            <div className="grid grid-cols-2 gap-6">
                {/* Thông tin bệnh nhân */}
                <Card title="Thông tin bệnh nhân" size="small" bordered className="shadow-md">
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label="Họ và tên">
                            {appointment?.patient_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">
                            {appointment?.patient_phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {appointment?.patient_email || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                            {appointment?.patient_gender === "male"
                                ? "Nam"
                                : appointment?.patient_gender === "female"
                                    ? "Nữ"
                                    : "Khác"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {appointment?.patient_address || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày khám">
                            {dayjs(appointment?.appointment_date).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khung giờ">
                            {appointment?.time_slot}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bác sĩ khám">
                            <div className="flex items-center gap-2">
                                {appointment?.Doctor?.full_name}
                                {appointment?.status === "completed" && (
                                    <Button
                                        size="small"
                                        style={{ background: "#11A998", borderColor: "#11A998", color: "white" }}
                                        onClick={() => setReviewOpen(true)}
                                    >
                                        Đánh giá
                                    </Button>
                                )}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Lý do khám">
                            {appointment?.reason || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={statusColors[appointment?.status]}>
                                {statusTexts[appointment?.status] ||
                                    appointment?.status?.toUpperCase?.()}
                            </Tag>
                        </Descriptions.Item>
                        {appointment?.cancel_reason && (
                            <Descriptions.Item label="Lý do hủy">
                                {appointment.cancel_reason}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                {/* Hồ sơ bệnh án */}
                <Card title="Hồ sơ bệnh án" size="small" bordered className="shadow-md">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <Spin indicator={<LoadingOutlined spin />} />
                        </div>
                    ) : (appointment?.status === "in_treatment" || appointment?.status === "completed") ? (
                        medicalRecord ? (
                            <>
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Triệu chứng">
                                        {medicalRecord.symptoms || "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chẩn đoán">
                                        {medicalRecord.diagnosis || "-"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ghi chú">
                                        {medicalRecord.notes || "-"}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider />

                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <MedicineBoxOutlined /> Thuốc
                                </h4>
                                {medicalRecord.medications?.length ? (
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={medicalRecord.medications}
                                        renderItem={(med: any) => (
                                            <List.Item>
                                                <span className="font-medium">{med.medicine?.name}</span> - {med.dosage} ({med.quantity} {med.medicine?.unit}) - {med.instructions}
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty description="Không có thuốc" />
                                )}

                                <Divider />

                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <FileTextOutlined /> Dịch vụ
                                </h4>
                                {medicalRecord.services?.length ? (
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={medicalRecord.services}
                                        renderItem={(srv: any) => (
                                            <List.Item>
                                                <span className="font-medium">{srv.package?.name}</span> - SL: {srv.quantity} - {srv.notes}
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty description="Không có dịch vụ" />
                                )}
                                <ReviewModal open={reviewOpen}
                                    onClose={() => setReviewOpen(false)}
                                    doctorId={appointment?.doctor_id}
                                    patientId={appointment?.patient_id} />
                            </>
                        ) : (
                            <Empty description="Chưa có hồ sơ bệnh án" />
                        )
                    ) : (
                        <p className="italic text-gray-400">
                            Hồ sơ bệnh án chỉ hiển thị khi lịch hẹn đang điều trị hoặc đã hoàn tất.
                        </p>
                    )}
                </Card>
            </div>
        </Modal>
    );
};

export default AppointmentDetailModal;
