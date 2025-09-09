import React from "react";
import Profile from "@/views/profile/Profile";
function page() {
    return <div>
        <div className={`absolute top-0 left-0 w-full h-[250px] bg-gradient-to-b  from-blue-500 z-0`}></div>

        <Profile />
    </div>
}

export default page;
