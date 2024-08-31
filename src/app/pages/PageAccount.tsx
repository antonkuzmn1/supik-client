import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import axios from "axios";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../slices/accountSlice.ts";
import Cookies from "js-cookie";
import {baseUrl} from "../../utils/baseUrl.ts";
import {setAppLoading} from "../../slices/appSlice.ts";
import FieldValueString from "../fields/FieldValueString.tsx";

export interface AccountFields {
    id: string;
    created: string;
    updated: string;
    fullname: string;
    title: string;
    username: string;
    admin: string;
    disabled: string;
}

const defFields: { title: string, field: keyof AccountFields }[] = [
    {title: 'ID', field: 'id'},
    {title: 'Created at', field: 'created'},
    {title: 'Updated at', field: 'updated'},
    {title: 'Fullname', field: 'fullname'},
    {title: 'Title', field: 'title'},
    {title: 'Username', field: 'username'},
    {title: 'Admin', field: 'admin'},
    {title: 'Disabled', field: 'disabled'},
]

const PageAccount: React.FC = () => {
    const dispatch = useDispatch();

    const [account, setAccount] = useState<any>(null);
    const [fields, setFields] = useState<AccountFields | null>(null);

    const logout = async (event: any) => {
        event.preventDefault();
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
        dispatch(setAccountAdmin(false));
        dispatch(setAccountFullname(""));
    }

    const clear = () => {
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
        dispatch(setAccountAdmin(false));
        dispatch(setAccountFullname(""));
    }

    const getAccount = () => {
        dispatch(setAppLoading(true));
        const token = Cookies.get('token');

        if (token) {
            axios.get(baseUrl + '/security', {
                headers: {'Authorization': `Bearer ${token}`}
            }).then((response) => {
                setAccount(response.data);
                Cookies.set('token', token, {expires: 1});
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(setAccountAuthorized(true));
                dispatch(setAccountAdmin(!!response.data.admin));
                dispatch(setAccountFullname(response.data.fullname));
            }).catch((_error) => {
                console.error(_error);
                clear();
            }).finally(() => {
                dispatch(setAppLoading(false));
            });
        } else {
            clear();
            dispatch(setAppLoading(false));
        }
    }

    useEffect(() => {
        getAccount();
    }, [])

    useEffect(() => {
        if (account) {
            setFields({
                id: account.id.toString(),
                created: new Date(account.created).toDateString(),
                updated: new Date(account.updated).toDateString(),
                fullname: account.fullname,
                title: account.title,
                username: account.username,
                admin: account.admin ? 'True' : 'False',
                disabled: account.disabled ? 'True' : 'False',
            });
        }
    }, [account]);

    return (
        <div className={'fields'}>
            {fields && (<>
                {defFields.map((defField, index) => (
                    <FieldValueString
                        key={index}
                        title={defField.title}
                        value={fields[defField.field]}
                    />
                ))}
                <div className={'button'}>
                    <button onClick={logout}>logout</button>
                </div>
            </>)}
        </div>
    )
}

export default PageAccount
