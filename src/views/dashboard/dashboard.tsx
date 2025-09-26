"use client";

import { useMemo, useState } from "react";
import { Row, Col, Card, Space, DatePicker, Select, Statistic, Typography, Divider, List, Avatar, Rate, Tag } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";

// Using Ant Design Plots for charts
import { Line, Column, Pie, Area } from "@ant-design/plots";
import { useGetOverviewQuery, useGetRevenueSeriesQuery, useGetInvoicesSeriesQuery, useGetRevenueByDepartmentQuery, useGetTopServicesQuery } from "@/api/app_stats/apiStats";
import { useGetTopDoctorsByRatingQuery } from "@/api/app_review/apiReview";


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Period = "day" | "week" | "month" | "quarter" | "year";

interface TopDoctor {
    doctor_id: number;
    doctor_name: string;
    doctor_avatar: string;
    avg_rating: string;
    total_reviews: number;
}

// Mock data generators (replace with real API later)
function generateTimeSeries(period: Period, from: Dayjs, to: Dayjs, key: string) {
    const diff = to.diff(from, period === "day" ? "hour" : "day");
    const count = Math.max(8, Math.min(60, diff));
    const data: Array<{ time: string; value: number; category?: string }> = [];
    for (let i = 0; i < count; i++) {
        const t =
            period === "day"
                ? from.add(i, "hour").format("HH:mm")
                : from.add(i, "day").format("DD/MM");
        data.push({ time: t, value: Math.round(50 + Math.random() * 200) });
    }
    return data.map((d) => ({ ...d, category: key }));
}

function generateCategoryData(label: string, items = 6) {
    return Array.from({ length: items }).map((_, idx) => ({
        type: `${label} ${idx + 1}`,
        value: Math.round(100 + Math.random() * 900),
    }));
}

