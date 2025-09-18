"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Card, message } from "antd";
import {
    ShoppingOutlined,
    FileTextOutlined,
    UserOutlined,
    LockOutlined,
} from "@ant-design/icons";
import InformationPersonal from "./components/InformationPersonal";
import ChangePassword from "./components/ChangePassword";
import { useGetAccountQuery } from "@/api/app_home/apiAccount";
import PatientsAppointment from "./components/patientsAppointment";
import MyInvoices from "./components/myInvoices";

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
            children: <MyInvoices patientId={user?.data?.id} />,
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
        <div className="min-h-screen bg-gradient-to-br from-[#E6F4F1] via-[#F0F7FA] to-[#EAF3FB] pt-28">
            <div className="max-w-6xl mx-auto p-6">
                <Card className="shadow-md bg-white rounded-xl">
                    <h1 className="text-2xl font-semibold mb-4 text-[#064E3B]">
                        Trang cá nhân
                    </h1>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        tabPosition="top"
                        type="line"
                        size="large"
                        items={tabItems}
                        className="[&_.ant-tabs-ink-bar]:!bg-[#11A998]"
                    />
                </Card>
            </div>
        </div>

    );
};

export default Profile;
