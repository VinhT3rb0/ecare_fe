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
        getAppointmentsByDoctor: builder.query<AppointmentResponse, { doctor_id: number; status?: string }>({
            query: ({ doctor_id, status }) => {
                const params = new URLSearchParams();
                if (status) params.append('status', status);
                return `/doctor/${doctor_id}${params.toString() ? `?${params.toString()}` : ''}`;
            },
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
        getAppointmentsByDoctorAndDate: builder.query<AppointmentResponse, { doctor_id: number; appointment_date: string }>({
            query: ({ doctor_id, appointment_date }) => `/doctor/${doctor_id}/date/${appointment_date}`,
            providesTags: ["Appointment"],
        }),
        checkAppointmentAvailability: builder.query<{ success: boolean; available: boolean; message: string }, { patient_id: number; doctor_id: number; appointment_date: string; time_slot: string }>({
            query: ({ patient_id, doctor_id, appointment_date, time_slot }) =>
                `/check-availability?patient_id=${patient_id}&doctor_id=${doctor_id}&appointment_date=${appointment_date}&time_slot=${time_slot}`,
        }),
        startTreatment: builder.mutation<any, { id: number }>({
            query: ({ id }) => ({
                url: `/${id}/start-treatment`,
                method: "POST",
            }),
            invalidatesTags: ["Appointment"],
        }),
        autoCancelOverdueAppointments: builder.mutation<any, void>({
            query: () => ({
                url: `/auto-cancel-overdue`,
                method: "POST",
            }),
            invalidatesTags: ["Appointment"],
        }),
        doctorCancelAppointment: builder.mutation<any, { id: number; reason?: string }>({
            query: ({ id, reason }) => ({
                url: `/${id}/doctor-cancel`,
                method: "POST",
                body: { reason },
            }),
            invalidatesTags: ["Appointment"],
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
    useGetAppointmentsByDoctorAndDateQuery,
    useCheckAppointmentAvailabilityQuery,
    useStartTreatmentMutation,
    useAutoCancelOverdueAppointmentsMutation,
    useDoctorCancelAppointmentMutation,
} = apiAppointment;