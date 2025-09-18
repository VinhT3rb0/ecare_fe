import { configureStore } from '@reduxjs/toolkit';
import authReducer from "@/lib/features/authSlice";
import collapseReducer from "@/lib/features/collapseSlice";
import searchParamsReducer from "@/lib/features/searchParamsSlice";
import { apiAccount } from '@/api/app_home/apiAccount';
import apiPackage from '@/api/app_package/apiPackage';
import apiDepartmentDoctor from '@/api/app_doctor/apiDepartmentDoctor';
import apiDoctor from '@/api/app_doctor/apiDoctor';
import apiSchedulesDoctor from '@/api/app_doctor/apiSchedulesDoctor';
import apiRoom from '@/api/app_room/apiRoom';
import { apiDegree } from '@/api/app_degree/apiDegree';
import { apiChat } from '@/api/app_chat/apiChatbox';
import { apiAppointment } from '@/api/app_apointment/apiAppointment';
import { apiInvoice } from '@/api/app_invoice/apiInvoice';
import { apiPayment } from '@/api/app_payment/apiPayment';
import { apiMedicine } from '@/api/app_medicine/apiMedicine';
import { apiMedicalRecord } from '@/api/app_medical_record/apiMedicalRecord';
export interface RootState {
}

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            collapse: collapseReducer,
            searchParams: searchParamsReducer,
            [apiAccount.reducerPath]: apiAccount.reducer,
            [apiPackage.reducerPath]: apiPackage.reducer,
            [apiDepartmentDoctor.reducerPath]: apiDepartmentDoctor.reducer,
            [apiDoctor.reducerPath]: apiDoctor.reducer,
            [apiSchedulesDoctor.reducerPath]: apiSchedulesDoctor.reducer,
            [apiDegree.reducerPath]: apiDegree.reducer,
            [apiRoom.reducerPath]: apiRoom.reducer,
            [apiChat.reducerPath]: apiChat.reducer,
            [apiAppointment.reducerPath]: apiAppointment.reducer,
            [apiInvoice.reducerPath]: apiInvoice.reducer,
            [apiPayment.reducerPath]: apiPayment.reducer,
            [apiMedicine.reducerPath]: apiMedicine.reducer,
            [apiMedicalRecord.reducerPath]: apiMedicalRecord.reducer,



        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(
                apiAccount.middleware,
                apiPackage.middleware,
                apiDepartmentDoctor.middleware,
                apiDoctor.middleware,
                apiSchedulesDoctor.middleware,
                apiDegree.middleware,
                apiRoom.middleware,
                apiChat.middleware,
                apiAppointment.middleware,
                apiInvoice.middleware,
                apiPayment.middleware,
                apiMedicine.middleware,
                apiMedicalRecord.middleware
            ),
    });
};

// Export store type
export type AppStore = ReturnType<typeof makeStore>; 