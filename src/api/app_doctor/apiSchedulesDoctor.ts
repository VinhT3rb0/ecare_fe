// src/api/schedules/apiSchedulesDoctor.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

// Types
export interface DoctorSchedule {
    id: number;
    doctor_id: number;
    date: string;
    room_id: number | null;
    status: 'scheduled' | 'in_progress' | 'late' | 'left_early' | 'completed' | 'absent' | 'cancelled';
    start_time?: string | null;
    end_time?: string | null;
    max_patients?: number | null;
    notes?: string | null;
    check_in_time?: string | null;
    check_out_time?: string | null;
    created_at: string;
    updated_at: string;
    Room?: {
        id: number;
        name: string;
        status: string;
        floor?: number | null;
    };
    Doctor?: {
        id: number;
        user_id?: number;
        full_name?: string;
        User?: {
            full_name?: string;
            email?: string;
            phone?: string;
        };
    };
}

export interface CreateScheduleRequest {
    doctor_id: number;
    date: string; // YYYY-MM-DD
    room_id: number;
    start_time?: string; // HH:mm:ss
    end_time?: string; // HH:mm:ss
    max_patients?: number;
    notes?: string;
}

export interface UpdateScheduleRequest extends CreateScheduleRequest { }

export interface BulkScheduleRequest {
    schedules: CreateScheduleRequest[];
}

export interface ScheduleStats {
    total: number;
    by_status?: Array<{ status: string; count: number }>;
    by_date?: Array<{ date: string; count: number }>;
}

export interface Doctor {
    id: number;
    user_id?: number;
    User?: {
        full_name?: string;
        email?: string;
        phone?: string;
    };
}

interface GetSchedulesParams {
    doctor_id?: string;
    doctor_name?: string;
    start_date?: string;
    end_date?: string;
}

interface GetStatsParams {
    start_date?: string;
    end_date?: string;
}

