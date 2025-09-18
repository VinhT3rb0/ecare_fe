"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Card, message, Space, Typography, Statistic, Row, Col, Spin, Switch } from "antd";
import { ClockCircleOutlined, MailOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { useAutoCancelOverdueAppointmentsMutation } from "@/api/app_apointment/apiAppointment";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const AutoCancelAppointments: React.FC = () => {
    const [autoCancel, { isLoading }] = useAutoCancelOverdueAppointmentsMutation();
    const [lastRunResult, setLastRunResult] = useState<any>(null);
    const [autoRunEnabled, setAutoRunEnabled] = useState<boolean>(false);
    const [nextRunTime, setNextRunTime] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const autoRunIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Thời gian giữa các lần chạy tự động (15 phút = 900000ms)
    const AUTO_RUN_INTERVAL = 15 * 60 * 1000;

    const handleAutoCancel = async () => {
        try {
            const result = await autoCancel().unwrap();
            setLastRunResult(result.data);
            toast.success(result.message);
            
            // Cập nhật thời gian chạy tiếp theo
            if (autoRunEnabled) {
                const nextRun = new Date(Date.now() + AUTO_RUN_INTERVAL);
                setNextRunTime(nextRun);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Có lỗi xảy ra khi chạy auto cancel");
        }
    };
    
    // Xử lý bật/tắt chế độ tự động
    useEffect(() => {
        if (autoRunEnabled) {
            // Thiết lập thời gian chạy tiếp theo
            const nextRun = new Date(Date.now() + AUTO_RUN_INTERVAL);
            setNextRunTime(nextRun);
            
            // Thiết lập interval để tự động chạy
            autoRunIntervalRef.current = setInterval(() => {
                handleAutoCancel();
            }, AUTO_RUN_INTERVAL);
            
            // Thiết lập interval để cập nhật thời gian còn lại
            intervalRef.current = setInterval(() => {
                if (nextRunTime) {
                    const now = new Date();
                    const diff = nextRunTime.getTime() - now.getTime();
                    
                    if (diff <= 0) {
                        setTimeRemaining("Đang chạy...");
                    } else {
                        const minutes = Math.floor(diff / 60000);
                        const seconds = Math.floor((diff % 60000) / 1000);
                        setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
                    }
                }
            }, 1000);
        } else {
            // Xóa các interval khi tắt chế độ tự động
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            
            if (autoRunIntervalRef.current) {
                clearInterval(autoRunIntervalRef.current);
                autoRunIntervalRef.current = null;
            }
            
            setNextRunTime(null);
            setTimeRemaining("");
        }
        
        // Cleanup khi component unmount
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (autoRunIntervalRef.current) clearInterval(autoRunIntervalRef.current);
        };
    }, [autoRunEnabled]);

    return (
        <div style={{ padding: 24 }}>
            <Card>
                <Title level={3} style={{ color: "#0b6e64", marginBottom: 24 }}>
                    <ClockCircleOutlined /> Tự động hủy lịch hẹn quá giờ
                </Title>

                <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                    Hệ thống sẽ tự động hủy các lịch hẹn quá giờ (trễ hơn 30 phút) và gửi email thông báo cho bệnh nhân.
                    Cron job chạy tự động mỗi 15 phút.
                </Text>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ClockCircleOutlined />}
                            loading={isLoading}
                            onClick={handleAutoCancel}
                            style={{ background: "#0b6e64", borderColor: "#0b6e64" }}
                        >
                            Chạy thủ công ngay
                        </Button>
                    </Col>
                    <Col>
                        <Space align="center">
                            <Switch 
                                checked={autoRunEnabled} 
                                onChange={setAutoRunEnabled} 
                                loading={isLoading}
                            />
                            <Text strong>Tự động chạy mỗi 15 phút</Text>
                            {autoRunEnabled && nextRunTime && (
                                <Text type="secondary">
                                    <SyncOutlined spin /> Lần chạy tiếp theo: {timeRemaining}
                                </Text>
                            )}
                        </Space>
                    </Col>
                </Row>

                {lastRunResult && (
                    <Card style={{ marginTop: 16, background: "#f6ffed", border: "1px solid #b7eb8f" }}>
                        <Title level={4} style={{ color: "#52c41a", marginBottom: 16 }}>
                            <CheckCircleOutlined /> Kết quả lần chạy cuối
                        </Title>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic
                                    title="Số lịch đã hủy"
                                    value={lastRunResult.cancelledCount}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: "#52c41a" }}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Email đã gửi"
                                    value={lastRunResult.cancelledCount}
                                    prefix={<MailOutlined />}
                                    valueStyle={{ color: "#1890ff" }}
                                />
                            </Col>
                        </Row>

                        {lastRunResult.cancelledAppointments && lastRunResult.cancelledAppointments.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Title level={5}>Danh sách lịch đã hủy:</Title>
                                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {lastRunResult.cancelledAppointments.map((apt: any, index: number) => (
                                        <div key={apt.id} style={{
                                            padding: 8,
                                            margin: '4px 0',
                                            background: '#fff',
                                            borderRadius: 4,
                                            border: '1px solid #d9d9d9'
                                        }}>
                                            <Text strong>{apt.patient_name}</Text> - {apt.doctor_name} - {apt.appointment_date} {apt.time_slot}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                <Card style={{ marginTop: 16, background: "#fff7e6", border: "1px solid #ffd591" }}>
                    <Title level={5} style={{ color: "#d46b08" }}>Thông tin hệ thống:</Title>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li><Text>Hệ thống tự động chạy mỗi 15 phút</Text></li>
                        <li><Text>Chỉ hủy lịch có trạng thái "pending" hoặc "confirmed"</Text></li>
                        <li><Text>Cho phép trễ tối đa 30 phút trước khi hủy</Text></li>
                        <li><Text>Tự động gửi email thông báo cho bệnh nhân</Text></li>
                        <li><Text>Không hủy lịch đang điều trị hoặc đã hoàn thành</Text></li>
                    </ul>
                </Card>
            </Card>
        </div>
    );
};

export default AutoCancelAppointments;
