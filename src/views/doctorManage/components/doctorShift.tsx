"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    Button,
    Input,
    Space,
    Card,
    Modal,
    Row,
    Col,
    Statistic,
    Tag,
    DatePicker,
    Select,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { useDebounce } from "@/utils/useDebounce";
import {
    useGetDoctorSchedulesQuery,
    useDeleteScheduleMutation,
} from "@/api/app_doctor/apiSchedulesDoctor";
import type { DoctorSchedule } from "@/api/app_doctor/apiSchedulesDoctor";
import AddAndUpdateDoctorSchedule from "./AddAndUpdateDoctorSchedule";
import dayjs from "dayjs";
import { useGetDoctorApprovedQuery } from "@/api/app_doctor/apiDoctor";
import toast from "react-hot-toast";

const { RangePicker } = DatePicker;

const DoctorShift: React.FC = () => {
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearch = useDebounce(searchValue, 400);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [editScheduleData, setEditScheduleData] = useState<DoctorSchedule | null>(null);
    const { data: approvedDoctorsData, isLoading: isDoctorsLoading } = useGetDoctorApprovedQuery(
        undefined
    );
    const approvedDoctors = approvedDoctorsData?.approvedDoctors || [];

    const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
        null,
        null,
    ]);

    // API calls
    const { data: schedulesData, isLoading, refetch } = useGetDoctorSchedulesQuery({
        start_date: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
        end_date: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
        doctor_name: debouncedSearch || undefined,
    });
    const [deleteSchedule] = useDeleteScheduleMutation();

    const schedules = schedulesData?.data || [];

    // compute stats
    const totalSchedules = schedules.length;
    const totalActiveSchedules = schedules.filter((s) =>
        ["scheduled", "in_progress", "late"].includes(s.status)
    ).length;
    const totalCompletedSchedules = schedules.filter((s) => s.status === "completed").length;

    const scheduleColumns = useMemo(
        () => [
            {
                title: "Bác sĩ",
                key: "doctor",
                render: (record: DoctorSchedule) => {
                    const doctor = approvedDoctors.find((d: any) => d.id === record.doctor_id);
                    // if doctor.User exists, prefer full name; else fallback to doctor.full_name
                    const name = doctor?.full_name || doctor?.User?.full_name || `Bác sĩ #${record.doctor_id}`;
                    return <span>{name}</span>;
                },
            },
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
                            Giờ: {record.start_time || "08:00:00"} - {record.end_time || "16:30:00"}
                        </div>
                        <div>Số BN tối đa: {record.max_patients ?? "N/A"}</div>
                        <div>Ghi chú: {record.notes || "Không có ghi chú"}</div>
                    </div>
                ),
            },
            {
                title: "Hành động",
                key: "actions",
                render: (record: DoctorSchedule) => (
                    <Space>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditScheduleData(record);
                                setScheduleModalOpen(true);
                            }}
                        >
                            Chỉnh sửa
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={async () => {
                                try {
                                    await deleteSchedule(record.id as any).unwrap();
                                    toast.success("Xóa lịch làm việc thành công!");
                                    refetch();
                                } catch (error: any) {
                                    toast.error(error?.data?.message || "Có lỗi xảy ra khi xóa!");
                                }
                            }}
                        >
                            Xóa
                        </Button>
                    </Space>
                ),
            },
        ],
        [approvedDoctors, deleteSchedule, refetch]
    );

    // auto refetch when search or dateRange changes
    useEffect(() => {
        // refetch handled by RTK Query since query args change; keep for explicit refetch when needed
    }, [debouncedSearch, dateRange]);

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Quản lý lịch làm việc của bác sĩ</h2>
                <Row gutter={16} className="mb-4">
                    <Col span={8}>
                        <Statistic title="Tổng số lịch" value={totalSchedules} prefix={<ClockCircleOutlined />} />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Lịch đang hoạt động"
                            value={totalActiveSchedules}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Lịch đã hoàn thành"
                            value={totalCompletedSchedules}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                </Row>
            </div>

            <Space className="mb-4 flex-wrap" style={{ gap: 12 }}>
                <Input
                    placeholder="Nhập tên bác sĩ"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    style={{ width: 240 }}
                    allowClear
                />

                <RangePicker
                    format="YYYY-MM-DD"
                    value={dateRange}
                    onChange={(dates) =>
                        setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])
                    }
                />

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditScheduleData(null);
                        setScheduleModalOpen(true);
                    }}
                >
                    Thêm lịch làm việc
                </Button>
            </Space>

            <Table
                columns={scheduleColumns}
                dataSource={schedules}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                loading={isLoading}
            />

            <Modal
                title={editScheduleData ? "Chỉnh sửa lịch làm việc" : "Thêm lịch làm việc"}
                open={scheduleModalOpen}
                onCancel={() => setScheduleModalOpen(false)}
                width={700}
                footer={null}
                destroyOnClose
            >
                <AddAndUpdateDoctorSchedule
                    visible={scheduleModalOpen}
                    onCancel={() => setScheduleModalOpen(false)}
                    onSuccess={() => {
                        setScheduleModalOpen(false);
                        refetch();
                    }}
                    editData={editScheduleData}
                    approvedDoctors={approvedDoctors}
                    isDoctorsLoading={isDoctorsLoading}
                />
            </Modal>
        </Card>
    );
};

export default DoctorShift;
