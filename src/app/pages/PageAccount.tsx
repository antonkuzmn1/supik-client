import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import axios from "axios";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../slices/accountSlice.ts";
import Cookies from "js-cookie";
import {setAppError, setAppLoading} from "../../slices/appSlice.ts";
import FieldValueString from "../fields/FieldValueString.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";

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
    {title: 'accountTableID', field: 'id'},
    {title: 'accountTableCreated', field: 'created'},
    {title: 'accountTableUpdated', field: 'updated'},
    {title: 'accountTableFullname', field: 'fullname'},
    {title: 'accountTableTitle', field: 'title'},
    {title: 'accountTableUsername', field: 'username'},
    {title: 'accountTableAdmin', field: 'admin'},
    {title: 'accountTableDisabled', field: 'disabled'},
]

const PageAccount: React.FC = () => {
    const dispatch = useDispatch();

    const {t} = useTranslation();

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
            axios.get(import.meta.env.VITE_BASE_URL + '/security', {
                headers: {'Authorization': `Bearer ${token}`}
            }).then((response) => {
                setAccount(response.data);
                Cookies.set('token', token, {expires: 1});
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(setAccountAuthorized(true));
                dispatch(setAccountAdmin(!!response.data.admin));
                dispatch(setAccountFullname(response.data.fullname));
            }).catch((error) => {
                if (error.response && error.response.data) {
                    dispatch(setAppError(error.response.data));
                } else {
                    dispatch(setAppError(error.message));
                }
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
                created: dateToString(new Date(account.created)),
                updated: dateToString(new Date(account.updated)),
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
                        title={t(defField.title)}
                        value={fields[defField.field]}
                    />
                ))}
                <div className={'button'}>
                    <button onClick={logout}>{t('accountLogout')}</button>
                </div>
            </>)}
        </div>
    )
}

export default PageAccount
