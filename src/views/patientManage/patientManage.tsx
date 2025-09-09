"use client";

import { Tabs } from "antd";
import PendingAppointments from "./components/PendingAppointments";
import ConfirmedAppointments from "./components/ConfirmedAppointments";
import CancelledAppointments from "./components/CancelledAppointments";
import CompletedAppointments from "./components/CompletedAppointments";
import CancelRequestedAppointments from "./components/CancelRequestedAppointments";
import InTreatmentAppointments from "./components/InTreatmentAppointments";


export default function PatientManage() {
    return (
        <div>
            <Tabs
                defaultActiveKey="pending"
                items={[
                    {
                        key: "pending",
                        label: "Đang chờ",
                        children: <PendingAppointments />,
                    },
                    {
                        key: "cancel_requested",
                        label: "Yêu cầu hủy",
                        children: <CancelRequestedAppointments />,
                    },
                    {
                        key: "confirmed",
                        label: "Đã xác nhận",
                        children: <ConfirmedAppointments />,
                    },
                    {
                        key: "in_treatment",
                        label: "Đang điều trị",
                        children: <InTreatmentAppointments />,
                    },
                    {
                        key: "completed",
                        label: "Đã hoàn thành",
                        children: <CompletedAppointments />,
                    },
                    {
                        key: "cancelled",
                        label: "Đã hủy",
                        children: <CancelledAppointments />,
                    },
                ]}
            />
        </div>
    );
}