export const apiSchedulesDoctor = createApi({
    reducerPath: "schedulesDoctorApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-doctor-schedule/v1`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ["DoctorSchedule"],
    endpoints: (builder) => ({
        // check in / check out
        checkIn: builder.mutation<{ success: boolean; message: string; data?: DoctorSchedule }, { id: number; doctor_id: number }>({
            query: ({ id, doctor_id }) => ({
                url: `/${id}/check-in`,
                method: "POST",
                body: { doctor_id },
            }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),
        checkOut: builder.mutation<{ success: boolean; message: string; data?: DoctorSchedule }, { id: number; doctor_id: number }>({
            query: ({ id, doctor_id }) => ({
                url: `/${id}/check-out`,
                method: "POST",
                body: { doctor_id },
            }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),

        // auto update statuses (admin internal)
        autoUpdateStatuses: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({ url: `/internal/auto-update-statuses`, method: "POST" }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),

        // Get my schedules (doctor's own schedules)
        getMySchedules: builder.query<
            { success: boolean; data: DoctorSchedule[]; count: number },
            { doctor_id?: string; start_date?: string; end_date?: string } | void
        >({
            query: (params) => {
                // prefer path param if doctor_id provided
                if (!params) return `/my-schedules`;
                const search = new URLSearchParams();
                if (params.start_date) search.append("start_date", params.start_date);
                if (params.end_date) search.append("end_date", params.end_date);

                if (params.doctor_id) {
                    const qs = search.toString();
                    return `/my-schedules/${params.doctor_id}${qs ? `?${qs}` : ""}`;
                }
                const qs = search.toString();
                return `/my-schedules${qs ? `?${qs}` : ""}`;
            },
            providesTags: (result) =>
                result && result.data
                    ? [...result.data.map(({ id }) => ({ type: "DoctorSchedule" as const, id })), { type: "DoctorSchedule" }]
                    : [{ type: "DoctorSchedule" }],
        }),

        // Get doctor schedules (admin / filters)
        getDoctorSchedules: builder.query<{ success: boolean; data: DoctorSchedule[]; count: number }, GetSchedulesParams | void>({
            query: (params) => {
                const search = new URLSearchParams();
                if (params) {
                    if (params.start_date) search.append("start_date", params.start_date);
                    if (params.end_date) search.append("end_date", params.end_date);
                    if (params.doctor_name) search.append("doctor_name", params.doctor_name);
                    if (params.doctor_id) search.append("doctor_id", params.doctor_id);
                }
                const qs = search.toString();
                return `${qs ? `/?${qs}` : "/"}`; // returns "/" or "/?..."
            },
            providesTags: (result) =>
                result && result.data
                    ? [...result.data.map(({ id }) => ({ type: "DoctorSchedule" as const, id })), { type: "DoctorSchedule" }]
                    : [{ type: "DoctorSchedule" }],
        }),

        // Get schedules for a particular doctor (2-week view)
        getSchedulesForDoctor: builder.query<{ success: boolean; data: DoctorSchedule[] }, { doctor_id: string }>({
            query: ({ doctor_id }) => `/doctor/${doctor_id}/schedules`,
            providesTags: (result) =>
                result && result.data
                    ? [...result.data.map(({ id }) => ({ type: "DoctorSchedule" as const, id })), { type: "DoctorSchedule" }]
                    : [{ type: "DoctorSchedule" }],
        }),

        // Get list of doctors working on a date
        getDoctorsForDate: builder.query<{ success: boolean; data: Doctor[] }, { date: string }>({
            query: ({ date }) => `/doctors-for-date/${date}`,
            providesTags: [{ type: "DoctorSchedule" }],
        }),

        // Create / update / delete
        createSchedule: builder.mutation<{ success: boolean; message: string; data: DoctorSchedule }, CreateScheduleRequest>({
            query: (data) => ({ url: `/`, method: "POST", body: data }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),
        createBulkSchedules: builder.mutation<
            { success: boolean; message: string; data: DoctorSchedule[]; errors?: any[] },
            BulkScheduleRequest
        >({
            query: (data) => ({ url: `/bulk`, method: "POST", body: data }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),
        updateSchedule: builder.mutation<{ success: boolean; message: string; data: DoctorSchedule }, { id: number; data: UpdateScheduleRequest }>({
            query: ({ id, data }) => ({ url: `/${id}`, method: "PUT", body: data }),
            invalidatesTags: (result, error, arg) => [{ type: "DoctorSchedule", id: arg.id }],
        }),
        deleteSchedule: builder.mutation<{ success: boolean; message: string }, number>({
            query: (id) => ({ url: `/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),
        deleteBulkSchedules: builder.mutation<{ success: boolean; message: string }, { schedule_ids: number[] }>({
            query: (data) => ({ url: `/bulk`, method: "DELETE", body: data }),
            invalidatesTags: [{ type: "DoctorSchedule" }],
        }),

        // Stats
        getScheduleStats: builder.query<{ success: boolean; data: ScheduleStats }, GetStatsParams | void>({
            query: (params) => {
                const s = new URLSearchParams();
                if (params?.start_date) s.append("start_date", params.start_date);
                if (params?.end_date) s.append("end_date", params.end_date);
                const qs = s.toString();
                return `/stats${qs ? `?${qs}` : ""}`;
            },
            providesTags: [{ type: "DoctorSchedule" }],
        }),
    }),
});

// Export hooks
export const {
    useCheckInMutation,
    useCheckOutMutation,
    useAutoUpdateStatusesMutation,
    useGetMySchedulesQuery,
    useGetDoctorSchedulesQuery,
    useGetSchedulesForDoctorQuery,
    useGetDoctorsForDateQuery,
    useCreateScheduleMutation,
    useCreateBulkSchedulesMutation,
    useUpdateScheduleMutation,
    useDeleteScheduleMutation,
    useDeleteBulkSchedulesMutation,
    useGetScheduleStatsQuery,
} = apiSchedulesDoctor;

export default apiSchedulesDoctor;
