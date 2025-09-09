"use client";
import React, { useState } from 'react';
import { Tabs } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import DoctorAccount from './components/doctorAccount';
import DoctorShift from './components/doctorShift';
const DoctorManage = () => {
    const [activeTab, setActiveTab] = useState('1');

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <UserOutlined />
                    Quản lý tài khoản bác sĩ
                </span>
            ),
            children: <DoctorAccount />,
        },
        {
            key: '2',
            label: (
                <span>
                    <CalendarOutlined />
                    Lịch làm việc bác sĩ
                </span>
            ),
            children: <DoctorShift />,
        },
    ]
    return (
        <div className="p-6">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                size="large"
                items={items}
            >
            </Tabs>
        </div>
    );
};

export default DoctorManage;
