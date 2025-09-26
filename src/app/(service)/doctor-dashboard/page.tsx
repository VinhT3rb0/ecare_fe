"use client";

import { Card, Col, Row, Statistic, Typography, List, Tag, Space, Avatar } from "antd";
import RequireRole from "@/constants/requireRole";
import RequireAuth from "@/constants/requireAuth";
import { useMemo } from "react";
import dayjs from "dayjs";
import { useGetDoctorOverviewQuery, useGetDoctorUpcomingQuery } from "@/api/app_stats/apiStats";
import { getCookie } from "cookies-next";

export default function DoctorDashboardPage() {
    const doctorId = useMemo(() => {
        const id = getCookie("doctor_id");
        return id ? Number(id) : undefined;
    }, []);

    const range = useMemo(() => ({
        from: dayjs().startOf('month').format('YYYY-MM-DD'),
        to: dayjs().endOf('month').format('YYYY-MM-DD'),
    }), []);

    const { data: overview } = useGetDoctorOverviewQuery(doctorId ? { doctor_id: doctorId, ...range } : undefined, { skip: !doctorId });
    const { data: upcoming } = useGetDoctorUpcomingQuery(doctorId ? { doctor_id: doctorId, limit: 6 } : undefined, { skip: !doctorId });

    const kpis = overview?.data || { todayAppointments: 0, inTreatment: 0, completedToday: 0, avgRating: 0 };
    const upcomingList = upcoming?.data || [];

    return (
        <RequireAuth>
            <RequireRole allow={["doctor"]}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Typography.Title level={3} style={{ margin: 0 }}>Bảng điều khiển bác sĩ</Typography.Title>
                        <Typography.Text type="secondary">Tổng quan nhanh về lịch hẹn và bệnh nhân của bạn</Typography.Text>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Lịch hẹn hôm nay" value={kpis.todayAppointments} suffix={<Tag color="blue">hẹn</Tag>} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Đang điều trị" value={kpis.inTreatment} suffix={<Tag color="green">bệnh nhân</Tag>} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Hoàn thành hôm nay" value={kpis.completedToday} suffix={<Tag color="purple">ca</Tag>} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Đánh giá trung bình" value={Number(kpis.avgRating)} precision={2} suffix="⭐" />
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Lịch hẹn sắp tới">
                            <List
                                dataSource={upcomingList}
                                locale={{ emptyText: "Chưa có lịch hẹn" }}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar>{item.patient_name?.charAt(0)?.toUpperCase()}</Avatar>}
                                            title={<Typography.Text strong>{item.patient_name}</Typography.Text>}
                                            description={<Typography.Text type="secondary">{dayjs(item.date).format('DD/MM/YYYY')} • {item.time}</Typography.Text>}
                                        />
                                        <Tag>{item.patient_phone}</Tag>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Ghi chú gần đây">
                            <List
                                dataSource={[]}
                                locale={{ emptyText: "Chưa có ghi chú" }}
                                renderItem={(note: any) => (
                                    <List.Item>
                                        <Typography.Text>{note.content}</Typography.Text>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </RequireRole>
        </RequireAuth>
    );
}
