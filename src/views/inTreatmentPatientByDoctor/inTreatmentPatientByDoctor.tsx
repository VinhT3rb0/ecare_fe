"use client";

import React, { useState, useMemo } from "react";
import {
    Card,
    Row,
    Col,
    Tag,
    Button,
    Space,
    Spin,
    Typography,
    Statistic,
    Input,
    Avatar,
    Pagination,
    Tooltip,
    Empty,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    SearchOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useGetAppointmentsByDoctorQuery,
    useGetAppointmentByIdQuery,
} from "@/api/app_apointment/apiAppointment";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import { getCookie } from "cookies-next";
import AppointmentDetailModal from "./components/AppointmentDetailModal";

const { Title, Text } = Typography;

const THEME = {
    primary: "#11A998",
    accent: "#0b6e64",
    softBg: "rgba(17,169,152,0.06)",
};

const statusColors: Record<string, string> = {
    pending: "#fa8c16",
    confirmed: "#52c41a",
    completed: "#1890ff",
    cancel_requested: "#faad14",
    cancelled: "#ff4d4f",
    in_treatment: "#722ed1",
};

const statusTexts: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancel_requested: "Yêu cầu hủy",
    cancelled: "Đã hủy",
    in_treatment: "Đang điều trị",
};

const PAGE_DEFAULT = 8;

const CardStyle: React.CSSProperties = {
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "0 8px 28px rgba(2,6,23,0.06)",
    border: "1px solid rgba(17,169,152,0.06)",
};

