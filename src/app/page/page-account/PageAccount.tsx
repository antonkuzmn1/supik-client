import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import axios from "axios";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../../slices/accountSlice.ts";
import Cookies from "js-cookie";

const PageAccount: React.FC = () => {
    const dispatch = useDispatch();

    const logout = async (event: any) => {
        event.preventDefault();
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
        dispatch(setAccountAdmin(false));
        dispatch(setAccountFullname(""));
    }

    useEffect(() => {

    })

    return (
        <div className={'fields'}>
            <div className={'field'}>
                <div className={'field__title'}>
                    <p>Admin</p>
                </div>
                <div className={'field__value'}>
                    <input value={'Value'} readOnly={true}/>
                </div>
            </div>
            <div className={'field'}>
                <button onClick={logout}>logout</button>
            </div>
        </div>
    )
}

export default PageAccount
