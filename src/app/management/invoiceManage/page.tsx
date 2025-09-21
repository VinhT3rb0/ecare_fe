"use client";

import { useState } from "react";
import {
    Table,
    Button,
    Input,
    Select,
    Space,
    Tag,
    Typography,
    Card,
    Row,
    Col,
    message,
    Popconfirm,
    Tooltip
} from "antd";
import {
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { useGetInvoicesQuery, useGetInvoiceByIdQuery } from "@/api/app_invoice/apiInvoice";
import InvoiceDetailModal from "./components/InvoiceDetailModal";

const { Title } = Typography;
const { Option } = Select;

export default function InvoiceManagePage() {
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // Fetch invoices list
    const { data, error, isLoading, refetch } = useGetInvoicesQuery({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });

    // Fetch detailed invoice when modal is opened
    const {
        data: invoiceDetail,
        error: invoiceDetailError,
        isLoading: isInvoiceDetailLoading
    } = useGetInvoiceByIdQuery(selectedInvoiceId!, {
        skip: !selectedInvoiceId || !isDetailModalVisible,
    });

    const invoices = data?.data || [];
    const total = data?.total || 0;

    // Handle search and filter
    const handleSearch = () => {
        setPagination({ ...pagination, current: 1 });
        refetch();
    };

    const handleReset = () => {
        setSearchText("");
        setStatusFilter("all");
        setPaymentMethodFilter("all");
        setPagination({ current: 1, pageSize: 10 });
        refetch();
    };

    // Handle table actions
    const handleViewDetail = (invoice: any) => {
        setSelectedInvoiceId(invoice.id);
        setIsDetailModalVisible(true);
    };


    // Table columns
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
            sorter: (a: any, b: any) => a.id - b.id,
        },
        {
            title: "Bệnh nhân",
            key: "patient_name",
            render: (record: any) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{record.Appointment?.patient_name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                        {record.Appointment?.patient_phone}
                    </div>
                </div>
            ),
            width: 200,
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
            width: 120,
            sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        },
        {
            title: "Tổng tiền",
            key: "total_amount",
            render: (record: any) => {
                // Calculate total amount from packages and medicines
                const packageTotal = (record.invoicePackages || []).reduce((sum: number, ip: any) => {
                    const price = Number(ip.price);
                    const discount = Number(ip.package?.discount || 0);
                    const insurancePay = record.has_insurance ? (price * discount / 100) * ip.quantity : 0;
                    const gross = price * ip.quantity;
                    return sum + (gross - insurancePay);
                }, 0);

                const medicineTotal = (record.invoiceMedicines || []).reduce((sum: number, im: any) => {
                    return sum + (Number(im.price) * Number(im.quantity || 0));
                }, 0);

                return (
                    <div style={{ fontWeight: 500, color: "#1890ff" }}>
                        {(packageTotal + medicineTotal).toLocaleString('vi-VN')} đ
                    </div>
                );
            },
            width: 150,
            sorter: (a: any, b: any) => {
                const getTotal = (record: any) => {
                    const packageTotal = (record.invoicePackages || []).reduce((sum: number, ip: any) => {
                        const price = Number(ip.price);
                        const discount = Number(ip.package?.discount || 0);
                        const insurancePay = record.has_insurance ? (price * discount / 100) * ip.quantity : 0;
                        const gross = price * ip.quantity;
                        return sum + (gross - insurancePay);
                    }, 0);

                    const medicineTotal = (record.invoiceMedicines || []).reduce((sum: number, im: any) => {
                        return sum + (Number(im.price) * Number(im.quantity || 0));
                    }, 0);

                    return packageTotal + medicineTotal;
                };
                return getTotal(a) - getTotal(b);
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === 'paid' ? 'green' : 'red'}>
                    {status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Tag>
            ),
            width: 120,
            filters: [
                { text: 'Đã thanh toán', value: 'paid' },
                { text: 'Chưa thanh toán', value: 'unpaid' },
            ],
            onFilter: (value: any, record: any) => record.status === value,
        },
        {
            title: "Phương thức",
            dataIndex: "payment_method",
            key: "payment_method",
            render: (method: string) => {
                if (!method) return <Tag color="default">Chưa chọn</Tag>;
                const colors = {
                    'Momo': '#E91E63',
                    'VNPay': '#1890ff',
                    'Cash': '#52C41A'
                };
                return (
                    <Tag color={colors[method as keyof typeof colors] || 'default'}>
                        {method}
                    </Tag>
                );
            },
            width: 120,
            filters: [
                { text: 'MoMo', value: 'Momo' },
                { text: 'VNPay', value: 'VNPay' },
                { text: 'Tiền mặt', value: 'Cash' },
            ],
            onFilter: (value: any, record: any) => record.payment_method === value,
        },
        {
            title: "BHYT",
            dataIndex: "has_insurance",
            key: "has_insurance",
            render: (hasInsurance: boolean) => (
                <Tag color={hasInsurance ? 'blue' : 'default'}>
                    {hasInsurance ? 'Có' : 'Không'}
                </Tag>
            ),
            width: 80,
            filters: [
                { text: 'Có BHYT', value: true },
                { text: 'Không BHYT', value: false },
            ],
            onFilter: (value: any, record: any) => record.has_insurance === value,
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 150,
            render: (record: any) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    {record.status === 'unpaid' && (
                        <Tooltip title="Thanh toán">
                            <Button
                                type="link"
                                size="small"
                                onClick={() => window.open(`/management/payment/${record.id}`, '_blank')}
                                style={{ color: '#1890ff' }}
                            >
                                Thanh toán
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0, marginBottom: 16 }}>
                        📋 Quản lý hóa đơn
                    </Title>

                    {/* Search and Filter Bar */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Input
                                placeholder="Tìm kiếm theo tên bệnh nhân..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Trạng thái"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">Tất cả</Option>
                                <Option value="paid">Đã thanh toán</Option>
                                <Option value="unpaid">Chưa thanh toán</Option>
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Select
                                placeholder="Phương thức"
                                value={paymentMethodFilter}
                                onChange={setPaymentMethodFilter}
                                style={{ width: '100%' }}
                            >
                                <Option value="all">Tất cả</Option>
                                <Option value="Momo">MoMo</Option>
                                <Option value="VNPay">VNPay</Option>
                                <Option value="Cash">Tiền mặt</Option>
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    {/* Summary Cards */}
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                        {total}
                                    </div>
                                    <div>Tổng hóa đơn</div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52C41A' }}>
                                        {invoices.filter((inv: any) => inv.status === 'paid').length}
                                    </div>
                                    <div>Đã thanh toán</div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF4D4F' }}>
                                        {invoices.filter((inv: any) => inv.status === 'unpaid').length}
                                    </div>
                                    <div>Chưa thanh toán</div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card size="small">
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ED1' }}>
                                        {invoices.reduce((sum: number, inv: any) => {
                                            const packageTotal = (inv.invoicePackages || []).reduce((pSum: number, ip: any) => {
                                                const price = Number(ip.price);
                                                const discount = Number(ip.package?.discount || 0);
                                                const insurancePay = inv.has_insurance ? (price * discount / 100) * ip.quantity : 0;
                                                const gross = price * ip.quantity;
                                                return pSum + (gross - insurancePay);
                                            }, 0);

                                            const medicineTotal = (inv.invoiceMedicines || []).reduce((mSum: number, im: any) => {
                                                return mSum + (Number(im.price) * Number(im.quantity || 0));
                                            }, 0);

                                            return sum + packageTotal + medicineTotal;
                                        }, 0).toLocaleString('vi-VN')} đ
                                    </div>
                                    <div>Tổng doanh thu</div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Invoices Table */}
                <Table
                    columns={columns}
                    dataSource={invoices}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} hóa đơn`,
                        onChange: (page, pageSize) => {
                            setPagination({ current: page, pageSize: pageSize || 10 });
                        },
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
            <InvoiceDetailModal
                visible={isDetailModalVisible}
                invoice={invoiceDetail?.data}
                isLoading={isInvoiceDetailLoading}
                error={invoiceDetailError}
                onClose={() => {
                    setIsDetailModalVisible(false);
                    setSelectedInvoiceId(null);
                }}
                onRefresh={() => {
                    refetch();
                }}
            />
        </>
    );
}
