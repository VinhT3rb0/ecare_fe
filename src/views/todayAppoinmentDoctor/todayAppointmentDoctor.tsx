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
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
} from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useGetAppointmentsByDoctorAndDateQuery,
    useUpdateAppointmentMutation,
    useApproveCancelAppointmentMutation,
    useRejectCancelAppointmentMutation,
    useGetAppointmentByIdQuery,
    useStartTreatmentMutation,
} from "@/api/app_apointment/apiAppointment";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import { getCookie } from "cookies-next";
import AppointmentDetail from "./components/appointmentDetail";
import toast from "react-hot-toast";

const { Title } = Typography;

const statusColors: Record<string, string> = {
    pending: "orange",
    confirmed: "green",
    completed: "blue",
    cancel_requested: "gold",
    cancelled: "red",
    in_treatment: "purple",
};

const statusTexts: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancel_requested: "Yêu cầu hủy",
    cancelled: "Đã hủy",
    in_treatment: "Đang điều trị",
};

const TodayAppointmentDoctor: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [detailId, setDetailId] = useState<number | null>(null);

    const userId = getCookie("idUser") as string | undefined;
    const { data: myDoctorData } = useGetMyDoctorQuery(userId as string, {
        skip: !userId,
    });
    const doctorId = myDoctorData?.id ? Number(myDoctorData.id) : undefined;

    const { data: appointments, isLoading: isLoadingAppointments, refetch } =
        useGetAppointmentsByDoctorAndDateQuery(
            {
                doctor_id: doctorId || 0,
                appointment_date: selectedDate.format("YYYY-MM-DD"),
            },
            { skip: !doctorId }
        );

    const [updateAppointment] =
        useUpdateAppointmentMutation();
    const [approveCancel] = useApproveCancelAppointmentMutation();
    const [rejectCancel] = useRejectCancelAppointmentMutation();

    const { data: detailData, isLoading: loadingDetail } =
        useGetAppointmentByIdQuery(detailId as number, { skip: !detailId });

    const handleUpdateStatus = async (id: number, status: string) => {
        try {

            await updateAppointment({ id, data: { status } }).unwrap();
            toast.success("Cập nhật trạng thái thành công!");
            refetch();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        } finally {

        }
    };

    // Thống kê
    const stats = useMemo(() => {
        if (!appointments?.data) return { total: 0, pending: 0, confirmed: 0, completed: 0 };

        const data = appointments.data;
        return {
            total: data.length,
            pending: data.filter((apt: any) => apt.status === "pending").length,
            confirmed: data.filter((apt: any) => apt.status === "confirmed").length,
            completed: data.filter((apt: any) => apt.status === "completed").length,
        };
    }, [appointments?.data]);

    const columns = [
        {
            title: "Tên bệnh nhân",
            dataIndex: "patient_name",
            key: "patient_name",
            render: (text: string) => (
                <div style={{ fontWeight: 500 }}>{text}</div>
            ),
        },
        {
            title: "Giờ hẹn",
            dataIndex: "time_slot",
            key: "time_slot",
            render: (time: string) => (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ClockCircleOutlined style={{ color: "#1890ff" }} />
                    <span style={{ fontWeight: 500 }}>{time}</span>
                </div>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "patient_phone",
            key: "patient_phone",
        },
        {
            title: "Lý do khám",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status] || "default"}>
                    {statusTexts[status] || status.toUpperCase()}
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
                    {record.status === "cancel_requested" && (
                        <>
                            <Popconfirm
                                title="Xác nhận hủy lịch?"
                                onConfirm={async () => {
                                    try {
                                        await approveCancel({ id: record.id }).unwrap();
                                        toast.success("Đã hủy lịch.");
                                        refetch();
                                    } catch {
                                        toast.error("Thao tác thất bại");
                                    }
                                }}
                            >
                                <Button danger size="small">Xác nhận hủy</Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Từ chối yêu cầu hủy?"
                                onConfirm={async () => {
                                    try {
                                        await rejectCancel({ id: record.id }).unwrap();
                                        toast.success("Đã từ chối yêu cầu.");
                                        refetch();
                                    } catch {
                                        toast.error("Thao tác thất bại");
                                    }
                                }}
                            >
                                <Button size="small">Từ chối</Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    if (isLoadingAppointments) {
        return <Spin />;
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, color: "#0b6e64" }}>
                    Lịch khám hôm nay
                </Title>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16 }}>
                    <DatePicker
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date || dayjs())}
                        format="DD/MM/YYYY"
                        style={{ width: 200 }}
                    />
                    <Button
                        type="primary"
                        onClick={() => refetch()}
                        icon={<CalendarOutlined />}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng lịch hẹn"
                            value={stats.total}
                            prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xác nhận"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã xác nhận"
                            value={stats.confirmed}
                            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined style={{ color: "#1890ff" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={appointments?.data || []}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    bordered
                    loading={isLoadingAppointments}
                />
            </Card>

            {/* Detail Drawer */}
            <Drawer
                title={<span style={{ color: "#0b6e64", fontWeight: 600 }}>Chi tiết lịch hẹn</span>}
                placement="right"
                width={520}
                open={!!detailId}
                onClose={() => setDetailId(null)}
            >
                <AppointmentDetail
                    loading={loadingDetail}
                    detailData={detailData}
                    onClose={() => setDetailId(null)}
                    onUpdateStatus={handleUpdateStatus}
                    refetch={refetch}
                    statusColors={statusColors}
                    statusTexts={statusTexts}
                />
            </Drawer>
        </div>
    );
};

export default TodayAppointmentDoctor;
