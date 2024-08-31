import './PageAccount.scss';
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "../../../utils/store.ts";

const PageAccount: React.FC = () => {
    const deviceSize = useSelector((state: RootState) => state.device.size);
    const authorized = useSelector((state: RootState) => state.user.authorized);
    const admin = useSelector((state: RootState) => state.user.admin);
    const loading = useSelector((state: RootState) => state.app.loading);

    return (
        <div className='PageAccount'>
            PageAccount
            <br/>
            {deviceSize.toString()}
            <br/>
            {authorized.toString()}
            <br/>
            {admin.toString()}
            <br/>
            {loading.toString()}
        </div>
    )
}

export default PageAccount
