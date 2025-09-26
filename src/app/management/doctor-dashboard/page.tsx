"use client";

import { Card, Col, Row, Statistic, Typography, List, Tag, Space, Avatar, DatePicker, Select } from "antd";
import { Line } from "@ant-design/plots";
import RequireRole from "@/constants/requireRole";
import RequireAuth from "@/constants/requireAuth";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useGetDoctorAppointmentsSeriesQuery, useGetDoctorOverviewQuery, useGetDoctorUpcomingQuery } from "@/api/app_stats/apiStats";
import { getCookie } from "cookies-next";

export default function DoctorDashboardPage() {

    type Period = 'month' | 'year';
    const [period, setPeriod] = useState<Period>('month');
    const [current, setCurrent] = useState(dayjs());

    const range = useMemo(() => {
        if (period === 'year') {
            return {
                from: current.startOf('year').format('YYYY-MM-DD'),
                to: current.endOf('year').format('YYYY-MM-DD'),
            };
        }
        return {
            from: current.startOf('month').format('YYYY-MM-DD'),
            to: current.endOf('month').format('YYYY-MM-DD'),
        };
    }, [period, current]);

    const { data: overview } = useGetDoctorOverviewQuery({ ...range });
    const { data: upcoming } = useGetDoctorUpcomingQuery({ limit: 6 });
    const granularity = period === 'year' ? 'month' : 'day';
    const { data: apptSeries } = useGetDoctorAppointmentsSeriesQuery({ ...range, granularity });

    const kpis = overview?.data || { appointmentsInRange: 0, inTreatment: 0, completedInRange: 0, avgRating: 0 };
    const upcomingList = upcoming?.data || [];

    return (
        <RequireAuth>
            <RequireRole allow={["doctor"]}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <div>
                                <Typography.Title level={3} style={{ margin: 0 }}>Bảng điều khiển bác sĩ</Typography.Title>
                                <Typography.Text type="secondary">Khoảng: {range.from} - {range.to}</Typography.Text>
                            </div>
                            <Space>
                                <Select
                                    value={period}
                                    onChange={(v) => setPeriod(v as Period)}
                                    options={[{ value: 'month', label: 'Theo tháng' }, { value: 'year', label: 'Theo năm' }]}
                                    style={{ width: 130 }}
                                />
                                {period === 'month' ? (
                                    <DatePicker
                                        picker="month"
                                        value={current}
                                        onChange={(v) => v && setCurrent(v)}
                                    />
                                ) : (
                                    <DatePicker
                                        picker="year"
                                        value={current}
                                        onChange={(v) => v && setCurrent(v)}
                                    />
                                )}
                            </Space>
                        </Space>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title={period === 'month' ? 'Lịch hẹn trong tháng' : 'Lịch hẹn trong năm'} value={kpis.appointmentsInRange} suffix={<Tag color="blue">hẹn</Tag>} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title="Đang điều trị" value={kpis.inTreatment} suffix={<Tag color="green">bệnh nhân</Tag>} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title={period === 'month' ? 'Hoàn thành trong tháng' : 'Hoàn thành trong năm'} value={kpis.completedInRange} suffix={<Tag color="purple">ca</Tag>} />
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

                    <Col xs={24}>
                        <Card title="Biểu đồ lịch hẹn">
                            <Line
                                data={(apptSeries?.data || []).map((d: any) => ({ time: d.time, value: d.value }))}
                                xField="time"
                                yField="value"
                                height={280}
                                point={{ size: 3 }}
                                xAxis={{ tickCount: 8 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </RequireRole>
        </RequireAuth>
    );
}
