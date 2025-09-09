import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
import { deleteCookie } from "cookies-next";
const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-home/v1/`,
    prepareHeaders: (headers) => {
        const accessToken = getAccessTokenFromCookie();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    }
});

const baseQuery = async (args: any, api: any, extraOptions: any) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        deleteCookie("access_token");
        deleteCookie("role");
        // if (typeof window !== "undefined") {
        //     window.location.href = "/login";
        // }
    }
    return result;
};
export const apiAccount = createApi({
    baseQuery,
    reducerPath: "accountApi",
    tagTypes: ["UserProfile", "Account", "OtherUnit", "PositionExpert", "Proofs"],
    endpoints: (builder) => ({
        updateProfile: builder.mutation({
            query: (data: any) => ({
                url: "update-profile/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "UserProfile" }],
        }),
        changePassword: builder.mutation({
            query: (data: any) => ({
                url: "change-password/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),

        createAccount: builder.mutation({
            query: (account) => ({
                url: "send-otp/",
                method: "POST",
                body: account,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),
        login: builder.mutation({
            query: (data) => ({
                url: "login/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),
        verifyAccount: builder.mutation({
            query: (data) => ({
                url: "verify-otp/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),

        getAccount: builder.query<any, void>({
            query: () => `profile/`,
            providesTags: [{ type: "Account" }],
        }),
        resetOtp: builder.mutation({
            query: (data) => ({
                url: "resend-otp/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),
        editAccount: builder.mutation({
            query: (account) => ({
                url: `profile/`,
                method: "PATCH",
                body: account,
            }),
            invalidatesTags: [{ type: "Account" }],
        }),

        deleteAccount: builder.mutation({
            query: (userId) => ({
                url: `user-account/`,
                method: "DELETE",
                body: { user_id: userId },
            }),
            invalidatesTags: [{ type: "Account" }],
        }),
        getPatientList: builder.query<any, void>({
            query: () => {
                return `patients/`;
            },
            providesTags: [{ type: "Account" }],
        }),

    }),
});

export const {
    useLoginMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useCreateAccountMutation,
    useEditAccountMutation,
    useVerifyAccountMutation,
    useDeleteAccountMutation,
    useGetAccountQuery,
    useGetPatientListQuery,
    useResetOtpMutation,
} = apiAccount;