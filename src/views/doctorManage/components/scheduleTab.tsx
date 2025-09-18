"use client";
import React, { useState, useMemo } from "react";
import { Table, Tag, Card, Space, DatePicker, Statistic, Row, Col, message, Button } from "antd";
import { ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetDoctorSchedulesQuery, useDeleteScheduleMutation } from "@/api/app_doctor/apiSchedulesDoctor";
import type { DoctorSchedule } from "@/api/app_doctor/apiSchedulesDoctor";
import { useGetDoctorApprovedQuery } from "@/api/app_doctor/apiDoctor";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;

interface ScheduleTabProps {
    doctorId: string; // id bác sĩ truyền vào (string)
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({ doctorId }) => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);

    const { data: approvedDoctorsData } = useGetDoctorApprovedQuery();
    const approvedDoctors = approvedDoctorsData?.approvedDoctors || [];

    // gọi API chỉ khi có doctorId
    const { data: schedulesData, isLoading, refetch } = useGetDoctorSchedulesQuery(
        {
            start_date: dateRange[0]?.format("YYYY-MM-DD"),
            end_date: dateRange[1]?.format("YYYY-MM-DD"),
            doctor_id: doctorId ? String(doctorId) : undefined,
        },
        { skip: !doctorId }
    );

    const [deleteSchedule] = useDeleteScheduleMutation();
    const schedules: DoctorSchedule[] = schedulesData?.data || [];

    // tìm doctor object (so sánh số)
    const doctor = approvedDoctors.find((d: any) => Number(d.id) === Number(doctorId));

    const scheduleColumns = useMemo(
        () => [
            {
                title: "Ngày",
                dataIndex: "date",
                key: "date",
                render: (date: string) => {
                    if (!date) return "N/A";
                    const dateObj = new Date(date);
                    return dateObj.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                },
            },
            {
                title: "Phòng",
                key: "room",
                render: (record: DoctorSchedule) => <span>{record.Room?.name || "N/A"}</span>,
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                render: (status: string) => {
                    const statusConfig = {
                        scheduled: { color: "default", text: "Đã lên lịch" },
                        in_progress: { color: "green", text: "Đang làm" },
                        late: { color: "orange", text: "Đến muộn" },
                        left_early: { color: "gold", text: "Về sớm" },
                        completed: { color: "blue", text: "Hoàn thành" },
                        absent: { color: "red", text: "Vắng" },
                        cancelled: { color: "magenta", text: "Đã hủy" },
                    } as const;
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return <Tag color={config?.color}>{config?.text || status}</Tag>;
                },
            },
            {
                title: "Thông tin chi tiết",
                key: "details",
                render: (record: DoctorSchedule) => (
                    <div>
                        <div>
                            Giờ làm:{" "}
                            {(record.start_time || "08:00:00").slice(0, 5)} - {(record.end_time || "16:30:00").slice(0, 5)}
                        </div>
                        <div>Số BN tối đa: {record.max_patients ?? "N/A"}</div>
                        <div>Ghi chú: {record.notes || "Không có ghi chú"}</div>
                        <div>
                            Check-in:{" "}
                            {record.check_in_time
                                ? new Date(record.check_in_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                                : "Chưa check-in"}
                        </div>
                        <div>
                            Check-out:{" "}
                            {record.check_out_time
                                ? new Date(record.check_out_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                                : "Chưa check-out"}
                        </div>
                    </div>
                ),
            },
            {
                title: "Hành động",
                key: "actions",
                render: (record: DoctorSchedule) => (
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={async () => {
                            try {
                                await deleteSchedule(Number(record.id)).unwrap();
                                toast.success("Xóa lịch làm việc thành công!");
                                refetch();
                            } catch (error: any) {
                                toast.error(error?.data?.message || "Có lỗi xảy ra khi xóa!");
                            }
                        }}
                    >
                        Xóa
                    </Button>
                ),
            },
        ],
        [deleteSchedule, refetch]
    );

    const totalSchedules = schedules.length;
    const totalActiveSchedules = schedules.filter((s) =>
        ["scheduled", "in_progress", "late"].includes(s.status as any)
    ).length;
    const totalCompletedSchedules = schedules.filter((s) => s.status === "completed").length;

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4">
                Lịch làm việc của {doctor?.full_name || "Bác sĩ"} {doctor ? `(ID: ${doctor.id})` : `(ID: ${doctorId})`}
            </h2>

            <Row gutter={16} className="mb-4">
                <Col span={8}>
                    <Statistic title="Tổng số lịch" value={totalSchedules} prefix={<ClockCircleOutlined />} />
                </Col>
                <Col span={8}>
                    <Statistic title="Đang hoạt động" value={totalActiveSchedules} valueStyle={{ color: "#52c41a" }} />
                </Col>
                <Col span={8}>
                    <Statistic title="Đã hoàn thành" value={totalCompletedSchedules} valueStyle={{ color: "#1890ff" }} />
                </Col>
            </Row>

            <Space className="mb-4 flex-wrap" style={{ gap: 12 }}>
                <RangePicker
                    format="YYYY-MM-DD"
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                />
                {/* Nếu sau này muốn filter theo phòng / trạng thái có thể thêm control ở đây */}
                <Button onClick={() => refetch()}>Lọc</Button>
            </Space>

            <Table
                columns={scheduleColumns}
                dataSource={schedules}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                loading={isLoading}
                scroll={{ x: "100%", y: 400 }}
            />
        </Card>
    );
};

export default ScheduleTab;
