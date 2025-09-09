"use client";
import React, { useState } from "react";
import {
    Modal,
    Tabs,
    Button,
    Space,
    Table,
    Tag,
    Popconfirm,
    message,
    Card,
    Descriptions,
    Empty
} from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useGetPackagesByDepartmentQuery } from "@/api/app_package/apiPackage";
import PersonalAndDegreeInfo from "../../doctorManage/components/personalAndDegreeInfo";
import { useGetDoctorByDepartmentQuery } from "@/api/app_doctor/apiDoctor";
import { to_vietnamese } from "@/utils/numberInWritten";

interface SpecialtyDetailProps {
    open: boolean;
    onClose: () => void;
    department: any;
    onEdit: (record: any) => void;
    onDelete: (id: number) => void;
    onRefetch: () => void;
}

const SpecialtyDetail: React.FC<SpecialtyDetailProps> = ({
    open,
    onClose,
    department,
    onEdit,
    onDelete,
    onRefetch
}) => {
    const [activeTab, setActiveTab] = useState("doctors");
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [showDoctorDetail, setShowDoctorDetail] = useState(false);
    const { data: allDoctorsData, isLoading: doctorsLoading } = useGetDoctorByDepartmentQuery(department?.id, { skip: !department?.id });
    const { data: packagesData, isLoading: packagesLoading } = useGetPackagesByDepartmentQuery(
        department?.id,
        { skip: !department?.id }
    );

    const handleDelete = async (id: number) => {
        try {
            await onDelete(id);
            onRefetch();
        } catch (error) {
            message.error("Xóa thất bại!");
        }
    };

    const handleDoctorClick = (doctor: any) => {
        setSelectedDoctor(doctor);
        setShowDoctorDetail(true);
    };

    const doctorColumns = [
        {
            title: "Tên bác sĩ",
            dataIndex: "full_name",
            key: "full_name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
        },
        {
            title: "Kinh nghiệm",
            dataIndex: "experience_years",
            key: "experience_years",
            render: (years: number) => `${years || 0} năm`,
        },
        {
            title: "Trạng thái",
            dataIndex: "is_approved",
            key: "is_approved",
            render: (approved: boolean) => (
                <Tag color={approved ? "green" : "orange"}>
                    {approved ? "Đã duyệt" : "Chờ duyệt"}
                </Tag>
            ),
        },
    ];

    const packageColumns = [
        {
            title: "Tên gói",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            render: (price: any) => {
                const numPrice = Number(price);
                return `${numPrice.toLocaleString('vi-VN')} VNĐ`;
            }
        },
        {
            title: "Giá (bằng chữ)",
            dataIndex: "price_text",
            key: "price_text",
            render: (_: any, record: any) => to_vietnamese(Number(record.price || 0)),
        },
        {
            title: "Chiết khấu",
            dataIndex: "discount",
            key: "discount",
            render: (discount: any) => `${discount || 0}%`,
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (active: boolean) => (
                <Tag color={active ? "green" : "red"}>
                    {active ? "Hoạt động" : "Ngừng"}
                </Tag>
            ),
        },
    ];

    const tabItems = [
        {
            key: "doctors",
            label: (
                <span>
                    <UserOutlined />
                    Bác sĩ ({allDoctorsData?.doctors?.length || 0})
                </span>
            ),
            children: (
                <Table
                    columns={doctorColumns}
                    dataSource={allDoctorsData?.doctors}
                    rowKey="id"
                    loading={doctorsLoading}
                    pagination={{ pageSize: 5 }}
                    onRow={(record) => ({
                        onClick: () => handleDoctorClick(record),
                        style: { cursor: 'pointer' }
                    })}
                    locale={{ emptyText: <Empty description="Chưa có bác sĩ nào" /> }}
                />
            ),
        },
        {
            key: "packages",
            label: (
                <span>
                    <MedicineBoxOutlined />
                    Dịch vụ ({packagesData?.data?.length || 0})
                </span>
            ),
            children: (
                <Table
                    columns={packageColumns}
                    dataSource={packagesData?.data || []}
                    rowKey="id"
                    loading={packagesLoading}
                    pagination={{ pageSize: 5 }}
                    locale={{ emptyText: <Empty description="Chưa có dịch vụ nào" /> }}
                />
            ),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    {department && (
                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => onEdit(department)}
                            >
                            </Button>
                            <Popconfirm
                                title="Xác nhận xóa chuyên khoa này?"
                                onConfirm={() => handleDelete(department.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                </Button>
                            </Popconfirm>
                        </Space>
                    )}
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
        >
            {department && (
                <div>
                    <Card style={{ marginBottom: 16 }}>
                        <Descriptions title="Thông tin chuyên khoa" column={2}>
                            <Descriptions.Item label="Tên chuyên khoa">
                                {department.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số bác sĩ">
                                {department.doctor_count || 0}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {department.description || "Chưa có mô tả"}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                    />
                </div>
            )}
            <Modal
                title="Thông tin chi tiết bác sĩ"
                open={showDoctorDetail}
                onCancel={() => {
                    setShowDoctorDetail(false);
                    setSelectedDoctor(null);
                }}
                footer={null}
                width={800}
            >
                {selectedDoctor && (
                    <PersonalAndDegreeInfo
                        doctor={selectedDoctor}
                        onApprove={() => {
                            setShowDoctorDetail(false);
                            setSelectedDoctor(null);
                            onRefetch();
                        }}
                    />
                )}
            </Modal>
        </Modal>
    );
};

export default SpecialtyDetail;
