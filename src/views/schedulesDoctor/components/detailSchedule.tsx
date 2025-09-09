'use client';

import React from 'react';
import {
    Modal,
    Card,
    Row,
    Col,
    Tag,
    Typography,
    Divider,
    Space,
    Button,
    message
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    HomeOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ExportOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { DoctorSchedule, useCheckInMutation, useCheckOutMutation } from '@/api/app_doctor/apiSchedulesDoctor';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

interface DetailScheduleProps {
    visible: boolean;
    onClose: () => void;
    schedule: DoctorSchedule | null;
    onRefresh?: () => void;
}

const DetailSchedule: React.FC<DetailScheduleProps> = ({
    visible,
    onClose,
    schedule,
    onRefresh
}) => {
    const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();
    const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation();

    if (!schedule) return null;

    const handleCheckIn = async () => {
        try {
            await checkIn({ id: schedule.id, doctor_id: schedule.doctor_id }).unwrap();
            toast.success('Check-in thành công');
            onRefresh?.();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể check-in');
        }
    };

    const handleCheckOut = async () => {
        try {
            await checkOut({ id: schedule.id, doctor_id: schedule.doctor_id }).unwrap();
            toast.success('Check-out thành công');
            onRefresh?.();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Không thể check-out');
        }
    };
    const getStatusConfig = (status: string) => {
        const configs = {
            scheduled: { color: 'default', text: 'Đã lên lịch' },
            in_progress: { color: 'green', text: 'Đang làm' },
            late: { color: 'orange', text: 'Đến muộn' },
            left_early: { color: 'gold', text: 'Về sớm' },
            completed: { color: 'blue', text: 'Hoàn thành' },
            absent: { color: 'red', text: 'Vắng' },
            cancelled: { color: 'magenta', text: 'Đã hủy' }
        } as const;
        return configs[status as keyof typeof configs] || { color: 'default', text: status };
    };

    const isToday = dayjs(schedule.date).isSame(dayjs(), 'day');
    const canCheckIn = isToday && !schedule.check_in_time && schedule.status !== 'cancelled';
    const canCheckOut = isToday && !!schedule.check_in_time && !schedule.check_out_time && schedule.status !== 'cancelled';

    const statusConfig = getStatusConfig(schedule.status);

    return (
        <Modal
            title={
                <Space>
                    <CalendarOutlined />
                    <span>Chi tiết lịch làm việc</span>
                </Space>
            }
            open={visible}
            onCancel={onClose}
            width={600}
            footer={
                <div className="flex justify-between">
                    <div>
                        {(canCheckIn || canCheckOut) && (
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    onClick={handleCheckIn}
                                    loading={isCheckingIn}
                                    disabled={!canCheckIn}
                                >
                                    Check-in
                                </Button>
                                <Button
                                    icon={<ExportOutlined />}
                                    onClick={handleCheckOut}
                                    loading={isCheckingOut}
                                    disabled={!canCheckOut}
                                >
                                    Check-out
                                </Button>
                            </Space>
                        )}
                    </div>
                    <Button onClick={onClose}>Đóng</Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Thông tin cơ bản */}
                <Card size="small" title="Thông tin cơ bản">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Space direction="vertical" size="small" className="w-full">
                                <div className="flex items-center gap-2">
                                    <CalendarOutlined className="text-blue-500" />
                                    <Text strong>Ngày làm việc:</Text>
                                </div>
                                <Text className="ml-6">
                                    {dayjs(schedule.date).format('dddd, DD/MM/YYYY')}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" size="small" className="w-full">
                                <div className="flex items-center gap-2">
                                    <HomeOutlined className="text-green-500" />
                                    <Text strong>Phòng:</Text>
                                </div>
                                <Text className="ml-6">
                                    {schedule.Room?.name || 'N/A'}
                                    {schedule.Room?.floor && (
                                        <Text type="secondary"> - Tầng {schedule.Room.floor}</Text>
                                    )}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" size="small" className="w-full">
                                <div className="flex items-center gap-2">
                                    <UserOutlined className="text-purple-500" />
                                    <Text strong>Trạng thái:</Text>
                                </div>
                                <div className="ml-6">
                                    <Tag color={statusConfig.color}>
                                        {statusConfig.text}
                                    </Tag>
                                </div>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Thời gian */}
                <Card size="small" title="Thời gian">
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Space direction="vertical" size="small" className="w-full">
                                <Text strong>Giờ làm việc:</Text>
                                <Text className="ml-4">
                                    {schedule.start_time || 'N/A'} - {schedule.end_time || 'N/A'}
                                </Text>
                            </Space>
                        </Col>
                        <Col span={12}>
                            <Space direction="vertical" size="small" className="w-full">
                                <Text strong>Số bệnh nhân tối đa:</Text>
                                <Text className="ml-4">
                                    {schedule.max_patients || 'Không giới hạn'} bệnh nhân
                                </Text>
                            </Space>
                        </Col>
                        {schedule.check_in_time && (
                            <Col span={12}>
                                <Space direction="vertical" size="small" className="w-full">
                                    <Text strong>Thời gian check-in:</Text>
                                    <Text className="ml-4" type="success">
                                        {dayjs(schedule.check_in_time).format('HH:mm:ss DD/MM/YYYY')}
                                    </Text>
                                </Space>
                            </Col>
                        )}
                        {schedule.check_out_time && (
                            <Col span={12}>
                                <Space direction="vertical" size="small" className="w-full">
                                    <Text strong>Thời gian check-out:</Text>
                                    <Text className="ml-4" type="warning">
                                        {dayjs(schedule.check_out_time).format('HH:mm:ss DD/MM/YYYY')}
                                    </Text>
                                </Space>
                            </Col>
                        )}
                    </Row>
                </Card>

                {/* Ghi chú */}
                {schedule.notes && (
                    <Card size="small" title={
                        <Space>
                            <FileTextOutlined />
                            <span>Ghi chú</span>
                        </Space>
                    }>
                        <Text>{schedule.notes}</Text>
                    </Card>
                )}

                {/* Thông tin hệ thống */}
                <Card size="small" title="Thông tin hệ thống">
                    <Row gutter={[16, 8]}>
                        <Col span={12}>
                            <Text type="secondary">Tạo lúc:</Text>
                            <br />
                            <Text className="text-xs">
                                {dayjs(schedule.created_at).format('HH:mm:ss DD/MM/YYYY')}
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Text type="secondary">Cập nhật lúc:</Text>
                            <br />
                            <Text className="text-xs">
                                {dayjs(schedule.updated_at).format('HH:mm:ss DD/MM/YYYY')}
                            </Text>
                        </Col>
                    </Row>
                </Card>
            </div>
        </Modal>
    );
};

export default DetailSchedule;
