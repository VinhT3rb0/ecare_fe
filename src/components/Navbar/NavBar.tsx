"use client";

import React from 'react';
import {
    BellOutlined,
    UserOutlined,
    DownOutlined,
    LogoutOutlined,
    ProfileOutlined,
    PhoneOutlined,
} from '@ant-design/icons';
import { getCookie, deleteCookie } from 'cookies-next';
import { Dropdown, Avatar, Button, MenuProps, Badge } from 'antd';
import Link from 'next/link';
import { useGetAccountQuery } from '@/api/app_home/apiAccount';
import { useRouter } from 'next/navigation';
import { useGetAppointmentsByPatientQuery } from '@/api/app_apointment/apiAppointment';
import { useGetMyDoctorQuery } from '@/api/app_doctor/apiDoctor';

const Navbar = () => {
    const role = getCookie("role");
    const userIdCookie = getCookie("idUser");
    const patientIdCookie = userIdCookie;
    const { data: user, isLoading } = useGetAccountQuery();
    const router = useRouter();
    const [isFixed, setIsFixed] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsFixed(true);
            } else {
                setIsFixed(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        deleteCookie("access_token");
        deleteCookie("role");
        deleteCookie("idUser");
        router.push("/");
        window.location.reload();
    };

    const userMenuItems: MenuProps['items'] = [

        {
            key: "profile",
            icon: <ProfileOutlined />,
            label: <Link href="/profile">Tài khoản</Link>,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];
    const { data: myDoctor } = useGetMyDoctorQuery(userIdCookie as string, { skip: role !== 'doctor' || !userIdCookie });
    const { data: appts } = useGetAppointmentsByPatientQuery(
        { patient_id: Number(patientIdCookie) || 0 },
        { skip: !patientIdCookie }
    );

    const allAppts = (appts?.data || []) as any[];
    const sortedAppts = [...allAppts].sort((a, b) => {
        return new Date(b.createdAt || b.created_at || 0).getTime() -
            new Date(a.createdAt || a.created_at || 0).getTime();
    });
    const confirmedNotifs = sortedAppts.filter((a) => a.status === 'confirmed');
    const cancelledNotifs = sortedAppts.filter((a) => a.status === 'cancelled');
    const cancelRequestedNotifs = sortedAppts.filter((a) => a.status === 'cancel_requested');
    const notifications = [...confirmedNotifs, ...cancelledNotifs, ...cancelRequestedNotifs].slice(0, 3);
    const notifCount = notifications.length;
    const notifMenu: MenuProps['items'] = notifications.map((a: any) => ({
        key: String(a.id),
        label: (
            <Link href="/profile">
                {a.status === 'confirmed' ? (
                    <>
                        <p>Xin chào <span className="font-bold">{a.patient_name}</span></p>
                        <p>Lịch hẹn của bạn đã được bác sĩ xác nhận.</p>
                        <p>Ngày khám: {a.appointment_date}</p>
                        <p>Khung giờ: {a.time_slot}</p>
                        <p>Vui lòng đến đúng giờ. Cám ơn bạn!</p>
                    </>
                ) : a.status === 'cancelled' ? (
                    <>
                        <p>Xin chào <span className="font-bold">{a.patient_name}</span></p>
                        <p>Yêu cầu hủy lịch hẹn của bạn đã được xác nhận.</p>
                        <p>Ngày: {a.appointment_date}</p>
                        <p>Khung giờ: {a.time_slot}</p>
                        {a.cancel_reason && <p>Lý do: {a.cancel_reason}</p>}
                    </>
                ) : (
                    <>
                        <p>Xin chào <span className="font-bold">{a.patient_name}</span></p>
                        <p>Yêu cầu hủy lịch hẹn của bạn đang chờ xác nhận.</p>
                        <p>Ngày: {a.appointment_date}</p>
                        <p>Khung giờ: {a.time_slot}</p>
                        {a.cancel_reason && <p>Lý do: {a.cancel_reason}</p>}
                    </>
                )}
            </Link>
        ),
    }));
    return (
        <nav
            className={`top-0 left-0 w-full z-200 px-6 py-3 flex items-center justify-between
        transition-all duration-500 ease-in-out
        ${isFixed
                    ? 'fixed bg-gradient-to-r from-[#0A3C73]/95 to-[#00A78E]/95 shadow-lg backdrop-blur-md'
                    : 'absolute bg-black/60 shadow-md'
                }`}
        >
            <div className="flex-shrink-0">
                <Link href="/">
                    <img src="/images/logoEcare.png" alt="Logo" className="h-12 md:h-16" />
                </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-white hover:text-[#11A998] font-medium">Trang chủ</Link>
                <Link href="/specialties" className="text-white hover:text-[#11A998] font-medium">Chuyên khoa</Link>
                <Link href="/doctors" className="text-white hover:text-[#11A998] font-medium">Đội ngũ bác sĩ</Link>
                <Link href="/" className="text-white hover:text-[#11A998] font-medium">Tuyển dụng</Link>
                <Link href="/" className="text-white hover:text-[#11A998] font-medium">Liên hệ</Link>
                {(role === "admin" || role === "doctor") && (
                    <Link href="/management" className="text-white hover:text-[#11A998] font-medium">Quản lý</Link>
                )}
            </div>
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-white">
                    <PhoneOutlined className="text-xl text-[#00FFCF]" />
                    <span className="hidden sm:block">Cấp cứu: 1900 686 888</span>
                </div>
                {user && !isLoading ? (
                    <>
                        <Dropdown menu={{ items: notifMenu }} trigger={["click"]}>
                            <div className="cursor-pointer">
                                <Badge count={notifCount} size="small">
                                    <BellOutlined style={{ color: '#fff' }} className="text-xl hover:text-[#11A998]" />
                                </Badge>
                            </div>
                        </Dropdown>
                        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                            <div className="flex items-center cursor-pointer text-white hover:text-[#11A998] space-x-3">
                                <Avatar
                                    size="large"
                                    icon={<UserOutlined />}
                                    className="bg-gray-300"
                                />
                                <span className="font-medium truncate max-w-[160px] text-white">
                                    {role === 'doctor' && myDoctor?.full_name ? myDoctor.full_name : user.data.full_name}
                                </span>
                                <DownOutlined className="text-sm text-white" />
                            </div>
                        </Dropdown>
                    </>
                ) : (
                    <Link href="/login">
                        <Button
                            type="primary"
                            className="rounded-full px-6 text-white !bg-teal-600 shadow-lg hover:!bg-teal-700 transition"
                        >
                            Đăng nhập
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
