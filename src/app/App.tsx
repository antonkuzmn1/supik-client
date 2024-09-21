import './App.scss';
import React, {ReactNode} from "react";
import Page from "./pages/Page.tsx";
import IconAccount from "./icons/IconAccount.tsx";
import IconAccounts from "./icons/IconAccounts.tsx";
import IconGroups from "./icons/IconGroups.tsx";
import IconRouters from "./icons/IconRouters.tsx";
import IconVpns from "./icons/IconVpns.tsx";
import IconUsers from "./icons/IconUsers.tsx";
import IconMails from "./icons/IconMails.tsx";
import IconItems from "./icons/IconItems.tsx";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import PageAccount from "./pages/PageAccount.tsx";
import PageAccounts from "./pages/PageAccounts.tsx";
import PageGroups from "./pages/PageGroups.tsx";
import PageRouters from "./pages/PageRouters.tsx";
import PageVpns from "./pages/PageVpns.tsx";
import PageUsers from "./pages/PageUsers.tsx";
import PageMails from "./pages/PageMails.tsx";
import PageItems from "./pages/page-items/PageItems.tsx";
import useDevice from "../hooks/useDevice.ts";
import {useAccount} from "../hooks/useAccount.ts";
import Loading from "./loading/Loading.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../utils/store.ts";
import NotSupported from "./not-supported/NotSupported.tsx";
import {DeviceSize} from "../slices/deviceSlice.ts";
import Auth from "./auth/Auth.tsx";
import Dialog from "./dialogs/Dialog.tsx";
import {setAppError} from "../slices/appSlice.ts";
import PageLogs from "./pages/PageLogs.tsx";
import IconLogs from "./icons/IconLogs.tsx";
import PageDepartments from "./pages/PageDepartments.tsx";
import IconDepartments from "./icons/IconDepartments.tsx";

export interface RoutePageInterface {
    path: string;
    element: ReactNode;
    icon: ReactNode;
    title: string;
    admin: boolean;
}

export const routePages: RoutePageInterface[] = [
    {path: '/account', element: <Page element={<PageAccount/>}/>, icon: <IconAccount/>, title: "", admin: false},
    {path: '/accounts', element: <Page element={<PageAccounts/>}/>, icon: <IconAccounts/>, title: "Accounts", admin: true},
    {path: '/groups', element: <Page element={<PageGroups/>}/>, icon: <IconGroups/>, title: "Groups", admin: true},
    {path: '/routers', element: <Page element={<PageRouters/>}/>, icon: <IconRouters/>, title: "Routers", admin: false},
    {path: '/vpns', element: <Page element={<PageVpns/>}/>, icon: <IconVpns/>, title: "VPNs", admin: false},
    {path: '/users', element: <Page element={<PageUsers/>}/>, icon: <IconUsers/>, title: "Users", admin: false},
    {path: '/departments', element: <Page element={<PageDepartments/>}/>, icon: <IconDepartments/>, title: "Departments", admin: false},
    {path: '/mails', element: <Page element={<PageMails/>}/>, icon: <IconMails/>, title: "Mails",  admin: true},
    {path: '/items', element: <Page element={<PageItems/>}/>, icon: <IconItems/>, title: "Items", admin: true},
    {path: '/logs', element: <Page element={<PageLogs/>}/>, icon: <IconLogs/>, title: "Logs", admin: true},
];

const router = createBrowserRouter([
    {path: "*", element: <Navigate to="/account"/>},
    ...routePages.map(page => ({
        path: page.path,
        element: page.element
    }))
]);

const App: React.FC = () => {
    useAccount();
    useDevice();

    const dispatch = useDispatch();

    const deviceSize = useSelector((state: RootState) => state.device.size);
    const authorized = useSelector((state: RootState) => state.account.authorized);
    const loading = useSelector((state: RootState) => state.app.loading);
    const error = useSelector((state: RootState) => state.app.error);

    return (
        <div className='App'>
            {deviceSize !== DeviceSize.Large
                ? <NotSupported/>
                : !authorized ? <Auth/> : <RouterProvider router={router}/>
            }
            {loading && <Loading/>}
            {error.length > 0 && <Dialog
                title={'Error'}
                close={() => dispatch(setAppError(''))}
                children={
                    <p>{error}</p>
                }
                buttons={[
                    {action: () => dispatch(setAppError('')), text: 'Close'}
                ]}
            />}
        </div>
    )
}

export default App
