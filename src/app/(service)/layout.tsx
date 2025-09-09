"use client"
import Navbar from "@/components/Navbar/NavBar";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="flex h-full relative ">
                <div className="flex-1 min-h-screen">
                    {/* <Navbar /> */}
                    <div className="w-full h- full relative"> {children}</div>
                </div>
            </div>
        </>
    );
}