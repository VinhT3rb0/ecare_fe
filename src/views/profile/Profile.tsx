"use client";
import React, { useEffect, useState } from 'react';
import { Tabs, Card, message } from 'antd';
import {
    ShoppingOutlined,
    FileTextOutlined,
    UserOutlined,
    LockOutlined,
} from '@ant-design/icons';
import InformationPersonal from './components/InformationPersonal';
import ChangePassword from './components/ChangePassword';
import { useGetAccountQuery } from '@/api/app_home/apiAccount';
import PatientsAppointment from './components/patientsAppointment';

const Profile = () => {
    const [activeTab, setActiveTab] = useState("orders");
    const { data: user, refetch } = useGetAccountQuery();
    useEffect(() => {
        message.info("Test notification từ service");
    }, []);
    const tabItems = [
        {
            key: "orders",
            label: (
                <span>
                    <ShoppingOutlined /> Lịch khám
                </span>
            ),
            children: <PatientsAppointment />,
        },
        {
            key: "invoices",
            label: (
                <span>
                    <FileTextOutlined /> Hóa đơn của bạn
                </span>
            ),
            children: <div className="text-gray-700">Danh sách hóa đơn sẽ hiển thị ở đây.</div>,
        },
        {
            key: "profile",
            label: (
                <span>
                    <UserOutlined /> Thông tin cá nhân
                </span>
            ),
            children: <InformationPersonal user={user?.data} refetch={refetch} />,
        },
        {
            key: "security",
            label: (
                <span>
                    <LockOutlined /> Bảo mật
                </span>
            ),
            children: <ChangePassword />,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Card className="shadow-md bg-white">
                <h1 className="text-2xl font-semibold mb-4">Trang cá nhân</h1>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    tabPosition="top"
                    type="line"
                    size="large"
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

export default Profile;
