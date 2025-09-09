"use client";
import React, { useState } from 'react';
import { Table, Spin, Alert, Button, Input, Space, Popconfirm, Tag, Card } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useDeletePackageMutation, useGetPackagesQuery } from '@/api/app_package/apiPackage';
import { to_vietnamese } from '@/utils/numberInWritten';
import { useDebounce } from '@/utils/useDebounce';
import AddAndUpdatePackage from './components/AddAndUpdatePackage';
import toast from 'react-hot-toast';
import PackageDetail from './components/PackageDetail';
const Package = () => {
    const [searchValue, setSearchValue] = useState<string>('');
    const debouncedSearch = useDebounce(searchValue, 400);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const { data, isLoading, isError, refetch } = useGetPackagesQuery(
        debouncedSearch ? { name: debouncedSearch } : undefined
    );
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [useDelete] = useDeletePackageMutation();
    const onDelete = async (id: string) => {
        try {
            await useDelete(id).unwrap();
            refetch();
            toast.success("Xóa gói dịch vụ thành công!");
        } catch (error) {
            toast.error("Xóa gói dịch vụ thất bại, vui lòng thử lại!");
        }
    };
    const columns = [
        {
            title: "Tên gói",
            dataIndex: "name",
            key: "name",
            render: (text: string) => (
                <span className="font-medium text-teal-700">{text}</span>
            ),
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            render: (text: string) => (
                <span className="text-gray-600">{text || "—"}</span>
            ),
        },
        {
            title: "Giá gốc",
            dataIndex: "price",
            key: "price",
            render: (_: any, record: any) => {
                const price = Math.round(Number(record.price));
                return (
                    <div>
                        <div className="font-semibold text-gray-800">
                            {price.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-xs text-gray-500 italic">
                            {to_vietnamese(price)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Giá sau chiết khấu",
            key: "discountedPrice",
            render: (_: any, record: any) => {
                const price = Number(record.price);
                const discount = Number(record.discount);
                const discounted = Math.round(price - price * (discount / 100));
                return (
                    <div>
                        <div className="font-bold text-green-600">
                            {discounted.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="text-xs text-gray-500 italic">
                            {to_vietnamese(discounted)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Chiết khấu",
            dataIndex: "discount",
            key: "discount",
            render: (value: number) => (
                <Tag color={value > 0 ? "volcano" : "default"}>
                    {value ? `${value}%` : "0%"}
                </Tag>
            ),
        },
        {
            title: "Thời hạn chiết khấu",
            dataIndex: "discount_expiry_date",
            key: "discount_expiry_date",
            render: (value: string) => {
                if (!value) return <span className="text-gray-400">Không giới hạn</span>;
                const date = new Date(value);
                return (
                    <Tag color="blue">
                        {date.toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })}
                    </Tag>
                );
            },
        },
        {
            title: "Hình ảnh",
            dataIndex: "image_url",
            key: "image_url",
            render: (value: string) => (
                <img
                    src={value}
                    alt="Package"
                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                />
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (value: boolean) =>
                value ? (
                    <Tag color="green">Đang hoạt động</Tag>
                ) : (
                    <Tag color="red">Ngừng hoạt động</Tag>
                ),
        },
        {
            key: "actions",
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    {/* Nút xem chi tiết */}
                    <Button
                        onClick={() => {
                            setDetailData(record);
                            setDetailOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        type="link"
                        icon={<EyeOutlined />}
                    />

                    {/* Nút sửa */}
                    <Button
                        onClick={() => {
                            setEditData(record);
                            setOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        type="link"
                        icon={<EditOutlined />}
                    />

                    {/* Nút xóa */}
                    <Popconfirm
                        title="Bạn có chắc muốn xóa không?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            className="hover:text-red-700"
                        />
                    </Popconfirm>
                </div>
            ),
        }

    ];

    if (isLoading) return <Spin className="mt-10" />;
    if (isError) return <Alert type="error" message="Không thể tải dữ liệu gói dịch vụ" />;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý gói dịch vụ</h1>
            <Space className="mb-4 flex justify-between items-center">
                <Input
                    placeholder="Tìm kiếm gói dịch vụ"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                />
                <Button className="inline-block px-6 py-2 !bg-teal-600 !text-white font-semibold rounded-full shadow-lg hover:!bg-teal-700 transition"
                    onClick={() => { setEditData(null); setOpen(true); }}
                >
                    Thêm gói dịch vụ
                </Button>
            </Space>
            <Card className="shadow-md rounded-xl">
                <Table
                    columns={columns}
                    dataSource={data?.data || []}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
            <AddAndUpdatePackage open={open}
                onClose={() => setOpen(false)}
                initialData={editData}
                refetch={refetch} />
            <PackageDetail open={detailOpen} onClose={() => setDetailOpen(false)} data={detailData} />
        </div>
    );
};

export default Package;