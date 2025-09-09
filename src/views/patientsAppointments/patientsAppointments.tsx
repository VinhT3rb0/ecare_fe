"use client";

import React, { useState } from "react";
import {
    Table,
    Tag,
    Button,
    Space,
    message,
    Spin,
    Popconfirm,
    Drawer,
    Descriptions,
    Divider,
    Typography,
} from "antd";
import dayjs from "dayjs";
import {
    useGetAppointmentsByDoctorQuery,
    useUpdateAppointmentMutation,
    useApproveCancelAppointmentMutation,
    useRejectCancelAppointmentMutation,
    useGetAppointmentByIdQuery,
} from "@/api/app_apointment/apiAppointment";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import { getCookie } from "cookies-next";

const { Title } = Typography;

const statusColors: Record<string, string> = {
    pending: "orange",
    confirmed: "green",
    completed: "blue",
    cancel_requested: "gold",
    cancelled: "red",
};

const PatientsAppointments: React.FC = () => {
    const userId = getCookie("idUser") as string | undefined;
    const { data: myDoctorData } = useGetMyDoctorQuery(userId as string, {
        skip: !userId,
    });
    const doctorId = myDoctorData?.id ? String(myDoctorData.id) : undefined;

    const { data: appointments, isLoading: isLoadingAppointments } =
        useGetAppointmentsByDoctorQuery(
            { doctor_id: Number(doctorId) || 0 },
            { skip: !doctorId }
        );

    const [updateAppointment, { isLoading: isUpdating }] =
        useUpdateAppointmentMutation();
    const [approveCancel] = useApproveCancelAppointmentMutation();
    const [rejectCancel] = useRejectCancelAppointmentMutation();

    const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
    const [detailId, setDetailId] = useState<number | null>(null);

    const { data: detailData, isLoading: loadingDetail } =
        useGetAppointmentByIdQuery(detailId as number, { skip: !detailId });

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            setSelectedAppointment(id);
            await updateAppointment({ id, data: { status } }).unwrap();
            message.success("Cập nhật trạng thái thành công!");
        } catch (error) {
            console.error("Error updating appointment status:", error);
            message.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        } finally {
            setSelectedAppointment(null);
        }
    };

    const columns = [
        {
            title: "Tên bệnh nhân",
            dataIndex: "patient_name",
            key: "patient_name",
        },
        {
            title: "Ngày hẹn",
            dataIndex: "appointment_date",
            key: "appointment_date",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Giờ hẹn",
            dataIndex: "time_slot",
            key: "time_slot",
        },
        {
            title: "Lý do khám",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status] || "default"}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => setDetailId(record.id)}>
                        Chi tiết
                    </Button>
                    {record.status === "pending" && (
                        <>
                            <Button
                                type="primary"
                                onClick={() => handleUpdateStatus(record.id, "confirmed")}
                                loading={isUpdating && selectedAppointment === record.id}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                danger
                                onClick={() => handleUpdateStatus(record.id, "cancelled")}
                                loading={isUpdating && selectedAppointment === record.id}
                            >
                                Hủy
                            </Button>
                        </>
                    )}
                    {record.status === "cancel_requested" && (
                        <>
                            <Popconfirm
                                title="Xác nhận hủy lịch?"
                                onConfirm={async () => {
                                    try {
                                        await approveCancel({ id: record.id }).unwrap();
                                        message.success("Đã hủy lịch.");
                                    } catch {
                                        message.error("Thao tác thất bại");
                                    }
                                }}
                            >
                                <Button danger>Xác nhận hủy</Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Từ chối yêu cầu hủy?"
                                onConfirm={async () => {
                                    try {
                                        await rejectCancel({ id: record.id }).unwrap();
                                        message.success("Đã từ chối yêu cầu.");
                                    } catch {
                                        message.error("Thao tác thất bại");
                                    }
                                }}
                            >
                                <Button>Trở lại xác nhận</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    if (isLoadingAppointments) {
        return <Spin tip="Đang tải danh sách lịch hẹn..." />;
    }

    // ánh xạ bác sĩ và khoa từ myDoctorData (local cache)
    const getDoctorName = (doctorId: number) =>
        myDoctorData?.id === doctorId ? myDoctorData.full_name : "-";

    const getDoctorDepartment = (doctorId: number) => {
        if (myDoctorData?.id === doctorId) {
            return myDoctorData.departments?.map((d: any) => d.name).join(", ") || "-";
        }
        return "-";
    };

    return (
        <div>
            <Table
                columns={columns}
                dataSource={appointments?.data || []}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                bordered
            />
            <Drawer
                title={<span style={{ color: "#0b6e64", fontWeight: 600 }}>Chi tiết lịch hẹn</span>}
                placement="right"
                width={520}
                open={!!detailId}
                onClose={() => setDetailId(null)}
            >
                {loadingDetail ? (
                    <Spin />
                ) : detailData ? (
                    <>
                        <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600 }}>
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
                            <Descriptions.Item label="Bác sĩ">
                                {getDoctorName(detailData.data?.doctor_id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khoa">
                                {getDoctorDepartment(detailData.data?.doctor_id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày khám">
                                {dayjs(detailData.data?.appointment_date).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khung giờ">{detailData.data?.time_slot}</Descriptions.Item>
                            <Descriptions.Item label="Lý do khám">{detailData.data?.reason || "-"}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={statusColors[detailData.data?.status]}>
                                    {detailData.data?.status?.toUpperCase?.() || detailData.data?.status}
                                </Tag>
                            </Descriptions.Item>
                            {detailData.data?.cancel_reason && (
                                <Descriptions.Item label="Lý do hủy">
                                    {detailData.data.cancel_reason}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                        <Divider />
                        {detailData.data?.status === "pending" && (
                            <Space>
                                <Button type="primary" onClick={() => handleUpdateStatus(detailData.data.id, "confirmed")}>
                                    Xác nhận
                                </Button>
                                <Button danger onClick={() => handleUpdateStatus(detailData.data.id, "cancelled")}>
                                    Hủy
                                </Button>
                            </Space>
                        )}
                        {detailData.data?.status === "cancel_requested" && (
                            <Space>
                                <Popconfirm
                                    title="Xác nhận hủy lịch?"
                                    onConfirm={async () => {
                                        try {
                                            await approveCancel({ id: detailData.data.id }).unwrap();
                                            message.success("Đã hủy lịch.");
                                        } catch {
                                            message.error("Thao tác thất bại");
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
                                            message.success("Đã từ chối yêu cầu.");
                                        } catch {
                                            message.error("Thao tác thất bại");
                                        }
                                    }}
                                >
                                    <Button>Trở lại xác nhận</Button>
                                </Popconfirm>
                            </Space>
                        )}
                    </>
                ) : null}
            </Drawer>
        </div>
    );
};

export default PatientsAppointments;
