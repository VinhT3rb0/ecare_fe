"use client";

import { Modal, Typography, Descriptions, Tag, Table, Card, Divider, Button, Space, message, Row, Col, Spin, Alert } from "antd";
import { FilePdfOutlined, DollarOutlined } from "@ant-design/icons";
import { useCreateCashPaymentMutation } from "@/api/app_payment/apiPayment";
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Roboto',
    fonts: [
        {
            src: '/fonts/Roboto-VariableFont_wdth,wght.ttf',
            fontWeight: 'normal'
        },
        {
            src: '/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf',
            fontWeight: 'bold'
        }
    ]
});
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Roboto',
    },
    header: {
        textAlign: 'center',
        marginBottom: 30,
        borderBottom: '2 solid #333333',
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1890ff',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333333',
        backgroundColor: '#f0f0f0',
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        width: '30%',
    },
    value: {
        fontSize: 10,
        width: '70%',
    },
    table: {
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderBottom: '1 solid #ddd',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: '1 solid #eee',
    },
    tableCell: {
        fontSize: 9,
        flex: 1,
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        flex: 1,
    },
    summary: {
        backgroundColor: '#f6ffed',
        padding: 15,
        border: '2 solid #52C41A',
        marginTop: 20,
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'right',
        color: '#FF4D4F',
        marginTop: 10,
    },
    footer: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 8,
        color: '#666666',
    },
});

interface InvoiceDetailModalProps {
    visible: boolean;
    invoice: any;
    isLoading?: boolean;
    error?: any;
    onClose: () => void;
    onRefresh?: () => void;
}

