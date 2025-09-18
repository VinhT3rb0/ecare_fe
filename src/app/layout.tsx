
import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "antd/dist/reset.css";
import "./globals.css";
import { Metadata } from "next";
import StoreProvider from "./StoreProvider";
import AntdConfigProvider from "./AntdConfigProvider";
import { Toaster } from "react-hot-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="vi">
    <body>
      <StoreProvider>
        <AntdRegistry>
          <AntdConfigProvider>
            <Toaster position="top-center"
              reverseOrder={false} />
            {children}
          </AntdConfigProvider>
        </AntdRegistry>
      </StoreProvider>
    </body>
  </html>
);

export default RootLayout;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Phòng khám Thanh Bình";
  const description = "Phòng khám Thanh Bình - Nền tảng quản lý và chăm sóc sức khỏe trực tuyến";

  return {
    title,
    description,
    icons: {
      icon: "/ICB_logo.svg",
      apple: "/ICB_logo.svg",
    },
    openGraph: {
      title,
      description,
      url: "https://nextjs.org",
      siteName: title,
      images: [
        {
          url: "/ICB_logo.svg",
          width: 800,
          height: 600,
        },
      ],
      type: "website",
    },
  };
}
