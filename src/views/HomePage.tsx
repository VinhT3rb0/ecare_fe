"use client"
import CustomCarousel from "@/views/homePage/components/Carousel";
import Navbar from "@/components/Navbar/NavBar";
import ServicesSection from "@/views/homePage/components/ServicesSection";
import { Button, notification } from "antd";
import React from "react";
import IntroSection from "./homePage/components/IntroSection";
import SupportTreatmentSection from "./homePage/components/SupportTreatmentSection";
import BookingSection from "./homePage/components/BookingSection";
import ChatBox from "./homePage/components/ChatBox";
import { getCookie } from "cookies-next";
import Footer from "@/components/Footer/Footer";
import WhyChooseUs from "./homePage/components/WhyChooseUs";

function HomePage() {
    const role = getCookie('role');
    return (
        <>
            <Navbar />
            <CustomCarousel />
            <ServicesSection />
            <IntroSection
                backgroundImage="/images/homePage/Introsection.jpg"
                featureImage="/images/homePage/doctor.jpg"
            />
            <WhyChooseUs />
            <SupportTreatmentSection featureImage="/images/homePage/treatment.jpg" />
            <BookingSection
                bookingImage="/images/homePage/bookingSection.jpg"
                qaImage="/images/homePage/qaSection.jpg"
            />
            {role === 'patient' && <ChatBox />}
            <Footer />
        </>
    )
}

export default HomePage;