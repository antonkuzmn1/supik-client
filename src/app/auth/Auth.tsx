import './Auth.scss';
import React, {useState} from "react";
import {AppDispatch} from "../../utils/store.ts";
import {useDispatch} from "react-redux";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../../slices/accountSlice.ts";
import {setAppLoading} from "../../slices/appSlice.ts";
import axios from "axios";
import Cookies from "js-cookie";
import {baseUrl} from "../../utils/baseUrl.ts";
import FieldInputString from "../fields/FieldInputString.tsx";

const Auth: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = async (event: any) => {
        event.preventDefault();
        if (!username || !password) {
            return;
        }
        dispatch(setAppLoading(true));
        try {
            const response = await axios.post(baseUrl + '/security', {
                username, password
            });
            const token = response.data.token;
            const admin = response.data.account.admin;
            const fullname = response.data.account.fullname;
            Cookies.set('token', token, {expires: 0.5});
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            dispatch(setAccountAuthorized(true));
            dispatch(setAccountAdmin(!!admin));
            dispatch(setAccountFullname(fullname));
            dispatch(setAppLoading(false));
        } catch (error) {
            console.error(error);
            Cookies.remove('token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch(setAccountAuthorized(false));
            dispatch(setAccountAdmin(false));
            dispatch(setAccountFullname(""));
            dispatch(setAppLoading(false));
        }
    };

    return (
        <div className="Auth">
            <div className='frame'>
                <form onSubmit={login} className='content'>
                    <div className='header'>
                        <h1>Authorization</h1>
                    </div>
                    <FieldInputString
                        title={'Username'}
                        placeholder={'Enter username'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={'Password'}
                        password={true}
                        placeholder={'Enter password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className='form'>
                        <button
                            className='submit'
                            type="submit"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default Auth;
