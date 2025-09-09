"use client";
import { ConfigProvider } from "antd";
import React from "react";

const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <ConfigProvider getPopupContainer={() => document.body}>
            {children}
        </ConfigProvider>
    );
};

export default AntdConfigProvider;
