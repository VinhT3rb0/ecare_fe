"use client";

import React, { useState, useMemo } from "react";
import {
    Table,
    Tag,
    Button,
    Space,
    message,
    Spin,
    Typography,
    Card,
    Row,
    Col,
    Statistic,
    Input,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useGetAppointmentsByDoctorQuery,
    useGetAppointmentByIdQuery,
} from "@/api/app_apointment/apiAppointment";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import { getCookie } from "cookies-next";
import AppointmentDetailModal from "./components/AppointmentDetailModal";

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

const InTreatmentPatientByDoctor: React.FC = () => {
    const [detailId, setDetailId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const userId = getCookie("idUser") as string | undefined;
    const { data: myDoctorData } = useGetMyDoctorQuery(userId as string, {
        skip: !userId,
    });
    const doctorId = myDoctorData?.id ? Number(myDoctorData.id) : undefined;

    const { data: appointments, isLoading: isLoadingAppointments, refetch } =
        useGetAppointmentsByDoctorQuery(
            {
                doctor_id: doctorId || 0,
                status: "in_treatment",
            },
            { skip: !doctorId }
        );

    const { data: detailData, isLoading: loadingDetail } =
        useGetAppointmentByIdQuery(detailId as number, { skip: !detailId });

    const handleShowDetail = (id: number) => {
        setDetailId(id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setDetailId(null);
    };

    const handleMedicalRecordSuccess = () => {
        refetch();
    };

    // Lọc dữ liệu theo searchText
    const filteredAppointments = useMemo(() => {
        if (!appointments?.data) return [];

        if (!searchText) return appointments.data;

        return appointments.data.filter((appointment: any) =>
            appointment.patient_name.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.patient_phone.includes(searchText) ||
            appointment.reason?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [appointments?.data, searchText]);

    // Thống kê
    const stats = useMemo(() => {
        if (!appointments?.data) return { total: 0, in_treatment: 0, today: 0, this_week: 0 };

        const data = appointments.data;
        const today = dayjs().format("YYYY-MM-DD");
        const startOfWeek = dayjs().startOf('week').format("YYYY-MM-DD");
        const endOfWeek = dayjs().endOf('week').format("YYYY-MM-DD");

        return {
            total: data.length,
            in_treatment: data.filter((apt: any) => apt.status === "in_treatment").length,
            today: data.filter((apt: any) => apt.appointment_date === today).length,
            this_week: data.filter((apt: any) =>
                apt.appointment_date >= startOfWeek && apt.appointment_date <= endOfWeek
            ).length,
        };
    }, [appointments?.data]);

    const columns = [
        {
            title: "Tên bệnh nhân",
            dataIndex: "patient_name",
            key: "patient_name",
            render: (text: string) => (
                <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    {text}
                </div>
            ),
        },
        {
            title: "Ngày hẹn",
            dataIndex: "appointment_date",
            key: "appointment_date",
            render: (date: string) => (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarOutlined style={{ color: "#52c41a" }} />
                    <span>{dayjs(date).format("DD/MM/YYYY")}</span>
                </div>
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
            render: (phone: string) => (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <PhoneOutlined style={{ color: "#52c41a" }} />
                    {phone}
                </div>
            ),
        },
        {
            title: "Lý do khám",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
            render: (reason: string) => reason || "—",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status] || "default"} icon={status === "in_treatment" ? <MedicineBoxOutlined /> : undefined}>
                    {statusTexts[status] || status.toUpperCase()}
                </Tag>
            ),
        },
        {
            key: "action",
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => handleShowDetail(record.id)}>
                        Chi tiết
                    </Button>
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
                    <MedicineBoxOutlined style={{ marginRight: 8 }} />
                    Bệnh nhân đang điều trị
                </Title>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <Input
                        placeholder="Tìm kiếm theo tên, SĐT, lý do khám..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        prefix={<SearchOutlined />}
                        allowClear
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
                            title="Tổng bệnh nhân đang điều trị"
                            value={stats.total}
                            prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Hôm nay"
                            value={stats.today}
                            prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tuần này"
                            value={stats.this_week}
                            prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang điều trị"
                            value={stats.in_treatment}
                            prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredAppointments}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    bordered
                    loading={isLoadingAppointments}
                    scroll={{ x: 800 }}
                />
            </Card>
            <AppointmentDetailModal
                open={modalOpen}
                onClose={handleCloseModal}
                appointment={detailData?.data}
                loading={loadingDetail}
                onSuccess={handleMedicalRecordSuccess}
            />
        </div>
    );
};

export default InTreatmentPatientByDoctor;