export default function Dashboard() {
    const [period, setPeriod] = useState<Period>("year");
    const [range, setRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf("year"),
        dayjs().endOf("year"),
    ]);

    const onRangeChange: RangePickerProps["onChange"] = (v) => {
        if (v && v[0] && v[1]) setRange([v[0], v[1]]);
    };

    const params = useMemo(() => ({
        from: range[0].format('YYYY-MM-DD'),
        to: range[1].format('YYYY-MM-DD'),
    }), [range]);

    const granularity = useMemo(() => (period === 'month' || period === 'year' || period === 'quarter') ? 'month' : 'day', [period]);
    const { data: overview } = useGetOverviewQuery(params);
    const { data: revenueData } = useGetRevenueSeriesQuery({ ...params, granularity });
    const { data: invoicesData } = useGetInvoicesSeriesQuery({ ...params, granularity });
    const { data: deptData } = useGetRevenueByDepartmentQuery(params);
    const { data: topServices } = useGetTopServicesQuery({ ...params, limit: 6 });
    const { data: topDoctors } = useGetTopDoctorsByRatingQuery({ ...params, limit: 3 });
    const kpis = useMemo(() => {
        return {
            revenue: overview?.data?.revenue ?? 0,
            invoices: overview?.data?.invoices ?? 0,
            appointments: overview?.data?.appointments ?? 0,
            conversion: 0,
            revenueDelta: 0,
            invoicesDelta: 0,
        };
    }, [overview]);

    const revenueSeries = useMemo(() => revenueData?.data ?? [], [revenueData]);
    console.log(revenueSeries);

    const invoicesSeries = useMemo(() => invoicesData?.data ?? [], [invoicesData]);
    const departmentCategory = useMemo(() => deptData?.data ?? [], [deptData]);
    const servicesCategory = useMemo(() => topServices?.data ?? [], [topServices]);
    const topDoctorsData = useMemo(() => (topDoctors?.data as TopDoctor[]) ?? [], [topDoctors]);

    return (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card style={{ borderRadius: 8 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Title level={3} style={{ margin: 0 }}>Tổng quan hoạt động</Title>
                        <Text type="secondary">Khoảng thời gian: {range[0].format("DD/MM/YYYY")} - {range[1].format("DD/MM/YYYY")}</Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: "right" }}>
                        <Space wrap>
                            <Select
                                value={period}
                                onChange={(v) => setPeriod(v as Period)}
                                options={[
                                    { value: "day", label: "Theo ngày" },
                                    { value: "week", label: "Theo tuần" },
                                    { value: "month", label: "Theo tháng" },
                                    { value: "quarter", label: "Theo quý" },
                                    { value: "year", label: "Theo năm" },
                                ]}
                                style={{ width: 140 }}
                            />
                            <RangePicker allowClear={false} value={range} onChange={onRangeChange} />
                        </Space>
                    </Col>
                </Row>
            </Card>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu"
                            value={kpis.revenue}
                            precision={0}
                            prefix="₫"
                            valueStyle={{ color: kpis.revenueDelta >= 0 ? "#3f8600" : "#cf1322" }}
                            suffix={
                                <span style={{ whiteSpace: "nowrap" }}>
                                    {kpis.revenueDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(kpis.revenueDelta)}%
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Số hóa đơn"
                            value={kpis.invoices}
                            suffix={
                                <span style={{ whiteSpace: "nowrap" }}>
                                    {kpis.invoicesDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(kpis.invoicesDelta)}%
                                </span>
                            }
                            valueStyle={{ color: kpis.invoicesDelta >= 0 ? "#3f8600" : "#cf1322" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Lịch hẹn" value={kpis.appointments} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic title="Tỉ lệ chuyển đổi" value={kpis.conversion} suffix="%" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Biểu đồ doanh thu">
                        <Area data={revenueSeries} xField="time" yField="value" height={350} />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card
                        title="Cơ cấu doanh thu theo khoa"
                        style={{ minHeight: 400 }}
                    >
                        <Pie
                            data={departmentCategory}
                            angleField="value"
                            colorField="type"
                            height={350}
                            radius={0.8}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Số lượng hóa đơn">
                        <Line
                            data={invoicesSeries}
                            xField="time"
                            yField="value"
                            height={260}
                            point={{ size: 3, shape: "circle" }}
                            color="#52c41a"
                            xAxis={{ tickCount: 8 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card
                        title="Top bác sĩ được đánh giá cao"
                        extra={<Text type="secondary">Top {topDoctorsData.length} bác sĩ</Text>}
                    >
                        <List
                            dataSource={topDoctorsData}
                            renderItem={(doctor: TopDoctor, index: number) => (
                                <List.Item
                                    style={{
                                        padding: '12px 0',
                                        borderBottom: index < topDoctorsData.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div style={{ position: 'relative' }}>
                                                <Avatar
                                                    src={doctor.doctor_avatar}
                                                    size={48}
                                                    style={{
                                                        border: index < 3 ? '3px solid' : '1px solid #d9d9d9',
                                                        borderColor: index === 0 ? '#f56a00' : index === 1 ? '#87d068' : index === 2 ? '#2db7f5' : '#d9d9d9'
                                                    }}
                                                >
                                                    {!doctor.doctor_avatar && doctor.doctor_name?.charAt(0)?.toUpperCase()}
                                                </Avatar>
                                                {index < 3 && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            backgroundColor: index === 0 ? '#f56a00' : index === 1 ? '#87d068' : '#2db7f5',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontSize: '12px',
                                                            fontWeight: 'bold',
                                                            border: '2px solid white'
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                )}
                                            </div>
                                        }
                                        title={
                                            <Space>
                                                <Text strong style={{ fontSize: '16px' }}>{doctor.doctor_name}</Text>
                                                <Tag color="blue" style={{ fontSize: '12px' }}>ID: {doctor.doctor_id}</Tag>
                                                {index < 3 && (
                                                    <Tag
                                                        color={index === 0 ? 'gold' : index === 1 ? 'default' : 'orange'}
                                                        style={{ fontSize: '11px', fontWeight: 'bold' }}
                                                    >
                                                        #{index + 1}
                                                    </Tag>
                                                )}
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={6} style={{ marginTop: 8 }}>
                                                <Rate
                                                    disabled
                                                    value={parseFloat(doctor.avg_rating)}
                                                    style={{ fontSize: 16 }}
                                                    allowHalf
                                                />
                                                <Space>
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        <strong>{doctor.avg_rating}</strong> ⭐
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                                        • {doctor.total_reviews} đánh giá
                                                    </Text>
                                                </Space>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Dịch vụ sử dụng nhiều nhất">
                        <Column
                            data={servicesCategory}
                            xField="type"
                            yField="value"
                            height={260}
                            columnWidthRatio={0.6}
                            xAxis={{ label: { autoHide: true, autoRotate: false } }}
                            meta={{ value: { alias: "Lượt sử dụng" } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Thống kê bổ sung">
                        <Space direction="vertical" size={20} style={{ width: "100%" }}>
                            <div style={{ textAlign: 'center' }}>
                                <Statistic
                                    title="Tổng số bác sĩ"
                                    value={topDoctorsData.length}
                                    suffix="bác sĩ"
                                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                                />
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div style={{ textAlign: 'center' }}>
                                <Statistic
                                    title="Đánh giá trung bình"
                                    value={topDoctorsData.length > 0 ?
                                        (topDoctorsData.reduce((sum: number, doctor: TopDoctor) => sum + parseFloat(doctor.avg_rating), 0) / topDoctorsData.length).toFixed(2)
                                        : "0"
                                    }
                                    suffix="⭐"
                                    precision={2}
                                    valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                                />
                            </div>
                            {topDoctorsData.length > 0 && (
                                <>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <div style={{ textAlign: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Dựa trên {topDoctorsData.reduce((sum: number, doctor: TopDoctor) => sum + doctor.total_reviews, 0)} đánh giá tổng cộng
                                        </Text>
                                    </div>
                                </>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

        </Space>
    );
}


