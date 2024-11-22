import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import axios from "axios";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import {useTranslation} from "react-i18next";
import FieldInputString from "../fields/FieldInputString.tsx";

const PageAccount: React.FC = () => {
    const dispatch = useDispatch();

    const {t} = useTranslation();

    const [defaultConfig, setDefaultConfig] = useState<{ [p: string]: string }>({});
    const [config, setConfig] = useState<{ [p: string]: string }>({})
    const [isEqual, setIsEqual] = useState<boolean>(true);

    const getSettings = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/settings", {}).then((response) => {
            const newConfig = {...config};
            response.data.forEach((param: { key: string, value: string }) => {
                newConfig[param.key] = param.value
            });
            setConfig(newConfig);
            setDefaultConfig(newConfig);
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const setValue = (key: string, value: string) => {
        const newConfig = {...config};
        newConfig[key] = value;
        setConfig(newConfig);
    }

    const checkForEquals = () => {
        const defaultKeys = Object.keys(defaultConfig);
        const configKeys = Object.keys(config);
        if (defaultKeys.length !== configKeys.length) {
            return false;
        }
        for (const key of defaultKeys) {
            if (defaultConfig[key] !== config[key]) {
                return false;
            }
        }
        return true;
    }

    const saveValues = async () => {
        dispatch(setAppLoading(true));
        const keys = Object.keys(config);
        const filteredKeys = keys.filter((key: string) => defaultConfig[key] !== config[key]);

        const requests = filteredKeys.map((key: string) =>
            axios.put(import.meta.env.VITE_BASE_URL + "/settings", {
                key, value: config[key],
            })
        );

        const responses = await Promise.all(requests);
        responses.forEach(response => {
            console.log(response);
        });

        getSettings();

        dispatch(setAppLoading(false));
    }

    useEffect(() => {
        dispatch(setAppTitle('configTitle'));
        getSettings();
    }, [location.search])

    useEffect(() => {
        const isEquals = checkForEquals();
        setIsEqual(isEquals);
    }, [config]);

    return (
        <div className={'fields'}>
            <p>{t('configHeaderCommon')}</p>
            <FieldInputString
                title={t('configFieldTokenLifetime')}
                placeholder={"Enter text"}
                value={config['tokenLifetime']}
                onChange={(e) => setValue('tokenLifetime', e.target.value)}
            />
            <br/>
            <p>{t('configHeaderMailYandex')}</p>
            <FieldInputString
                title={t('configFieldMailYandexToken')}
                placeholder={"Enter text"}
                value={config['mailYandexToken']}
                onChange={(e) => setValue('mailYandexToken', e.target.value)}
                password={true}
            />
            <FieldInputString
                title={t('configFieldMailYandexOrgId')}
                placeholder={"Enter text"}
                value={config['mailYandexOrgId']}
                onChange={(e) => setValue('mailYandexOrgId', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldMailYandexDomain')}
                placeholder={"Enter text"}
                value={config['mailYandexDomain']}
                onChange={(e) => setValue('mailYandexDomain', e.target.value)}
            />
            <br/>
            <p>{t('configHeaderMailYandexTransporter')}</p>
            <FieldInputString
                title={t('configFieldMailYandexTransporterHost')}
                placeholder={"Enter text"}
                value={config['mailYandexTransporterHost']}
                onChange={(e) => setValue('mailYandexTransporterHost', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldMailYandexTransporterPort')}
                placeholder={"Enter text"}
                value={config['mailYandexTransporterPort']}
                onChange={(e) => setValue('mailYandexTransporterPort', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldMailYandexTransporterSecure')}
                placeholder={"Enter text"}
                value={config['mailYandexTransporterSecure']}
                onChange={(e) => setValue('mailYandexTransporterSecure', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldMailYandexTransporterAuthUser')}
                placeholder={"Enter text"}
                value={config['mailYandexTransporterAuthUser']}
                onChange={(e) => setValue('mailYandexTransporterAuthUser', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldMailYandexTransporterAuthPass')}
                placeholder={"Enter text"}
                value={config['mailYandexTransporterAuthPass']}
                onChange={(e) => setValue('mailYandexTransporterAuthPass', e.target.value)}
                password={true}
            />
            <br/>
            <p>{t('configHeaderRouter')}</p>
            <FieldInputString
                title={t('configFieldRouterDefaultPort')}
                placeholder={"Enter text"}
                value={config['routerDefaultPort']}
                onChange={(e) => setValue('routerDefaultPort', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldRouterDefaultTimeout')}
                placeholder={"Enter text"}
                value={config['routerDefaultTimeout']}
                onChange={(e) => setValue('routerDefaultTimeout', e.target.value)}
            />
            <br/>
            <p>{t('configHeaderDomain')}</p>
            <FieldInputString
                title={t('configFieldDomainDnsServerAddress')}
                placeholder={"Enter text"}
                value={config['dnsServerAddress']}
                onChange={(e) => setValue('dnsServerAddress', e.target.value)}
            />
            <FieldInputString
                title={t('configFieldDomainLocalDomain')}
                placeholder={"Enter text"}
                value={config['localDomain']}
                onChange={(e) => setValue('localDomain', e.target.value)}
            />
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {!isEqual && (
                <div className={'button'}
                     style={{position: 'fixed', bottom: '10px', backgroundColor: 'white', width: '500px'}}>
                    <button onClick={saveValues}>{t('configButtonConfirm')}</button>
                </div>
            )}
        </div>
    )
}

export default PageAccount
