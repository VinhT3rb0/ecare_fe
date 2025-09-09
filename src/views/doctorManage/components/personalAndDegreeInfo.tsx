// personalAndDegreeInfo.tsx
"use client";
import React from "react";
import { Descriptions, Table, Button, Tag, Space, Divider, Image } from "antd";
import toast from "react-hot-toast";
import { useApprovalDoctorMutation } from "@/api/app_doctor/apiDoctor";
interface PersonalAndDegreeInfoProps {
    doctor: any;
    onApprove?: () => void;
    onEdit?: () => void;
}

const PersonalAndDegreeInfo: React.FC<PersonalAndDegreeInfoProps> = ({ doctor, onEdit }) => {
    const [approveDoctor, { isLoading }] = useApprovalDoctorMutation();
    const isApproved = doctor.is_approved;
    const degreeData = isApproved ? doctor.Degrees?.[0] : doctor.pending_degree;
    const handleApprove = async () => {
        try {
            await approveDoctor({ doctor_id: doctor.id }).unwrap();
            toast.success("Phê duyệt bác sĩ thành công");
        } catch (err: any) {
            toast.error("Lỗi phê duyệt: " + (err?.data?.message || "Không xác định"));
        }
    };
    return (
        <>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Họ tên">{doctor.full_name}</Descriptions.Item>
                <Descriptions.Item label="Email">{doctor.email}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{doctor.phone}</Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    <Tag color={doctor.is_approved ? "green" : "red"}>
                        {doctor.is_approved ? "Đã phê duyệt" : "Chưa phê duyệt"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm">{doctor.experience_years} năm</Descriptions.Item>
                <Descriptions.Item label="Chuyên khoa">
                    {doctor.departments?.map((d: any) => d.name).join(", ")}
                </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Bằng cấp</Divider>
            {degreeData ? (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Ngày sinh">{degreeData.date_of_birth}</Descriptions.Item>
                    <Descriptions.Item label="CCCD">{degreeData.cccd}</Descriptions.Item>
                    <Descriptions.Item label="Ngày cấp">{degreeData.issue_date}</Descriptions.Item>
                    <Descriptions.Item label="Nơi cấp">{degreeData.issue_place}</Descriptions.Item>
                    <Descriptions.Item label="Chuyên ngành">{degreeData.specialization}</Descriptions.Item>
                    <Descriptions.Item label="Phạm vi hành nghề">{degreeData.practice_scope}</Descriptions.Item>
                    <Descriptions.Item label="Hình ảnh minh chứng">
                        <Image className="flex justify-center" src={degreeData.proof_image_url} alt="proof" style={{ maxWidth: 300 }} />
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <p>Không có thông tin bằng cấp.</p>
            )}

            <Space className="mt-4">
                {!isApproved ? (
                    <Button type="primary" loading={isLoading} onClick={handleApprove}>Phê duyệt</Button>
                ) : (
                    <></>
                )}
            </Space>
        </>
    );
};

export default PersonalAndDegreeInfo;