const InTreatmentPatientByDoctorCards: React.FC = () => {
    const [detailId, setDetailId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState<string>("");
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(PAGE_DEFAULT);

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
            (appointment.patient_name || "")
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
            (appointment.patient_phone || "").includes(searchText) ||
            (appointment.reason || "").toLowerCase().includes(searchText.toLowerCase())
        );
    }, [appointments?.data, searchText]);

    // Thống kê
    const stats = useMemo(() => {
        if (!appointments?.data)
            return { total: 0, in_treatment: 0, today: 0, this_week: 0 };

        const data = appointments.data;
        const today = dayjs().format("YYYY-MM-DD");
        const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
        const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");

        return {
            total: data.length,
            in_treatment: data.filter((apt: any) => apt.status === "in_treatment")
                .length,
            today: data.filter((apt: any) => apt.appointment_date === today).length,
            this_week: data.filter(
                (apt: any) =>
                    apt.appointment_date >= startOfWeek &&
                    apt.appointment_date <= endOfWeek
            ).length,
        };
    }, [appointments?.data]);

    // paging slice
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageItems = filteredAppointments.slice(startIndex, endIndex);

    if (isLoadingAppointments) {
        return (
            <div style={{ textAlign: "center", padding: 40 }}>
                <Spin tip="Đang tải..." size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            {/* Header */}
            <div
                style={{
                    marginBottom: 18,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0, color: THEME.accent }}>
                        <MedicineBoxOutlined
                            style={{ marginRight: 8, color: THEME.primary }}
                        />
                        Bệnh nhân đang điều trị
                    </Title>
                    <Text type="secondary">
                        Danh sách bệnh nhân đang trong quá trình điều trị bởi bạn
                    </Text>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Input
                        placeholder="Tìm theo tên, SĐT, lý do..."
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                        }}
                        prefix={<SearchOutlined />}
                        allowClear
                        style={{ width: 340, borderRadius: 8 }}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refetch()}
                        style={{
                            background: THEME.primary,
                            color: "#fff",
                            borderRadius: 8,
                        }}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 6px 18px rgba(11,110,100,0.06)",
                            background: "linear-gradient(180deg, rgba(17,169,152,0.04), #fff)",
                        }}
                    >
                        <Statistic
                            title={<Text strong>Tổng bệnh nhân</Text>}
                            value={stats.total}
                            prefix={<UserOutlined style={{ color: THEME.primary }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bodyStyle={{ padding: 12 }} style={{ borderRadius: 12 }}>
                        <Statistic
                            title={<Text strong>Hôm nay</Text>}
                            value={stats.today}
                            prefix={<CalendarOutlined style={{ color: "#52c41a" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bodyStyle={{ padding: 12 }} style={{ borderRadius: 12 }}>
                        <Statistic
                            title={<Text strong>Tuần này</Text>}
                            value={stats.this_week}
                            prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bodyStyle={{ padding: 12 }} style={{ borderRadius: 12 }}>
                        <Statistic
                            title={<Text strong>Đang điều trị</Text>}
                            value={stats.in_treatment}
                            prefix={<MedicineBoxOutlined style={{ color: "#722ed1" }} />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Cards grid */}
            <div style={{ marginBottom: 20 }}>
                {pageItems.length === 0 ? (
                    <Empty description="Không có bệnh nhân" />
                ) : (
                    <Row gutter={[16, 16]}>
                        {pageItems.map((apt: any) => {
                            const initials = (apt.patient_name || "")
                                .split(" ")
                                .map((s: string) => s[0])
                                .slice(-2)
                                .join("")
                                .toUpperCase();
                            const statusColor = statusColors[apt.status] || "#d9d9d9";
                            return (
                                <Col xs={24} sm={24} md={12} lg={10} xl={8} key={apt.id}>
                                    <Card style={CardStyle} bodyStyle={{ padding: 14 }}>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <Avatar
                                                size={64}
                                                style={{ background: THEME.primary, verticalAlign: "middle" }}
                                            >
                                                {initials || <UserOutlined />}
                                            </Avatar>

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                                    <div>
                                                        <Text strong style={{ fontSize: 16 }}>{apt.patient_name || "—"}</Text>
                                                        <div style={{ marginTop: 6, color: "rgba(0,0,0,0.6)" }}>
                                                            <PhoneOutlined style={{ marginRight: 8, color: "#4CAF50" }} />
                                                            <a href={`tel:${apt.patient_phone}`} style={{ color: "inherit" }}>
                                                                {apt.patient_phone || "—"}
                                                            </a>
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: "right" }}>
                                                        <Tag
                                                            style={{
                                                                background: `${statusColor}20`,
                                                                color: statusColor,
                                                                fontWeight: 700,
                                                                borderRadius: 10,
                                                                padding: "6px 10px",
                                                            }}
                                                        >
                                                            {statusTexts[apt.status] || apt.status}
                                                        </Tag>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                                                    <Tooltip title="Ngày hẹn">
                                                        <CalendarOutlined style={{ color: "#0aa287" }} />
                                                    </Tooltip>
                                                    <Text>{dayjs(apt.appointment_date).format("DD/MM/YYYY")}</Text>

                                                    <Tooltip title="Giờ hẹn" style={{ marginLeft: 8 }}>
                                                        <ClockCircleOutlined style={{ marginLeft: 12, color: "#1890ff" }} />
                                                    </Tooltip>
                                                    <Text strong style={{ marginLeft: 6 }}>{apt.time_slot}</Text>
                                                </div>

                                                <div style={{ marginTop: 10 }}>
                                                    <Text type="secondary" ellipsis={{ tooltip: apt.reason || "-" }}>
                                                        {apt.reason || "—"}
                                                    </Text>
                                                </div>

                                                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                                    <Button
                                                        type="primary"
                                                        ghost
                                                        onClick={() => handleShowDetail(apt.id)}
                                                        style={{ borderRadius: 8 }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        onClick={() => window.open(`tel:${apt.patient_phone}`)}
                                                        style={{ borderRadius: 8 }}
                                                    >
                                                        Gọi
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>

            {/* Pagination */}
            {filteredAppointments.length > 0 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                    <Pagination
                        current={page}
                        pageSize={pageSize}
                        total={filteredAppointments.length}
                        showSizeChanger
                        pageSizeOptions={["4", "8", "12", "24"]}
                        onChange={(p, ps) => {
                            setPage(p);
                            setPageSize(ps || PAGE_DEFAULT);
                        }}
                    />
                </div>
            )}

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

export default InTreatmentPatientByDoctorCards;
