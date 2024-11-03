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
// import IconItems from "./icons/IconItems.tsx";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import PageAccount from "./pages/PageAccount.tsx";
import PageAccounts from "./pages/PageAccounts.tsx";
import PageGroups from "./pages/PageGroups.tsx";
import PageRouters from "./pages/PageRouters.tsx";
import PageVpns from "./pages/PageVpns.tsx";
import PageUsers from "./pages/PageUsers.tsx";
import PageMails from "./pages/PageMails.tsx";
// import PageItems from "./pages/page-items/PageItems.tsx";
import useDevice from "../hooks/useDevice.ts";
import {useAccount} from "../hooks/useAccount.ts";
import Loading from "./loading/Loading.tsx";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../utils/store.ts";
import NotSupported from "./not-supported/NotSupported.tsx";
import {DeviceSize} from "../slices/deviceSlice.ts";
import Auth from "./auth/Auth.tsx";
import Dialog from "./dialogs/Dialog.tsx";
import {setAppError, setAppMessage} from "../slices/appSlice.ts";
import PageLogs from "./pages/PageLogs.tsx";
import IconLogs from "./icons/IconLogs.tsx";
import PageDepartments from "./pages/PageDepartments.tsx";
import IconDepartments from "./icons/IconDepartments.tsx";
import PageChangelog from "./pages/PageChangelog.tsx";
import IconChangelog from "./icons/IconChangelog.tsx";
import PageSettings from "./pages/PageSettings.tsx";
import IconSettings from "./icons/IconSettings.tsx";
import PageMailGroups from "./pages/PageMailGroups.tsx";
import IconMailGroups from "./icons/IconMailGroups.tsx";

export interface RoutePageInterface {
    path: string;
    element: ReactNode;
    icon: ReactNode;
    title: string;
    admin: boolean;
    settings: boolean;
}

export const routePages: RoutePageInterface[] = [
    {path: '/account', element: <Page element={<PageAccount/>}/>, icon: <IconAccount/>, title: "", admin: false, settings: false},
    {path: '/vpns', element: <Page element={<PageVpns/>}/>, icon: <IconVpns/>, title: "vpnsTitle", admin: false, settings: false},
    {path: '/users', element: <Page element={<PageUsers/>}/>, icon: <IconUsers/>, title: "usersTitle", admin: false, settings: false},
    {path: '/departments', element: <Page element={<PageDepartments/>}/>, icon: <IconDepartments/>, title: "departmentsTitle", admin: false, settings: false},
    {path: '/mails', element: <Page element={<PageMails/>}/>, icon: <IconMails/>, title: "mailsTitle",  admin: false, settings: false},
    {path: '/mail-groups', element: <Page element={<PageMailGroups/>}/>, icon: <IconMailGroups/>, title: "mailGroupsTitle",  admin: false, settings: false},
    {path: '/settings', element: <Page element={<PageSettings/>}/>, icon: <IconSettings/>, title: "settingsTitle", admin: true, settings: false},

    {path: '/settings/accounts', element: <Page element={<PageAccounts/>}/>, icon: <IconAccounts/>, title: "accountsTitle", admin: true, settings: true},
    {path: '/settings/groups', element: <Page element={<PageGroups/>}/>, icon: <IconGroups/>, title: "groupsTitle", admin: true, settings: true},
    {path: '/settings/routers', element: <Page element={<PageRouters/>}/>, icon: <IconRouters/>, title: "routersTitle", admin: false, settings: true},
    {path: '/settings/logs', element: <Page element={<PageLogs/>}/>, icon: <IconLogs/>, title: "logsTitle", admin: true, settings: true},
    {path: '/settings/changelog', element: <Page element={<PageChangelog/>}/>, icon: <IconChangelog/>, title: "changelogTitle", admin: true, settings: true},
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
    const message = useSelector((state: RootState) => state.app.message);

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
            {message.length > 0 && <Dialog
                title={'Message'}
                close={() => dispatch(setAppMessage(''))}
                children={
                    <p>{message}</p>
                }
                buttons={[
                    {action: () => dispatch(setAppMessage('')), text: 'Close'}
                ]}
            />}
        </div>
    )
}

export default App
