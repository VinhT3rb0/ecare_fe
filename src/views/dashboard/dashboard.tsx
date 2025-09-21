"use client";

import { useMemo, useState } from "react";
import { Row, Col, Card, Space, DatePicker, Select, Statistic, Typography, Divider } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";

// Using Ant Design Plots for charts
import { Line, Column, Pie, Area } from "@ant-design/plots";
import { useGetOverviewQuery, useGetRevenueSeriesQuery, useGetInvoicesSeriesQuery, useGetRevenueByDepartmentQuery, useGetTopServicesQuery } from "@/api/app_stats/apiStats";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Period = "day" | "week" | "month" | "quarter" | "year";

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
    const testRevenueData = [
        { time: "2025-07", value: 1100000 },
        { time: "2025-08", value: 13030000 },
        { time: "2025-09", value: 14167480 }
    ];
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
            </Row>

        </Space>
    );
}


