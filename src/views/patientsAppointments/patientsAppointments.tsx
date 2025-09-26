"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    Tag,
    Button,
    Space,
    Spin,
    Popconfirm,
    Drawer,
    Descriptions,
    Divider,
    Typography,
    Card,
    Badge,
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
import toast from "react-hot-toast";
import {
    CheckOutlined,
    CloseOutlined,
    InfoCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const STATUS_MAP: Record<
    string,
    { color: string; label: string; cssColor?: string }
> = {
    pending: { color: "orange", label: "Chờ xác nhận", cssColor: "#fa8c16" },
    confirmed: { color: "green", label: "Đã xác nhận", cssColor: "#52c41a" },
    completed: { color: "blue", label: "Hoàn thành", cssColor: "#1890ff" },
    cancel_requested: { color: "gold", label: "Yêu cầu hủy", cssColor: "#faad14" },
    cancelled: { color: "red", label: "Đã hủy", cssColor: "#ff4d4f" },
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

    const [detailId, setDetailId] = useState<number | null>(null);

    const { data: detailData, isLoading: loadingDetail } =
        useGetAppointmentByIdQuery(detailId as number, { skip: !detailId });

    const filteredAppointments =
        appointments?.data?.filter(
            (appointment: any) =>
                appointment.status === "pending" || appointment.status === "cancel_requested"
        ) || [];

    const pendingCount = filteredAppointments.length;

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await updateAppointment({ id, data: { status } }).unwrap();
            toast.success("Cập nhật trạng thái thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
    };

    const columns = [
        {
            title: "Bệnh nhân",
            dataIndex: "patient_name",
            key: "patient_name",
            render: (val: string) => <Text strong>{val || "—"}</Text>,
            width: 220,
        },
        {
            title: "Ngày",
            dataIndex: "appointment_date",
            key: "appointment_date",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
            width: 120,
        },
        {
            title: "Giờ",
            dataIndex: "time_slot",
            key: "time_slot",
            render: (val: string) => <Text>{val || "—"}</Text>,
            width: 140,
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
            render: (val: string) => <Text ellipsis={{ tooltip: val || "-" }}>{val || "-"}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                const cfg = STATUS_MAP[status] || { color: "default", label: status };
                return (
                    <Tag
                        color={cfg.color}
                        style={{ fontWeight: 700, borderRadius: 6, padding: "4px 10px" }}
                    >
                        {cfg.label}
                    </Tag>
                );
            },
            width: 160,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: any) => {
                return (
                    <Space wrap>
                        <Button
                            type="default"
                            icon={<InfoCircleOutlined />}
                            onClick={() => setDetailId(record.id)}
                            style={{ borderRadius: 8 }}
                        >
                            Chi tiết
                        </Button>

                        {record.status === "pending" && (
                            <>
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleUpdateStatus(record.id, "confirmed")}
                                    loading={isUpdating}
                                    style={{ borderRadius: 8 }}
                                >
                                    Xác nhận
                                </Button>
                                <Popconfirm
                                    title="Bạn có chắc muốn hủy lịch này?"
                                    onConfirm={() => handleUpdateStatus(record.id, "cancelled")}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <Button danger icon={<CloseOutlined />} style={{ borderRadius: 8 }}>
                                    </Button>
                                </Popconfirm>
                            </>
                        )}

                        {record.status === "cancel_requested" && (
                            <>
                                <Popconfirm
                                    title="Xác nhận hủy lịch theo yêu cầu?"
                                    onConfirm={async () => {
                                        try {
                                            await approveCancel({ id: record.id }).unwrap();
                                            toast.success("Đã hủy lịch.");
                                        } catch {
                                            toast.error("Thao tác thất bại");
                                        }
                                    }}
                                    okText="Xác nhận"
                                    cancelText="Hủy"
                                >
                                    <Button danger icon={<CloseOutlined />} style={{ borderRadius: 8 }}>
                                        Xác nhận hủy
                                    </Button>
                                </Popconfirm>

                                <Popconfirm
                                    title="Từ chối yêu cầu hủy và giữ lịch?"
                                    onConfirm={async () => {
                                        try {
                                            await rejectCancel({ id: record.id }).unwrap();
                                            toast.success("Đã từ chối yêu cầu.");
                                        } catch {
                                            toast.error("Thao tác thất bại");
                                        }
                                    }}
                                    okText="Từ chối"
                                    cancelText="Hủy"
                                >
                                    <Button type="default" style={{ borderRadius: 8 }}>
                                        Từ chối yêu cầu
                                    </Button>
                                </Popconfirm>
                            </>
                        )}
                    </Space>
                );
            },
            width: 340,
        },
    ];

    // fallback loading
    if (isLoadingAppointments) {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" tip="Đang tải danh sách lịch hẹn..." />
            </div>
        );
    }

    // helper to show doctor info from cached myDoctorData
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
            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                bodyStyle={{ padding: 12 }}
            >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Yêu cầu cần xử lý
                    </Title>
                    <Badge
                        count={pendingCount}
                        showZero={false}
                        style={{ backgroundColor: "#ff4d4f" }}
                    />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    <Button
                        onClick={() => window.location.reload()}
                        style={{ borderRadius: 8 }}
                    >
                        Làm mới
                    </Button>
                </div>
            </Card>

            <Card
                style={{
                    borderRadius: 12,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
                }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredAppointments}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    bordered={false}
                    locale={{ emptyText: <Text type="secondary">Không có yêu cầu</Text> }}
                    rowClassName={() => "hover-row"}
                    style={{ borderRadius: 8, overflow: "hidden" }}
                />
            </Card>

            <Drawer
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <InfoCircleOutlined style={{ color: "#0b6e64", fontSize: 18 }} />
                        <span style={{ color: "#0b6e64", fontWeight: 700 }}>Chi tiết lịch hẹn</span>
                    </div>
                }
                placement="right"
                width={540}
                open={!!detailId}
                onClose={() => setDetailId(null)}
                bodyStyle={{ padding: 24 }}
                headerStyle={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
            >
                {loadingDetail ? (
                    <div style={{ textAlign: "center", padding: 32 }}>
                        <Spin />
                    </div>
                ) : detailData ? (
                    <>
                        <Descriptions
                            column={1}
                            bordered
                            size="small"
                            styles={{
                                label: { fontWeight: 700, background: "#fbfbfb" },
                                content: { background: "#fff" },
                            }}
                        >
                            <Descriptions.Item label="Bệnh nhân">
                                <Text strong>{detailData.data?.patient_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="SĐT">
                                {detailData.data?.patient_phone || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {detailData.data?.patient_email || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {detailData.data?.patient_gender === "male"
                                    ? "Nam"
                                    : detailData.data?.patient_gender === "female"
                                        ? "Nữ"
                                        : "Khác"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {detailData.data?.patient_address || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bác sĩ">
                                {getDoctorName(detailData.data?.doctor_id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khoa">
                                {getDoctorDepartment(detailData.data?.doctor_id)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày khám">
                                {dayjs(detailData.data?.appointment_date).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Khung giờ">
                                {detailData.data?.time_slot}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do">
                                {detailData.data?.reason || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={STATUS_MAP[detailData.data?.status]?.color || "default"}
                                    style={{ fontWeight: 700, borderRadius: 6 }}
                                >
                                    {STATUS_MAP[detailData.data?.status]?.label ||
                                        detailData.data?.status}
                                </Tag>
                            </Descriptions.Item>

                            {detailData.data?.cancel_reason && (
                                <Descriptions.Item label="Lý do hủy">
                                    {detailData.data.cancel_reason}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider />

                        <div style={{ display: "flex", gap: 8 }}>
                            {detailData.data?.status === "pending" && (
                                <>
                                    <Button
                                        type="primary"
                                        icon={<CheckOutlined />}
                                        onClick={() => handleUpdateStatus(detailData.data.id, "confirmed")}
                                        style={{ borderRadius: 8 }}
                                    >
                                        Xác nhận
                                    </Button>

                                    <Popconfirm
                                        title="Bạn có chắc muốn hủy lịch này?"
                                        onConfirm={() => handleUpdateStatus(detailData.data.id, "cancelled")}
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button danger icon={<CloseOutlined />} style={{ borderRadius: 8 }}>
                                            Hủy
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}

                            {detailData.data?.status === "cancel_requested" && (
                                <>
                                    <Popconfirm
                                        title="Xác nhận hủy lịch theo yêu cầu?"
                                        onConfirm={async () => {
                                            try {
                                                await approveCancel({ id: detailData.data.id }).unwrap();
                                                toast.success("Đã hủy lịch.");
                                            } catch {
                                                toast.error("Thao tác thất bại");
                                            }
                                        }}
                                    >
                                        <Button danger style={{ borderRadius: 8 }}>
                                            Xác nhận hủy
                                        </Button>
                                    </Popconfirm>

                                    <Popconfirm
                                        title="Từ chối yêu cầu hủy và giữ lịch?"
                                        onConfirm={async () => {
                                            try {
                                                await rejectCancel({ id: detailData.data.id }).unwrap();
                                                toast.success("Đã từ chối yêu cầu.");
                                            } catch {
                                                toast.error("Thao tác thất bại");
                                            }
                                        }}
                                    >
                                        <Button type="default" style={{ borderRadius: 8 }}>
                                            Từ chối yêu cầu
                                        </Button>
                                    </Popconfirm>
                                </>
                            )}
                        </div>
                    </>
                ) : null}
            </Drawer>

            <style jsx>{`
        .hover-row:hover {
          background: linear-gradient(90deg, rgba(17,169,152,0.03), transparent);
        }
      `}</style>
        </div>
    );
};

export default PatientsAppointments;
