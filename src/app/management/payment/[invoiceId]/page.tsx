"use client";

import { useParams } from "next/navigation";
import { Button, Spin, Typography, message, Descriptions, Tag, Table, Card, Divider } from "antd";
import { useCreateMomoPaymentMutation } from "@/api/app_payment/apiPayment";
import { useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "@/api/app_invoice/apiInvoice";

export default function MomoPaymentPage() {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const [createMomoPayment, { isLoading: isCreating }] = useCreateMomoPaymentMutation();
    const [updateInvoice] = useUpdateInvoiceMutation();
    const { data, error, isLoading: isInvoiceLoading } = useGetInvoiceByIdQuery(invoiceId);
    const invoice = data?.data;
    const handlePay = async () => {
        try {
            await updateInvoice({ id: Number(invoiceId), payment_method: "Momo" }).unwrap();
            const totalAmount = totalAll + medsTotal;
            const res = await createMomoPayment({ invoice_id: Number(invoiceId), amount: totalAmount }).unwrap();
            if (res.payUrl || res.deeplink) {
                window.location.href = (res.payUrl || res.deeplink)!;
            } else {
                message.error("Không tạo được link thanh toán MoMo");
            }
        } catch (err: any) {
            message.error(err?.data?.message || "Thanh toán thất bại");
        }
    };

    if (isInvoiceLoading) {
        return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
    }

    if (error || !invoice) {
        return (
            <div style={{ textAlign: "center", marginTop: 80 }}>
                <Typography.Title level={3}>Không tìm thấy hóa đơn</Typography.Title>
                <Typography.Text type="secondary">
                    Hóa đơn #{invoiceId} không tồn tại hoặc đã bị xóa
                </Typography.Text>
            </div>
        );
    }
    const useInsurance = invoice.has_insurance;
    type RowData = {
        key: string;
        name: string;
        price: number;
        quantity: number;
        insurance: number;
        total: number;
    };
    type MedRow = {
        key: string;
        name: string;
        unit: string;
        price: number;
        quantity: number;
        total: number;
    };
    // Tính toán lại các giá trị cho bảng dịch vụ
    const dataSource: RowData[] = (invoice.invoicePackages || []).map((ip: any) => {
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

    const totalAll = dataSource.reduce((sum: number, row: RowData) => sum + row.total, 0);
    const insuranceAll = dataSource.reduce((sum: number, row: RowData) => sum + row.insurance, 0);

    // Medicines table data
    const medSource: MedRow[] = (invoice.invoiceMedicines || []).map((im: any) => {
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
    const medsTotal = medSource.reduce((sum: number, r: MedRow) => sum + r.total, 0);

    // Màu sắc cho trạng thái
    const statusColor = invoice.status === 'paid' ? 'green' : invoice.status === 'unpaid' ? 'red' : 'default';

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Tag color={statusColor} style={{ fontSize: 14, padding: '4px 8px' }}>
                        {invoice.status === 'paid' ? 'Đã thanh toán' : invoice.status === 'unpaid' ? 'Chưa thanh toán' : invoice.status}
                    </Tag>
                    <Typography.Text strong>
                        Tổng tiền: {(totalAll + medsTotal).toLocaleString('vi-VN')} đ
                    </Typography.Text>
                </div>

                <Descriptions title="👤 Thông tin bệnh nhân" bordered column={2} size="middle">
                    <Descriptions.Item label="Họ tên">{invoice.Appointment?.patient_name}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{new Date(invoice.Appointment?.patient_dob).toLocaleDateString('vi-VN')}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{invoice.Appointment?.patient_phone}</Descriptions.Item>
                    <Descriptions.Item label="Email">{invoice.Appointment?.patient_email}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ" span={2}>{invoice.Appointment?.patient_address}</Descriptions.Item>
                </Descriptions>

                <Divider />

                <Typography.Title level={4}>🧾 Chi tiết dịch vụ</Typography.Title>
                <Table
                    dataSource={dataSource}
                    columns={[
                        { title: 'Dịch vụ', dataIndex: 'name' },
                        { title: 'Đơn giá', dataIndex: 'price', render: (v) => `${Number(v).toLocaleString('vi-VN')} đ` },
                        { title: 'Số lượng', dataIndex: 'quantity' },
                        { title: 'BHYT chi trả', dataIndex: 'insurance', render: (v) => `${Number(v).toLocaleString('vi-VN')} đ` },
                        { title: 'Thành tiền', dataIndex: 'total', render: (v) => `${Number(v).toLocaleString('vi-VN')} đ` },
                    ]}
                    pagination={false}
                    bordered
                    summary={() => (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3}>
                                    <Typography.Text strong>Tổng BHYT chi trả</Typography.Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={3}>
                                    <Typography.Text strong>{insuranceAll.toLocaleString('vi-VN')} đ</Typography.Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                            </Table.Summary.Row>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4}>
                                    <Typography.Text strong>Tổng tiền cần thanh toán</Typography.Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <Typography.Text strong type="danger">{totalAll.toLocaleString('vi-VN')} đ</Typography.Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    )}
                />

                <Divider />

                <Typography.Title level={4}>💊 Chi tiết thuốc</Typography.Title>
                <Table
                    dataSource={medSource}
                    columns={[
                        { title: 'Thuốc', dataIndex: 'name' },
                        { title: 'Đơn vị', dataIndex: 'unit' },
                        { title: 'Đơn giá', dataIndex: 'price', render: (v) => `${Number(v).toLocaleString('vi-VN')} đ` },
                        { title: 'Số lượng', dataIndex: 'quantity' },
                        { title: 'Thành tiền', dataIndex: 'total', render: (v) => `${Number(v).toLocaleString('vi-VN')} đ` },
                    ]}
                    pagination={false}
                    bordered
                    summary={() => (
                        <>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4}>
                                    <Typography.Text strong>Tổng tiền thuốc</Typography.Text>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={4}>
                                    <Typography.Text strong>{medsTotal.toLocaleString('vi-VN')} đ</Typography.Text>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    )}
                />

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Spin spinning={isCreating}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handlePay}
                            style={{
                                height: 48,
                                width: 200,
                                fontSize: 16,
                                fontWeight: 'bold',
                                backgroundColor: '#1890ff'
                            }}
                            disabled={invoice.status === 'paid'}
                        >
                            {invoice.status === 'paid' ? 'Đã thanh toán' : 'Thanh toán MoMo'}
                        </Button>
                    </Spin>
                    {invoice.status === 'paid' && (
                        <div style={{ marginTop: 16 }}>
                            <Typography.Text type="success">
                                Hóa đơn này đã được thanh toán
                            </Typography.Text>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
