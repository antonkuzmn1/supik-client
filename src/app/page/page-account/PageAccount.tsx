import './PageAccount.scss';
import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../../utils/store.ts";
import axios from "axios";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../../slices/accountSlice.ts";
import Cookies from "js-cookie";

const PageAccount: React.FC = () => {
    const dispatch = useDispatch();

    const deviceSize = useSelector((state: RootState) => state.device.size);
    const authorized = useSelector((state: RootState) => state.account.authorized);
    const admin = useSelector((state: RootState) => state.account.admin);
    const loading = useSelector((state: RootState) => state.app.loading);

    const logout = async (event: any) => {
        event.preventDefault();
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
        dispatch(setAccountAdmin(false));
        dispatch(setAccountFullname(""));
    }

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
            <br/>
            <button onClick={logout}>logout</button>
        </div>
    )
}

export default PageAccount
