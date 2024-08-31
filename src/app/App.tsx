import './App.scss';
import React, {ReactNode} from "react";
import Page from "./page/Page.tsx";
import IconAccount from "../assets/icons/IconAccount.tsx";
import IconAccounts from "../assets/icons/IconAccounts.tsx";
import IconGroups from "../assets/icons/IconGroups.tsx";
import IconRouters from "../assets/icons/IconRouters.tsx";
import IconVpns from "../assets/icons/IconVpns.tsx";
import IconUsers from "../assets/icons/IconUsers.tsx";
import IconMails from "../assets/icons/IconMails.tsx";
import IconItems from "../assets/icons/IconItems.tsx";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import PageAccount from "./page/page-account/PageAccount.tsx";
import PageAccounts from "./page/page-accounts/PageAccounts.tsx";
import PageGroups from "./page/page-groups/PageGroups.tsx";
import PageRouters from "./page/page-routers/PageRouters.tsx";
import PageVpns from "./page/page-vpns/PageVpns.tsx";
import PageUsers from "./page/page-users/PageUsers.tsx";
import PageMails from "./page/page-mails/PageMails.tsx";
import PageItems from "./page/page-items/PageItems.tsx";
import useDevice from "../hooks/useDevice.ts";
import {useAccount} from "../hooks/useAccount.ts";
import Loading from "./loading/Loading.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../utils/store.ts";

export interface RoutePageInterface {
    path: string;
    element: ReactNode;
    icon: ReactNode;
    title: string;
}

export const routePages: RoutePageInterface[] = [
    {path: '/account', element: <Page element={<PageAccount/>}/>, icon: <IconAccount/>, title: "Veryvery loooooooooooooooooooong teext"},
    {path: '/accounts', element: <Page element={<PageAccounts/>}/>, icon: <IconAccounts/>, title: "Accounts"},
    {path: '/groups', element: <Page element={<PageGroups/>}/>, icon: <IconGroups/>, title: "Groups"},
    {path: '/routers', element: <Page element={<PageRouters/>}/>, icon: <IconRouters/>, title: "Routers"},
    {path: '/vpns', element: <Page element={<PageVpns/>}/>, icon: <IconVpns/>, title: "VPNs"},
    {path: '/users', element: <Page element={<PageUsers/>}/>, icon: <IconUsers/>, title: "Users"},
    {path: '/mails', element: <Page element={<PageMails/>}/>, icon: <IconMails/>, title: "Mails"},
    {path: '/items', element: <Page element={<PageItems/>}/>, icon: <IconItems/>, title: "Items"},
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

    const loading = useSelector((state: RootState) => state.app.loading);

    return (
        <div className='App'>
            <RouterProvider router={router}/>
            {loading && <Loading/>}
        </div>
    )
}

export default App
