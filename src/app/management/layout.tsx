"use client";

import React, { useState } from "react";
import { Layout, Menu, Button, ConfigProvider } from "antd";
import {
    ContactsOutlined,
    DashboardOutlined,
    TeamOutlined,
    CalendarOutlined,
    SettingOutlined,
    AccountBookOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MessageOutlined,
    LinkOutlined,
    ScheduleOutlined,
    DatabaseOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import Link from "next/link";

const { Sider, Content } = Layout;

interface ManagementLayoutProps {
    children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const user = getCookie("role");

    const getSelectedKey = () => {
        if (pathname.includes("/management/dashboard")) return "dashboard";
        if (pathname.includes("/management/users")) return "users";
        if (pathname.includes("/management/packages")) return "packages";
        if (pathname.includes("/management/appointments")) return "appointments";
        if (pathname.includes("/management/settings")) return "settings";
        if (pathname.includes("/management/doctor")) return "doctor";
        return "dashboard";
    };

    const menuItems =
        user === "admin"
            ? [
                {
                    key: "dashboard",
                    icon: <DashboardOutlined />,
                    label: "Tổng quan",
                    onClick: () => router.push("/management/dashboard"),
                },
                {
                    key: "users",
                    icon: <TeamOutlined />,
                    label: "Quản lý khách hàng",
                    onClick: () => router.push("/management/users"),
                },
                {
                    key: "packages",
                    icon: <AccountBookOutlined />,
                    label: "Dịch vụ điều trị",
                    onClick: () => router.push("/management/packages"),
                },
                {
                    key: "doctor",
                    icon: <ContactsOutlined />,
                    label: "Quản lý bác sĩ",
                    onClick: () => router.push("/management/doctor"),
                },
                {
                    key: "medicine",
                    icon: <LinkOutlined />,
                    label: "Quản lý thuốc",
                    onClick: () => router.push("/management/medicine"),
                },
                {
                    key: "specialty",
                    icon: <CalendarOutlined />,
                    label: "Chuyên khoa",
                    onClick: () => router.push("/management/specialty"),
                },
                {
                    key: "settings",
                    icon: <SettingOutlined />,
                    label: "Tài khoản",
                    onClick: () => router.push("/management/settings"),
                },
                {
                    key: "messages",
                    icon: <MessageOutlined />,
                    label: "Hộp thư",
                    onClick: () => router.push("/management/messages"),
                },
            ]
            : [
                {
                    key: "patient-list",
                    icon: <ScheduleOutlined />,
                    label: "Danh sách bệnh nhân",
                    onClick: () => router.push("/management/doctor"),
                },
                {
                    key: "doctor-appointments",
                    icon: <CalendarOutlined />,
                    label: "Lịch làm việc",
                    onClick: () => router.push("/management/schedules"),
                },
                {
                    key: "doctor-patients",
                    icon: <DatabaseOutlined />,
                    label: "Lịch khám chờ xác nhận",
                    onClick: () => router.push("/management/patientAppointments"),
                },
                {
                    key: "today-patients",
                    icon: <FileTextOutlined />,
                    label: "Lịch khám hôm nay",
                    onClick: () => router.push("/management/todayAppointment"),
                },
                {
                    key: "intreatment-patients",
                    icon: <TeamOutlined />,
                    label: "Đang điều trị",
                    onClick: () => router.push("/management/inTreatmentPatient"),
                },
                {
                    key: "doctor-settings",
                    icon: <SettingOutlined />,
                    label: "Tài khoản",
                    onClick: () => router.push("/management/settings"),

                },
            ];
    if (user === "patient") {
        return (
            <ConfigProvider
                theme={{
                    token: { colorPrimary: "#0d9488", colorBgLayout: "#f9fafb" },
                    components: {
                        Menu: { itemSelectedBg: "#009688", itemSelectedColor: "#fff" },
                    },
                }}
            >
                <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
                    <Content className="m-6 p-6 bg-white rounded-xl shadow-md">
                        {children}
                    </Content>
                </Layout>
            </ConfigProvider>
        );
    }
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#0d9488",
                    colorBgLayout: "#f9fafb",
                },
                components: {
                    Menu: {
                        itemSelectedBg: "#009688",
                        itemSelectedColor: "#fff",
                    },
                },
            }}
        >
            <Layout style={{ minHeight: "100vh" }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={250}
                    style={{
                        background: "linear-gradient(180deg,rgb(173, 207, 241) 0%,rgb(190, 243, 238) 100%)",
                        color: "white",
                    }}
                >
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        {!collapsed && (
                            <div className="flex-shrink-0">
                                <Link href="/management">
                                    <img
                                        src="/images/logoEcare.png"
                                        alt="Logo"
                                        className="h-12 md:h-12"
                                    />
                                </Link>
                            </div>
                        )}
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: "white" }}
                        />
                    </div>

                    <Menu
                        mode="inline"
                        selectedKeys={[getSelectedKey()]}
                        items={menuItems}
                        style={{
                            background: "transparent",
                            color: "white",
                        }}
                    />
                </Sider>

                <Layout style={{ background: "#f9fafb" }}>
                    <Content className="m-6 p-6 bg-white rounded-xl shadow-md">
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default ManagementLayout;
