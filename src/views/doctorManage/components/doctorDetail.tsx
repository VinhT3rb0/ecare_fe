// doctorDetail.tsx
"use client";
import React from "react";
import { Tabs } from "antd";
import PersonalAndDegreeInfo from "./personalAndDegreeInfo";
import ScheduleTab from "./scheduleTab";
// import ScheduleTab from "./ScheduleTab";
// import PatientsTab from "./PatientsTab";
// import ReviewsTab from "./ReviewsTab";

const DoctorDetail = ({ doctor }: { doctor: any }) => {
    console.log(doctor);

    return (
        <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="Thông tin & Bằng cấp" key="1">
                <PersonalAndDegreeInfo doctor={doctor} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Lịch làm việc" key="2">
                <ScheduleTab doctorId={doctor.id} />
            </Tabs.TabPane>
            {/* <Tabs.TabPane tab="Bệnh nhân" key="3">
                <PatientsTab doctorId={doctor.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Đánh giá" key="4">
                <ReviewsTab doctorId={doctor.id} />
            </Tabs.TabPane> */}
        </Tabs>
    );
};

export default DoctorDetail;
