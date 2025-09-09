// doctorAccount.tsx
"use client";
import React, { useState } from "react";
import {
    Table,
    Button,
    Input,
    Space,
    Card,
    Avatar,
    Tag,
    Row,
    Col,
    Statistic,
    message,
    Modal
} from "antd";
import {
    SearchOutlined,
    UserAddOutlined,
    MailOutlined,
    UserOutlined
} from "@ant-design/icons";
import { useDebounce } from "@/utils/useDebounce";
import AddAndUpdateDoctorAccount from "./AddAndUpdateDoctorAccount";
import { useGetAllDoctorsQuery } from "@/api/app_doctor/apiDoctor";
import DoctorDetail from "./doctorDetail";

const DoctorAccount: React.FC = () => {
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearch = useDebounce(searchValue, 400);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const { data, isLoading } = useGetAllDoctorsQuery({ page: 1, limit: 100 });
    const doctors = data?.doctors || [];

    const filteredDoctors = doctors.filter((doctor: any) =>
        doctor.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const doctorColumns = [
        {
            title: "Bác sĩ",
            key: "doctor",
            render: (record: any) => (
                <div className="flex items-center">
                    <Avatar src={record.avatar_img} size={40} />
                    <div className="ml-3">
                        <div className="font-semibold">{record.full_name}</div>
                        <div className="text-sm text-gray-500">
                            {record.Departments?.map((dept: any) => dept.name).join(", ")}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Email",
            key: "email",
            render: (record: any) => (
                <div className="flex items-center">
                    <MailOutlined className="mr-2 text-gray-400" />
                    <span className="text-sm">{record.email}</span>
                </div>
            )
        },
        {
            title: "Kinh nghiệm",
            dataIndex: "experience_years",
            key: "experience_years"
        },
        {
            title: "Trạng thái",
            dataIndex: "is_approved",
            key: "status",
            render: (_: any, record: any) => (
                <Tag color={record.is_approved ? "green" : "red"}>
                    {record.is_approved ? "Đang hoạt động" : "Không hoạt động"}
                </Tag>
            )
        },
    ];

    return (
        <Card>
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Statistic title="Tổng số bác sĩ" value={doctors.length} prefix={<UserOutlined />} />
                </Col>
                <Col span={6}>
                    <Statistic title="Đang hoạt động" value={doctors.filter((d: any) => d.status === "active").length} valueStyle={{ color: "#3f8600" }} />
                </Col>
                <Col span={6}>
                    <Statistic title="Tỷ lệ đánh giá" value={4.8} suffix="/ 5.0" valueStyle={{ color: "#1890ff" }} />
                </Col>
                <Col span={6}>
                    <Statistic title="Bệnh nhân trung bình" value={960} suffix="người" />
                </Col>
            </Row>

            <Space className="mb-4 flex justify-between items-center">
                <Input
                    placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên khoa"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    style={{ width: 350 }}
                    allowClear
                />
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => { setEditData(null); setOpen(true); }} size="large">
                    Thêm bác sĩ mới
                </Button>
            </Space>

            <Table
                columns={doctorColumns}
                dataSource={filteredDoctors}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={isLoading}
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedDoctor(record);
                        setDetailOpen(true);
                    }
                })}
            />

            <AddAndUpdateDoctorAccount
                open={open}
                onClose={() => setOpen(false)}
                initialData={editData}
                onSuccess={() => { }}
            />

            <Modal
                open={detailOpen}
                title="Chi tiết bác sĩ"
                footer={null}
                width={900}
                onCancel={() => setDetailOpen(false)}
            >
                <DoctorDetail doctor={selectedDoctor} />
            </Modal>
        </Card>
    );
};

export default DoctorAccount;
