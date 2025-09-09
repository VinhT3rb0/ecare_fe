"use client";
import React, { useState } from "react";
import {
    Tabs,
    Button,
    Modal,
} from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import ProfileDoctor from "./components/ProfileDoctor";
import DegreeDoctor from "./components/DegreeDoctor";
import { toast } from "react-hot-toast";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";

const SettingPage = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();
    const idUser = getCookie("idUser") as string;
    const { data: doctorData } = useGetMyDoctorQuery(idUser);
    const idDoctor = doctorData?.id;

    const handleLogout = () => {
        deleteCookie("access_token");
        deleteCookie("role");
        deleteCookie("idUser");
        router.push("/login");
        toast.success("Đăng xuất thành công!");
        setModalOpen(false);
    };

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <UserOutlined />
                    Thông tin cá nhân
                </span>
            ),
            children: <ProfileDoctor idDoctor={idDoctor} idUser={idUser} />,
        },
        {
            key: '2',
            label: (
                <span>
                    <FileTextOutlined />
                    Thông tin bằng cấp
                </span>
            ),
            children: <DegreeDoctor idDoctor={idDoctor} is_approved={doctorData?.is_approved} />,
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    size="large"
                    items={items}
                />
                <div className="flex justify-between items-center">
                    <div>

                    </div>
                    <Button
                        type="primary"
                        style={{ marginTop: "20px" }}
                        danger
                        icon={<LogoutOutlined />}
                        size="large"
                        onClick={() => setModalOpen(true)}
                    >
                        Đăng xuất
                    </Button>
                </div>
            </div>
            <Modal
                open={modalOpen}
                onOk={handleLogout}
                onCancel={() => setModalOpen(false)}
                okText="Đăng xuất"
                cancelText="Hủy"
                title="Xác nhận đăng xuất"
            >
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </Modal>
        </div>
    );
};

export default SettingPage;
