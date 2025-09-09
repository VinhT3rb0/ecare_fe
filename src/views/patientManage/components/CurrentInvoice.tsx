"use client";

import { Card, Descriptions, Empty, Spin, Table, Tag, Typography } from "antd";
import { useGetInvoiceByAppointmentQuery } from "@/api/app_invoice/apiInvoice";

type Props = {
    appointmentId: number;
};

export default function CurrentInvoice({ appointmentId }: Props) {
    const { data, isFetching, error } = useGetInvoiceByAppointmentQuery(appointmentId, {
        skip: !appointmentId,
    });

    if (isFetching) return <Spin />;
    if (error || !data?.data) return <Empty description="Chưa có hóa đơn cho lịch hẹn này" />;

    const invoice = data.data;
    const statusColor = invoice.status === "paid" ? "green" : "orange";

    const items = (invoice.InvoicePackages || []).map((ip: any, idx: number) => ({
        key: idx,
        name: ip.Package?.name || `Gói #${ip.package_id}`,
        price: Number(ip.price),
        quantity: ip.quantity,
        total: Number(ip.price) * Number(ip.quantity),
    }));

    return (
        <Card title={`Hóa đơn #${invoice.id || ""}`}
            extra={<Tag color={statusColor}>{invoice.status}</Tag>}>
            <Descriptions size="small" column={2} bordered>
                <Descriptions.Item label="Lịch hẹn">#{invoice.appointment_id}</Descriptions.Item>
                <Descriptions.Item label="Bệnh nhân">#{invoice.patient_id}</Descriptions.Item>
                <Descriptions.Item label="PTTT">{invoice.payment_method || "—"}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                    {Number(invoice.total_amount).toLocaleString()} đ
                </Descriptions.Item>
            </Descriptions>

            <Table
                style={{ marginTop: 16 }}
                dataSource={items}
                pagination={false}
                columns={[
                    { title: "Dịch vụ", dataIndex: "name" },
                    { title: "Đơn giá", dataIndex: "price", render: (v) => `${Number(v).toLocaleString()} đ` },
                    { title: "SL", dataIndex: "quantity" },
                    { title: "Thành tiền", dataIndex: "total", render: (v) => `${Number(v).toLocaleString()} đ` },
                ]}
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>
                            <Typography.Text strong>Tổng cộng</Typography.Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                            <Typography.Text strong>
                                {Number(invoice.total_amount).toLocaleString()} đ
                            </Typography.Text>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />
        </Card>
    );
}


