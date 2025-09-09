import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
import { get } from "http";
interface Appointment {
    id: number;
    patient_name: string;
    patient_dob: string;
    patient_phone: string;
    patient_email: string | null;
    patient_gender: "male" | "female" | "other";
    patient_address: string;
    doctor_id: number;
    department_id: number;
    schedule_id: number;
    appointment_date: string;
    time_slot: string;
    reason: string | null;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "cancel_requested" | "in_treatment";
    createdAt: string;
    updatedAt: string;
    DoctorSchedule?: { date: string };
}

interface AppointmentResponse {
    success: boolean;
    data: Appointment[];
}

export const apiAppointment = createApi({
    reducerPath: "appointmentApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-appointment/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ["Appointment"],
    endpoints: (builder) => ({
        getAppointments: builder.query<any[], void>({
            query: () => `/`,
            providesTags: ["Appointment"],
        }),
        getAppointmentById: builder.query<any, string | number>({
            query: (id) => `/${id}`,
            providesTags: ["Appointment"],
        }),
        createAppointment: builder.mutation<any, any>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Appointment"],
        }),
        updateAppointment: builder.mutation<any, { id: string | number; data: any }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Appointment"],
        }),
        requestCancelAppointment: builder.mutation<any, { id: number; reason?: string }>({
            query: ({ id, reason }) => ({
                url: `/${id}/cancel-request`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Appointment"],
        }),
        approveCancelAppointment: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `/${id}/cancel-approve`,
                method: "POST",
            }),
            invalidatesTags: ["Appointment"],
        }),
        rejectCancelAppointment: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `/${id}/cancel-reject`,
                method: "POST",
            }),
            invalidatesTags: ["Appointment"],
        }),
        deleteAppointment: builder.mutation<any, string | number>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Appointment"],
        }),
        getAvailableTimeSlots: builder.query<string[], { doctor_id: number; appointment_date: string }>({
            query: ({ doctor_id, appointment_date }) =>
                `/available-time-slots/${doctor_id}/${appointment_date}`, // Sử dụng URL đơn giản
            transformResponse: (response: any) => response.data || [], // Đảm bảo trả về mảng
        }),
        getAppointmentsByDoctor: builder.query<AppointmentResponse, { doctor_id: number }>({
            query: ({ doctor_id }) => `/doctor/${doctor_id}`,
            providesTags: ["Appointment"],
        }),
        getAppointmentsByPatient: builder.query<AppointmentResponse, { patient_id: number }>({
            query: ({ patient_id }) => `/patient/${patient_id}`,
            providesTags: ["Appointment"],
        }),
        getAppointmentsByStatus: builder.query<AppointmentResponse, { status: string }>({
            query: ({ status }) => `/status/${status}`,
            providesTags: ["Appointment"],
        }),
    }),
});

export const {
    useGetAppointmentsQuery,
    useGetAppointmentByIdQuery,
    useGetAvailableTimeSlotsQuery,
    useGetAppointmentsByDoctorQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
    useGetAppointmentsByPatientQuery,
    useRequestCancelAppointmentMutation,
    useApproveCancelAppointmentMutation,
    useRejectCancelAppointmentMutation,
    useGetAppointmentsByStatusQuery,
} = apiAppointment;