export default function InvoiceDetailModal({ visible, invoice, isLoading, error, onClose, onRefresh }: InvoiceDetailModalProps) {
    const [createCashPayment, { isLoading: isCreatingCash }] = useCreateCashPaymentMutation();

    // Handle loading state
    if (isLoading) {
        return (
            <Modal
                title="Đang tải..."
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Đang tải thông tin hóa đơn...</p>
                </div>
            </Modal>
        );
    }

    // Handle error state
    if (error) {
        return (
            <Modal
                title="Lỗi"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ]}
            >
                <Alert
                    message="Không thể tải thông tin hóa đơn"
                    description="Vui lòng thử lại sau hoặc liên hệ quản trị viên."
                    type="error"
                    showIcon
                />
            </Modal>
        );
    }

    // Handle no data
    if (!invoice) return null;

    const useInsurance = invoice.has_insurance;

    const dataSource = (invoice.invoicePackages || []).map((ip: any) => {
        const price = Number(ip.price);
        const discount = Number(ip.package?.discount || 0);
        const insurancePay = useInsurance ? (price * discount / 100) * ip.quantity : 0;
        const gross = price * ip.quantity;
        const net = gross - insurancePay;

        return {
            key: `${ip.invoice_id}-${ip.package_id}`,
            name: ip.package?.name,
            price,
            quantity: ip.quantity,
            insurance: insurancePay,
            total: net,
        };
    });

    const totalAll = dataSource.reduce((sum: number, row: any) => sum + row.total, 0);
    const insuranceAll = dataSource.reduce((sum: number, row: any) => sum + row.insurance, 0);

    const medSource = (invoice.invoiceMedicines || []).map((im: any) => {
        const price = Number(im.price);
        const total = price * Number(im.quantity || 0);
        return {
            key: `${im.invoice_id}-${im.medicine_id}`,
            name: im.Medicine?.name,
            unit: im.Medicine?.unit,
            price,
            quantity: im.quantity,
            total,
        };
    });
    const medsTotal = medSource.reduce((sum: number, r: any) => sum + r.total, 0);

    const statusColor = invoice.status === 'paid' ? 'green' : invoice.status === 'unpaid' ? 'red' : 'default';
    const paymentMethodColor = {
        'Momo': '#E91E63',
        'VNPay': '#1890ff',
        'Cash': '#52C41A'
    };

    const handleCashPayment = async () => {
        try {
            await createCashPayment({ invoice_id: Number(invoice.id) }).unwrap();
            message.success("Thanh toán tiền mặt thành công!");
            onClose();
            if (onRefresh) {
                onRefresh();
            }
        } catch (err: any) {
            message.error(err?.data?.message || "Thanh toán tiền mặt thất bại");
        }
    };

    const handleExportPDF = async () => {
        try {
            const fileName = `HoaDon_${invoice.id}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Tạo PDF Document
            const doc = (
                <Document>
                    <Page size="A4" style={styles.page}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>BỆNH VIỆN THANH BÌNH</Text>
                            <Text style={styles.subtitle}>HÓA ĐƠN DỊCH VỤ Y TẾ</Text>
                            <Text style={styles.value}>Mã hóa đơn: #{invoice.id}</Text>
                            <Text style={styles.value}>Ngày tạo: {new Date(invoice.created_at).toLocaleString('vi-VN')}</Text>
                        </View>

                        {/* Thông tin hóa đơn */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>THÔNG TIN HÓA ĐƠN</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Mã hóa đơn:</Text>
                                <Text style={styles.value}>#{invoice.id}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Ngày tạo:</Text>
                                <Text style={styles.value}>{new Date(invoice.created_at).toLocaleString('vi-VN')}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Trạng thái:</Text>
                                <Text style={styles.value}>{invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Phương thức thanh toán:</Text>
                                <Text style={styles.value}>{invoice.payment_method || 'Chưa chọn'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>BHYT:</Text>
                                <Text style={styles.value}>{invoice.has_insurance ? 'Có BHYT' : 'Không BHYT'}</Text>
                            </View>
                        </View>

                        {/* Thông tin bệnh nhân */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>THÔNG TIN BỆNH NHÂN</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Họ và tên:</Text>
                                <Text style={styles.value}>{invoice.Appointment?.patient_name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Ngày sinh:</Text>
                                <Text style={styles.value}>{new Date(invoice.Appointment?.patient_dob).toLocaleDateString('vi-VN')}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Số điện thoại:</Text>
                                <Text style={styles.value}>{invoice.Appointment?.patient_phone}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Email:</Text>
                                <Text style={styles.value}>{invoice.Appointment?.patient_email || 'Chưa cập nhật'}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Địa chỉ:</Text>
                                <Text style={styles.value}>{invoice.Appointment?.patient_address}</Text>
                            </View>
                        </View>

                        {/* Chi tiết dịch vụ */}
                        {dataSource.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>CHI TIẾT DỊCH VỤ</Text>
                                <View style={styles.table}>
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.tableCellHeader}>Dịch vụ</Text>
                                        <Text style={styles.tableCellHeader}>Đơn giá</Text>
                                        <Text style={styles.tableCellHeader}>SL</Text>
                                        <Text style={styles.tableCellHeader}>BHYT</Text>
                                        <Text style={styles.tableCellHeader}>Thành tiền</Text>
                                    </View>
                                    {dataSource.map((item: any, index: number) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={styles.tableCell}>{item.name}</Text>
                                            <Text style={styles.tableCell}>{Number(item.price).toLocaleString('vi-VN')}đ</Text>
                                            <Text style={styles.tableCell}>{item.quantity}</Text>
                                            <Text style={styles.tableCell}>{Number(item.insurance).toLocaleString('vi-VN')}đ</Text>
                                            <Text style={styles.tableCell}>{Number(item.total).toLocaleString('vi-VN')}đ</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.total}>Tổng tiền dịch vụ: {totalAll.toLocaleString('vi-VN')} đ</Text>
                            </View>
                        )}

                        {/* Chi tiết thuốc */}
                        {medSource.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>CHI TIẾT THUỐC</Text>
                                <View style={styles.table}>
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.tableCellHeader}>Thuốc</Text>
                                        <Text style={styles.tableCellHeader}>Đơn vị</Text>
                                        <Text style={styles.tableCellHeader}>Đơn giá</Text>
                                        <Text style={styles.tableCellHeader}>SL</Text>
                                        <Text style={styles.tableCellHeader}>Thành tiền</Text>
                                    </View>
                                    {medSource.map((item: any, index: number) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={styles.tableCell}>{item.name}</Text>
                                            <Text style={styles.tableCell}>{item.unit}</Text>
                                            <Text style={styles.tableCell}>{Number(item.price).toLocaleString('vi-VN')}đ</Text>
                                            <Text style={styles.tableCell}>{item.quantity}</Text>
                                            <Text style={styles.tableCell}>{Number(item.total).toLocaleString('vi-VN')}đ</Text>
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.total}>Tổng tiền thuốc: {medsTotal.toLocaleString('vi-VN')} đ</Text>
                            </View>
                        )}

                        {/* Tổng kết */}
                        <View style={styles.summary}>
                            <Text style={styles.sectionTitle}>TỔNG KẾT HÓA ĐƠN</Text>
                            <View style={styles.row}>
                                <Text style={styles.label}>Tổng tiền dịch vụ:</Text>
                                <Text style={styles.value}>{totalAll.toLocaleString('vi-VN')} đ</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Tổng tiền thuốc:</Text>
                                <Text style={styles.value}>{medsTotal.toLocaleString('vi-VN')} đ</Text>
                            </View>
                            {useInsurance && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>BHYT chi trả:</Text>
                                    <Text style={styles.value}>{insuranceAll.toLocaleString('vi-VN')} đ</Text>
                                </View>
                            )}
                            <Text style={styles.total}>
                                TỔNG TIỀN PHẢI THANH TOÁN: {(totalAll + medsTotal).toLocaleString('vi-VN')} đ
                            </Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text>Hóa đơn được tạo tự động bởi hệ thống Ecare</Text>
                            <Text>Ngày xuất: {new Date().toLocaleString('vi-VN')}</Text>
                        </View>
                    </Page>
                </Document>
            );

            // Tạo và download PDF
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            message.success("Đã xuất file PDF hóa đơn thành công!");
        } catch (err) {
            console.error('Export PDF error:', err);
            message.error("Có lỗi khi xuất file PDF hóa đơn");
        }
    };



    return (
        <Modal
            title={
                <div style={{ textAlign: 'center' }}>
                    <Typography.Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                        📄 CHI TIẾT HÓA ĐƠN #{invoice.id}
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Ngày tạo: {new Date(invoice.created_at).toLocaleString('vi-VN')}
                    </Typography.Text>
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={1200}
            style={{ top: 20 }}
            footer={[
                <Button key="close" onClick={onClose} size="large">
                    Đóng
                </Button>,
                <Button key="export" icon={<FilePdfOutlined />} onClick={handleExportPDF} size="large">
                    Xuất PDF
                </Button>,
                ...(invoice.status === 'unpaid' ? [
                    <Button
                        key="cash"
                        type="primary"
                        icon={<DollarOutlined />}
                        loading={isCreatingCash}
                        onClick={handleCashPayment}
                        style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}
                        size="large"
                    >
                        💵 Thanh toán tiền mặt
                    </Button>,
                    <Button
                        key="online"
                        type="primary"
                        onClick={() => {
                            window.open(`/management/payment/${invoice.id}`, '_blank');
                            onClose();
                        }}
                        style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                        size="large"
                    >
                        💳 Thanh toán online
                    </Button>
                ] : [
                    <Button
                        key="paid"
                        type="primary"
                        disabled
                        style={{ backgroundColor: '#52C41A', borderColor: '#52C41A' }}
                        size="large"
                    >
                        ✅ Đã thanh toán
                    </Button>
                ])
            ]}
        >
            <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                {/* Status and Payment Info */}
                <Card
                    title="📊 TRẠNG THÁI HÓA ĐƠN"
                    style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
                >
                    <Row gutter={16} align="middle">
                        <Col span={12}>
                            <Space size="large">
                                <div>
                                    <Typography.Text strong>Trạng thái: </Typography.Text>
                                    <Tag color={statusColor} style={{ fontSize: 16, padding: '8px 12px' }}>
                                        {invoice.status === 'paid' ? '✅ Đã thanh toán' : invoice.status === 'unpaid' ? '⏳ Chưa thanh toán' : invoice.status}
                                    </Tag>
                                </div>
                                <div>
                                    <Typography.Text strong>Phương thức: </Typography.Text>
                                    {invoice.payment_method ? (
                                        <Tag color={paymentMethodColor[invoice.payment_method as keyof typeof paymentMethodColor] || 'default'} style={{ fontSize: 14 }}>
                                            {invoice.payment_method}
                                        </Tag>
                                    ) : (
                                        <Tag color="default" style={{ fontSize: 14 }}>Chưa chọn</Tag>
                                    )}
                                </div>
                                <div>
                                    <Typography.Text strong>BHYT: </Typography.Text>
                                    <Tag color={useInsurance ? 'blue' : 'default'} style={{ fontSize: 14 }}>
                                        {useInsurance ? '✅ Có BHYT' : '❌ Không BHYT'}
                                    </Tag>
                                </div>
                            </Space>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Typography.Text strong style={{ fontSize: 18, color: '#FF4D4F' }}>
                                💰 Tổng tiền: {(totalAll + medsTotal).toLocaleString('vi-VN')} đ
                            </Typography.Text>
                        </Col>
                    </Row>
                </Card>

                {/* Patient Information */}
                <Card title="👤 THÔNG TIN BỆNH NHÂN" style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={3} size="middle">
                        <Descriptions.Item label="Họ và tên" span={1}>
                            <Typography.Text strong style={{ fontSize: 16 }}>
                                {invoice.Appointment?.patient_name}
                            </Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh" span={1}>
                            {new Date(invoice.Appointment?.patient_dob).toLocaleDateString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính" span={1}>
                            {invoice.Appointment?.patient_gender || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại" span={1}>
                            <Typography.Text copyable style={{ color: '#1890ff' }}>
                                {invoice.Appointment?.Patient?.phone}
                            </Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Email" span={1}>
                            <Typography.Text copyable>
                                {invoice.Appointment?.patient_email || 'Chưa cập nhật'}
                            </Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="CMND/CCCD" span={1}>
                            {invoice.Appointment?.patient_id_card || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={3}>
                            <Typography.Text>{invoice.Appointment?.patient_address}</Typography.Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Divider />

                {/* Invoice Information */}
                <Card title="📋 THÔNG TIN HÓA ĐƠN" style={{ marginBottom: 16 }}>
                    <Descriptions bordered column={3} size="middle">
                        <Descriptions.Item label="Mã hóa đơn" span={1}>
                            <Typography.Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                                #{invoice.id}
                            </Typography.Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo" span={1}>
                            <Typography.Text>{new Date(invoice.created_at).toLocaleString('vi-VN')}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái" span={1}>
                            <Tag color={statusColor} style={{ fontSize: 14, padding: '4px 8px' }}>
                                {invoice.status === 'paid' ? 'Đã thanh toán' : invoice.status === 'unpaid' ? 'Chưa thanh toán' : invoice.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phương thức thanh toán" span={1}>
                            {invoice.payment_method ? (
                                <Tag color={paymentMethodColor[invoice.payment_method as keyof typeof paymentMethodColor] || 'default'}>
                                    {invoice.payment_method}
                                </Tag>
                            ) : (
                                <Tag color="default">Chưa chọn</Tag>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="BHYT" span={1}>
                            <Tag color={useInsurance ? 'blue' : 'default'}>
                                {useInsurance ? 'Có BHYT' : 'Không BHYT'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền" span={2}>
                            <Typography.Text strong style={{ fontSize: 18, color: '#FF4D4F' }}>
                                {(totalAll + medsTotal).toLocaleString('vi-VN')} đ
                            </Typography.Text>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Divider />

                {/* Services Details */}
                <Card title="🧾 CHI TIẾT DỊCH VỤ" style={{ marginBottom: 16 }}>
                    {dataSource.length > 0 ? (
                        <Table
                            dataSource={dataSource}
                            columns={[
                                {
                                    title: 'Tên dịch vụ',
                                    dataIndex: 'name',
                                    render: (text) => <Typography.Text strong>{text}</Typography.Text>
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    render: (v) => (
                                        <Typography.Text style={{ color: '#1890ff', fontWeight: 500 }}>
                                            {Number(v).toLocaleString('vi-VN')} đ
                                        </Typography.Text>
                                    ),
                                    align: 'right'
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    render: (v) => <Tag color="blue">{v}</Tag>,
                                    align: 'center'
                                },
                                {
                                    title: 'BHYT chi trả',
                                    dataIndex: 'insurance',
                                    render: (v) => (
                                        <Typography.Text style={{ color: '#52C41A', fontWeight: 500 }}>
                                            {Number(v).toLocaleString('vi-VN')} đ
                                        </Typography.Text>
                                    ),
                                    align: 'right'
                                },
                                {
                                    title: 'Thành tiền',
                                    dataIndex: 'total',
                                    render: (v) => (
                                        <Typography.Text strong style={{ color: '#FF4D4F' }}>
                                            {Number(v).toLocaleString('vi-VN')} đ
                                        </Typography.Text>
                                    ),
                                    align: 'right'
                                },
                            ]}
                            pagination={false}
                            bordered
                            size="middle"
                            summary={() => (
                                <>
                                    <Table.Summary.Row style={{ backgroundColor: '#f6ffed' }}>
                                        <Table.Summary.Cell index={0} colSpan={3}>
                                            <Typography.Text strong style={{ fontSize: 16 }}>
                                                📊 Tổng BHYT chi trả
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <Typography.Text strong style={{ fontSize: 16, color: '#52C41A' }}>
                                                {insuranceAll.toLocaleString('vi-VN')} đ
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row style={{ backgroundColor: '#fff2e8' }}>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <Typography.Text strong style={{ fontSize: 16 }}>
                                                💰 Tổng tiền dịch vụ
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>
                                            <Typography.Text strong style={{ fontSize: 16, color: '#FF4D4F' }}>
                                                {totalAll.toLocaleString('vi-VN')} đ
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            )}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                                Không có dịch vụ nào trong hóa đơn này
                            </Typography.Text>
                        </div>
                    )}
                </Card>

                <Divider />

                {/* Medicines Details */}
                <Card title="💊 CHI TIẾT THUỐC" style={{ marginBottom: 16 }}>
                    {medSource.length > 0 ? (
                        <Table
                            dataSource={medSource}
                            columns={[
                                {
                                    title: 'Tên thuốc',
                                    dataIndex: 'name',
                                    render: (text) => <Typography.Text strong>{text}</Typography.Text>
                                },
                                {
                                    title: 'Đơn vị',
                                    dataIndex: 'unit',
                                    render: (text) => <Tag color="purple">{text}</Tag>,
                                    align: 'center'
                                },
                                {
                                    title: 'Đơn giá',
                                    dataIndex: 'price',
                                    render: (v) => (
                                        <Typography.Text style={{ color: '#1890ff', fontWeight: 500 }}>
                                            {Number(v).toLocaleString('vi-VN')} đ
                                        </Typography.Text>
                                    ),
                                    align: 'right'
                                },
                                {
                                    title: 'Số lượng',
                                    dataIndex: 'quantity',
                                    render: (v) => <Tag color="orange">{v}</Tag>,
                                    align: 'center'
                                },
                                {
                                    title: 'Thành tiền',
                                    dataIndex: 'total',
                                    render: (v) => (
                                        <Typography.Text strong style={{ color: '#FF4D4F' }}>
                                            {Number(v).toLocaleString('vi-VN')} đ
                                        </Typography.Text>
                                    ),
                                    align: 'right'
                                },
                            ]}
                            pagination={false}
                            bordered
                            size="middle"
                            summary={() => (
                                <>
                                    <Table.Summary.Row style={{ backgroundColor: '#fff7e6' }}>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <Typography.Text strong style={{ fontSize: 16 }}>
                                                💊 Tổng tiền thuốc
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>
                                            <Typography.Text strong style={{ fontSize: 16, color: '#FF4D4F' }}>
                                                {medsTotal.toLocaleString('vi-VN')} đ
                                            </Typography.Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            )}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                                Không có thuốc nào trong hóa đơn này
                            </Typography.Text>
                        </div>
                    )}
                </Card>

                <Divider />

                {/* Total Summary */}
                <Card
                    title="💰 TỔNG KẾT HÓA ĐƠN"
                    style={{
                        backgroundColor: '#f6ffed',
                        border: '2px solid #52C41A',
                        marginBottom: 16
                    }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <Typography.Text strong style={{ fontSize: 14, color: '#666' }}>
                                    Tổng tiền dịch vụ
                                </Typography.Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff', marginTop: 8 }}>
                                    {totalAll.toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <Typography.Text strong style={{ fontSize: 14, color: '#666' }}>
                                    Tổng tiền thuốc
                                </Typography.Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#722ED1', marginTop: 8 }}>
                                    {medsTotal.toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                        </Col>
                        <Col span={8}>
                            <div style={{ textAlign: 'center', padding: '16px' }}>
                                <Typography.Text strong style={{ fontSize: 14, color: '#666' }}>
                                    BHYT chi trả
                                </Typography.Text>
                                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#52C41A', marginTop: 8 }}>
                                    {insuranceAll.toLocaleString('vi-VN')} đ
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '16px 0' }} />

                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Typography.Title level={2} style={{ margin: 0, color: '#FF4D4F' }}>
                            💰 TỔNG TIỀN PHẢI THANH TOÁN: {(totalAll + medsTotal).toLocaleString('vi-VN')} đ
                        </Typography.Title>
                        {useInsurance && (
                            <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                                (Đã trừ BHYT: {insuranceAll.toLocaleString('vi-VN')} đ)
                            </Typography.Text>
                        )}
                    </div>
                </Card>
                {invoice.status === 'paid' && (
                    <Card
                        title="✅ THÔNG TIN THANH TOÁN"
                        style={{
                            backgroundColor: '#f6ffed',
                            border: '2px solid #52C41A'
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Typography.Text strong>Phương thức thanh toán: </Typography.Text>
                                <Tag color={paymentMethodColor[invoice.payment_method as keyof typeof paymentMethodColor] || 'default'} style={{ fontSize: 14 }}>
                                    {invoice.payment_method}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Typography.Text strong>Trạng thái: </Typography.Text>
                                <Tag color="green" style={{ fontSize: 14 }}>
                                    Đã thanh toán
                                </Tag>
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>
        </Modal>
    );
}
