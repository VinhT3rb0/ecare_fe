'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    Table,
    Button,
    DatePicker,
    Space,
    Tag,
    Row,
    Col,
    Statistic,
    Calendar,
    Badge,
    Tooltip,
    Typography,
    message,
} from 'antd';
import {
    CheckCircleOutlined,
    ExportOutlined,
    CalendarOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import locale from 'antd/locale/vi_VN';
import { ConfigProvider } from 'antd';
import {
    useGetMySchedulesQuery,
    useCheckInMutation,
    useCheckOutMutation,
    DoctorSchedule,
    useAutoUpdateStatusesMutation,
} from '../../api/app_doctor/apiSchedulesDoctor';
import { useGetMyDoctorQuery } from '../../api/app_doctor/apiDoctor';
import { getAccessTokenFromCookie } from '@/utils/token';
import DetailSchedule from './components/detailSchedule';
import toast from 'react-hot-toast';

const { Text } = Typography;
const { RangePicker } = DatePicker;

dayjs.locale('vi');

// helper: safe parse JWT payload (client-side)
function getUserIdFromToken(): string | undefined {
    try {
        const token = getAccessTokenFromCookie();
        if (!token) return undefined;
        const base64Url = token.split('.')[1];
        if (!base64Url) return undefined;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return String(payload?.user_id || payload?.sub || payload?.id);
    } catch {
        return undefined;
    }
}

const DEFAULT_START = '08:00:00';
const DEFAULT_END = '16:30:00';

const SchedulesDoctor: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [filterDateRange, setFilterDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<DoctorSchedule | null>(null);

    const userId = getUserIdFromToken();
    const { data: myDoctorData } = useGetMyDoctorQuery(userId as string, { skip: !userId });
    const doctorId = myDoctorData?.id ? String(myDoctorData.id) : undefined;
    const doctorIdNumber = myDoctorData?.id ? Number(myDoctorData.id) : undefined;

    const [autoUpdateStatuses] = useAutoUpdateStatusesMutation();

    // API: my schedules (no shift filter)
    const { data: schedulesData, isLoading, refetch } = useGetMySchedulesQuery(
        {
            doctor_id: doctorId,
            start_date: filterDateRange ? filterDateRange[0].format('YYYY-MM-DD') : undefined,
            end_date: filterDateRange ? filterDateRange[1].format('YYYY-MM-DD') : undefined,
        },
        { skip: !doctorId }
    );

    // auto update statuses periodically (only when doctorId present)
    useEffect(() => {
        if (!doctorId) return;
        let mounted = true;
        const tick = async () => {
            try {
                await autoUpdateStatuses().unwrap();
                if (mounted) refetch();
            } catch (err) {
                // ignore silently
            }
        };
        tick();
        const iv = setInterval(tick, 60_000); // 60s
        return () => {
            mounted = false;
            clearInterval(iv);
        };
    }, [doctorId, autoUpdateStatuses, refetch]);

    const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
    const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

    const schedules: DoctorSchedule[] = schedulesData?.data || [];

    // compute stats (only total now)
    const stats = useMemo(() => {
        const total = schedules.length;
        return { total };
    }, [schedules]);

    const handleCheckIn = async (id: number) => {
        if (doctorIdNumber === undefined) {
            message.error('Không tìm thấy doctor_id');
            return;
        }
        try {
            await checkIn({ id, doctor_id: doctorIdNumber }).unwrap();
            toast.success('Check-in thành công');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể check-in');
        }
    };

    const handleCheckOut = async (id: number) => {
        if (doctorIdNumber === undefined) {
            message.error('Không tìm thấy doctor_id');
            return;
        }
        try {
            await checkOut({ id, doctor_id: doctorIdNumber }).unwrap();
            toast.success('Check-out thành công');
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể check-out');
        }
    };

    // render for calendar cell: show small badges (one per schedule) with tooltip
    const getCalendarCellContent = (date: Dayjs) => {
        const daySchedules = schedules.filter(s => dayjs(s.date).isSame(date, 'day'));
        if (daySchedules.length === 0) return null;

        return (
            <div style={{ paddingTop: 6 }}>
                {daySchedules.map(sch => {
                    const statusToDot =
                        sch.status === 'in_progress'
                            ? 'processing'
                            : sch.status === 'completed'
                                ? 'success'
                                : sch.status === 'late'
                                    ? 'warning'
                                    : sch.status === 'absent'
                                        ? 'error'
                                        : 'default';

                    // label uses time range (default if absent)
                    const label = `${(sch.start_time || DEFAULT_START).slice(0, 5)} - ${(sch.end_time || DEFAULT_END).slice(0, 5)}`;

                    return (
                        <div key={sch.id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tooltip
                                title={
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontWeight: 700 }}>{label}</div>
                                        <div style={{ marginTop: 6 }}>Phòng: {sch.Room?.name || 'N/A'}</div>
                                        <div>Giờ: {(sch.start_time || DEFAULT_START).slice(0, 5)} - {(sch.end_time || DEFAULT_END).slice(0, 5)}</div>
                                        <div>Trạng thái: {sch.status}</div>
                                    </div>
                                }
                            >
                                <div
                                    onClick={() => {
                                        setSelectedSchedule(sch);
                                        setDetailVisible(true);
                                    }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Badge color={
                                        statusToDot === 'processing' ? '#13c2c2'
                                            : statusToDot === 'success' ? '#52c41a'
                                                : statusToDot === 'warning' ? '#fa8c16'
                                                    : statusToDot === 'error' ? '#ff4d4f'
                                                        : '#d9d9d9'
                                    } />
                                    <div style={{
                                        fontSize: 12,
                                        background: 'rgba(17,169,152,0.06)',
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        color: '#0b5b51',
                                        fontWeight: 600,
                                    }}>
                                        {label}
                                    </div>
                                </div>
                            </Tooltip>
                        </div>
                    );
                })}
            </div>
        );
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (d: string) => dayjs(d).format('DD/MM/YYYY'),
            sorter: (a: DoctorSchedule, b: DoctorSchedule) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            width: 140,
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (record: DoctorSchedule) => (
                <div>
                    <div style={{ fontWeight: 600 }}>
                        {(record.start_time || DEFAULT_START).slice(0, 5)} - {(record.end_time || DEFAULT_END).slice(0, 5)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Tối đa: {record.max_patients ?? 10} bệnh nhân
                    </Text>
                </div>
            ),
            width: 180,
        },
        {
            title: 'Phòng',
            dataIndex: ['Room', 'name'],
            key: 'room',
            render: (roomName: string, record: DoctorSchedule) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{roomName || 'N/A'}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Tầng {record.Room?.floor ?? 'N/A'}
                    </Text>
                </div>
            ),
            width: 180,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    scheduled: { color: 'default', text: 'Đã lên lịch' },
                    in_progress: { color: 'green', text: 'Đang làm' },
                    late: { color: 'orange', text: 'Đến muộn' },
                    left_early: { color: 'gold', text: 'Về sớm' },
                    completed: { color: 'blue', text: 'Hoàn thành' },
                    absent: { color: 'red', text: 'Vắng' },
                    cancelled: { color: 'magenta', text: 'Đã hủy' },
                } as const;
                const cfg = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={cfg?.color} style={{ fontWeight: 600 }}>{cfg?.text || status}</Tag>;
            },
            width: 140,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (record: DoctorSchedule) => {
                const isToday = dayjs(record.date).isSame(dayjs(), 'day');
                const canCheckIn = isToday && !record.check_in_time && record.status !== 'cancelled';
                const canCheckOut = isToday && !!record.check_in_time && !record.check_out_time && record.status !== 'cancelled';
                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleCheckIn(record.id)}
                            loading={isCheckingIn}
                            disabled={!canCheckIn}
                            style={{ borderRadius: 8 }}
                        >
                            Check-in
                        </Button>
                        <Button
                            size="small"
                            icon={<ExportOutlined />}
                            onClick={() => handleCheckOut(record.id)}
                            loading={isCheckingOut}
                            disabled={!canCheckOut}
                            style={{ borderRadius: 8 }}
                        >
                            Check-out
                        </Button>
                        <Button
                            size="small"
                            onClick={() => { setSelectedSchedule(record); setDetailVisible(true); }}
                        >
                            Chi tiết
                        </Button>
                    </Space>
                );
            },
            width: 240,
        },
    ];

    return (
        <ConfigProvider locale={locale}>
            <div style={{ padding: 24 }}>
                {/* Statistics */}
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card style={{
                            borderRadius: 12,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(17,169,152,0.08)',
                            background: 'linear-gradient(180deg, rgba(17,169,152,0.07), #fff)',
                        }}>
                            <Statistic
                                title="Tổng lịch làm việc"
                                value={stats.total}
                                prefix={<CalendarOutlined style={{ color: '#0aa287' }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card style={{
                            borderRadius: 12,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                            border: '1px solid rgba(0,0,0,0.04)',
                            background: '#fff',
                            minHeight: 72,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text type="secondary"> </Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card style={{
                            borderRadius: 12,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                            border: '1px solid rgba(0,0,0,0.04)',
                            background: '#fff',
                            minHeight: 72,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text type="secondary"> </Text>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card style={{
                            borderRadius: 12,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                            border: '1px solid rgba(0,0,0,0.04)',
                            background: '#fff',
                            minHeight: 72,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text type="secondary"> </Text>
                        </Card>
                    </Col>
                </Row>

                {/* Filters */}
                <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
                    <Row gutter={16} align="middle">
                        <Col>
                            <Text strong>Bộ lọc:</Text>
                        </Col>
                        <Col>
                            <RangePicker
                                placeholder={['Từ ngày', 'Đến ngày']}
                                value={filterDateRange}
                                onChange={(dates) => setFilterDateRange(dates as [Dayjs, Dayjs] | null)}
                                format="DD/MM/YYYY"
                            />
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => {
                                        setFilterDateRange(null);
                                        refetch();
                                    }}
                                    style={{ borderRadius: 8 }}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    onClick={() => {
                                        refetch();
                                    }}
                                    style={{ borderRadius: 8 }}
                                >
                                    Lấy lại
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Calendar */}
                <Card title="Xem lịch" style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <Calendar
                        value={selectedDate}
                        onChange={(val) => setSelectedDate(val)}
                        dateCellRender={getCalendarCellContent}
                        headerRender={({ value, onChange }) => (
                            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Space>
                                        <Button size="small" onClick={() => onChange(value.clone().subtract(1, 'month'))} style={{ borderRadius: 6 }}>
                                            Tháng trước
                                        </Button>
                                        <Button size="small" onClick={() => onChange(dayjs())} style={{ borderRadius: 6 }}>
                                            Hôm nay
                                        </Button>
                                        <Button size="small" onClick={() => onChange(value.clone().add(1, 'month'))} style={{ borderRadius: 6 }}>
                                            Tháng sau
                                        </Button>
                                    </Space>
                                </div>
                                <div style={{ fontWeight: 700 }}>
                                    <Text>{value.format('MMMM YYYY')}</Text>
                                </div>
                            </div>
                        )}
                    />
                </Card>

                {/* Table */}
                <Card title="Danh sách lịch làm việc" style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
                    <Table
                        columns={columns}
                        dataSource={schedules}
                        rowKey="id"
                        loading={isLoading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch làm việc`,
                        }}
                        scroll={{ x: '100%', y: 480 }}
                        rowClassName={() => 'hover:bg-white/30'}
                        style={{ borderRadius: 12, overflow: 'hidden' }}
                    />
                </Card>

                <DetailSchedule visible={detailVisible} onClose={() => setDetailVisible(false)} schedule={selectedSchedule} onRefresh={refetch} />
            </div>
        </ConfigProvider>
    );
};

export default SchedulesDoctor;
