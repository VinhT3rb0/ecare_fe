import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

interface MedicalRecord {
    id: number;
    appointment_id: number;
    symptoms: string;
    diagnosis: string;
    notes: string;
    created_at: string;
    Appointment?: {
        id: number;
        patient_name: string;
        patient_phone: string;
        patient_email: string;
        appointment_date: string;
        time_slot: string;
        reason: string;
        Doctor?: {
            id: number;
            full_name: string;
            phone: string;
        };
        Department?: {
            id: number;
            name: string;
        };
    };
    medications?: MedicalRecordMedication[];
    services?: MedicalRecordService[];
}

interface MedicalRecordMedication {
    id: number;
    medical_record_id: number;
    medicine_id: number;
    quantity: number;
    dosage: string;
    instructions: string;
    medicine?: {
        id: number;
        name: string;
        unit: string;
        price: number;
        description?: string;
    };
}

interface MedicalRecordService {
    id: number;
    medical_record_id: number;
    package_id: number;
    quantity: number;
    notes: string;
    package?: {
        id: number;
        name: string;
        price: number;
        description?: string;
    };
}

interface MedicalRecordResponse {
    success: boolean;
    data: MedicalRecord | MedicalRecord[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface CreateMedicalRecordRequest {
    appointment_id: number;
    symptoms: string;
    diagnosis: string;
    notes: string;
    medications?: {
        medicine_id: number;
        quantity: number;
        dosage: string;
        instructions: string;
    }[];
    services?: {
        package_id: number;
        quantity: number;
        notes: string;
    }[];
}

interface UpdateMedicalRecordRequest {
    symptoms?: string;
    diagnosis?: string;
    notes?: string;
    medications?: {
        medicine_id: number;
        quantity: number;
        dosage: string;
        instructions: string;
    }[];
    services?: {
        package_id: number;
        quantity: number;
        notes: string;
    }[];
}

export const apiMedicalRecord = createApi({
    reducerPath: "medicalRecordApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/medical-record/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    tagTypes: ["MedicalRecord"],
    endpoints: (builder) => ({
        // Lấy danh sách hồ sơ bệnh án
        getMedicalRecords: builder.query<MedicalRecordResponse, {
            doctor_id?: number;
            patient_id?: number;
            appointment_id?: number;
            page?: number;
            limit?: number;
        }>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        searchParams.append(key, value.toString());
                    }
                });
                return `/?${searchParams.toString()}`;
            },
            providesTags: ["MedicalRecord"],
        }),

        // Lấy chi tiết hồ sơ bệnh án
        getMedicalRecordById: builder.query<MedicalRecordResponse, number>({
            query: (id) => `/${id}`,
            providesTags: ["MedicalRecord"],
        }),

        // Tạo hồ sơ bệnh án mới
        createMedicalRecord: builder.mutation<MedicalRecordResponse, CreateMedicalRecordRequest>({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MedicalRecord"],
        }),

        // Cập nhật hồ sơ bệnh án
        updateMedicalRecord: builder.mutation<MedicalRecordResponse, {
            id: number;
            data: UpdateMedicalRecordRequest;
        }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["MedicalRecord"],
        }),

        // Xóa hồ sơ bệnh án
        deleteMedicalRecord: builder.mutation<MedicalRecordResponse, number>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MedicalRecord"],
        }),

        // Lấy hồ sơ bệnh án theo bác sĩ
        getMedicalRecordsByDoctor: builder.query<MedicalRecordResponse, {
            doctor_id: number;
            page?: number;
            limit?: number;
        }>({
            query: ({ doctor_id, page = 1, limit = 10 }) =>
                `/doctor/${doctor_id}?page=${page}&limit=${limit}`,
            providesTags: ["MedicalRecord"],
        }),

        // Lấy hồ sơ bệnh án theo bệnh nhân
        getMedicalRecordsByPatient: builder.query<MedicalRecordResponse, {
            patient_id: number;
            page?: number;
            limit?: number;
        }>({
            query: ({ patient_id, page = 1, limit = 10 }) =>
                `/patient/${patient_id}?page=${page}&limit=${limit}`,
            providesTags: ["MedicalRecord"],
        }),
    }),
});

export const {
    useGetMedicalRecordsQuery,
    useGetMedicalRecordByIdQuery,
    useCreateMedicalRecordMutation,
    useUpdateMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
    useGetMedicalRecordsByDoctorQuery,
    useGetMedicalRecordsByPatientQuery,
} = apiMedicalRecord;
