import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
interface GetPackagesParams {
    page?: number;
    limit?: number;
    name?: string;
}
export const apiDoctor = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-doctor/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "doctorApi",
    tagTypes: ["Doctor"],
    endpoints: (builder) => ({
        getAllDoctors: builder.query<any, GetPackagesParams | void>({
            query: (params) => {
                let queryString = "";
                if (params) {
                    const searchParams = new URLSearchParams();
                    if (params.page) searchParams.append("page", params.page.toString());
                    if (params.limit) searchParams.append("limit", params.limit.toString());
                    if (params.name) searchParams.append("name", params.name);
                    queryString = `?${searchParams.toString()}`;
                }
                return `doctor-list/${queryString}`;
            },
            providesTags: [{ type: "Doctor" }],
        }),
        createDoctorAccount: builder.mutation<any, { email: string; password: string; full_name: string }>({
            query: (body) => ({
                url: "/create-doctor",
                method: "POST",
                body
            }),
            invalidatesTags: ["Doctor"]
        }),
        getMyDoctor: builder.query<any, string>({
            query: (idUser) => `/profile/${idUser}`,
            providesTags: [{ type: "Doctor" }],
            keepUnusedDataFor: 3600,
        }),
        getDoctorApproved: builder.query<any, GetPackagesParams | void>({
            query: (params) => {
                let queryString = "";
                if (params) {
                    const searchParams = new URLSearchParams();
                    if (params.page) searchParams.append("page", params.page.toString());
                    if (params.limit) searchParams.append("pageSize", params.limit.toString());
                    if (params.name) searchParams.append("name", params.name);
                    queryString = `?${searchParams.toString()}`;
                }
                return `doctor-approved${queryString}`;
            },
            transformResponse: (response: any) => {
                // Normalize so both "doctors" and "approvedDoctors" are available
                if (response && typeof response === 'object') {
                    return {
                        ...response,
                        approvedDoctors: response.doctors ?? [],
                    };
                }
                return response;
            },
            providesTags: [{ type: "Doctor" }],
        }),
        updateMyDoctor: builder.mutation<any, { idUser: string; data: any }>({
            query: ({ idUser, data }) => ({
                url: `/profile/${idUser}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [{ type: "Doctor" }],
        }),
        updateDoctorAndDegree: builder.mutation<any, { doctor_id: number; formData: FormData }>({
            query: ({ doctor_id, formData }) => ({
                url: `/doctors/${doctor_id}/update-doctor-degree`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Doctor"], // Nếu bạn có dùng cache tag
        }),
        approvalDoctor: builder.mutation<any, { doctor_id: string }>({
            query: ({ doctor_id }) => ({
                url: `/approve-doctor/${doctor_id}/`,
                method: "POST",
            }),
            invalidatesTags: [{ type: "Doctor" }],
        }),
        getDoctorByDepartment: builder.query<any, any>({
            query: (department_id) => ({
                url: `/${department_id}/doctor`,
                method: "GET",
            }),
        }),
        getDoctorsByDateAndDepartment: builder.query<any, { date: string; department_id: number }>({
            query: ({ date, department_id }) => ({
                url: `/by-date-and-department?date=${date}&department_id=${department_id}`,
                method: "GET",
            }),
            providesTags: [{ type: "Doctor" }],
        }),
    }),
});

export const {
    useGetAllDoctorsQuery,
    useGetMyDoctorQuery,
    useGetDoctorsByDateAndDepartmentQuery,
    useUpdateMyDoctorMutation,
    useUpdateDoctorAndDegreeMutation,
    useGetDoctorByDepartmentQuery,
    useCreateDoctorAccountMutation,
    useApprovalDoctorMutation,
    useGetDoctorApprovedQuery
} = apiDoctor;
export default apiDoctor;