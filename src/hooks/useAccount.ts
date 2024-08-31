import axios from "axios";
import Cookies from "js-cookie";
import {AppDispatch} from "../utils/store.ts";
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {baseUrl} from "../utils/baseUrl.ts";
import {setAccountAdmin, setAccountAuthorized, setAccountFullname} from "../slices/accountSlice.ts";
import {setAppLoading} from "../slices/appSlice.ts";

export const useAccount = () => {
    const dispatch: AppDispatch = useDispatch();

    const clear = () => {
        Cookies.remove('token');
        delete axios.defaults.headers.common['Authorization'];
        dispatch(setAccountAuthorized(false));
        dispatch(setAccountAdmin(false));
        dispatch(setAccountFullname(""));
    }

    const check = () => {
        dispatch(setAppLoading(true));
        const token = Cookies.get('token');

        if (token) {
            axios.get(baseUrl + '/security', {
                headers: {'Authorization': `Bearer ${token}`}
            }).then((response) => {
                console.log(response);
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
        check();

        const intervalId = setInterval(() => {
            console.log('check auth');
            check();
        }, 1000 * 60 * 10);

        return () => clearInterval(intervalId);
    }, [dispatch]);
}
