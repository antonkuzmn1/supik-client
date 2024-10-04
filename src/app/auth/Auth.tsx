import './Auth.scss';
import React, {useEffect, useState} from "react";
import {AppDispatch} from "../../utils/store.ts";
import {useDispatch} from "react-redux";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../slices/accountSlice.ts";
import {setAppError, setAppLoading} from "../../slices/appSlice.ts";
import axios from "axios";
import Cookies from "js-cookie";
import FieldInputString from "../fields/FieldInputString.tsx";
import {useTranslation} from "react-i18next";

const Auth: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();

    const {t} = useTranslation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = async () => {
        if (!username || !password) {
            dispatch(setAppError('field "username" and "password" is required'))
            return;
        }
        dispatch(setAppLoading(true));
        try {
            axios.post(import.meta.env.VITE_BASE_URL + '/security', {
                username, password
            }).then((response) => {
                const token = response.data.token;
                const admin = response.data.account.admin;
                const fullname = response.data.account.fullname;
                Cookies.set('token', token, {expires: 0.5});
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(setAccountAuthorized(true));
                dispatch(setAccountAdmin(!!admin));
                dispatch(setAccountFullname(fullname));
            }).catch((error) => {
                if (error.response && error.response.data) {
                    dispatch(setAppError(error.response.data));
                } else {
                    dispatch(setAppError(error.message));
                }
            }).finally(() => {
                dispatch(setAppLoading(false));
            });
        } catch (error: any) {
            console.error('error:', error);
            dispatch(setAppError(error.response.data))
            Cookies.remove('token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch(setAccountAuthorized(false));
            dispatch(setAccountAdmin(false));
            dispatch(setAccountFullname(""));
            dispatch(setAppLoading(false));
        }
    };

    const onkeypressHandler = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            console.log(username);
            login().then();
        } else if (event.key === 'Escape') {
            // console.log('Esc');
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', onkeypressHandler);

        return () => {
            window.removeEventListener('keydown', onkeypressHandler);
        }
    })

    return (
        <div className="Auth">
            <div className='frame'>
                <div className='content'>
                    <div className='header'>
                        <h1>{t('authHeader')}</h1>
                    </div>
                    <FieldInputString
                        title={t('authUsername')}
                        placeholder={t('authUsernamePlaceholder')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={t('authPassword')}
                        password={true}
                        placeholder={t('authUsernamePassword')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className='form'>
                        <button
                            className='submit'
                            onClick={login}
                        >
                            {t('authSignIn')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Auth;
