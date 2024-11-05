import './Page.scss';
import React, {ChangeEvent, useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import {useDispatch} from "react-redux";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldInputFile from "../fields/FieldInputFile.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface RouterFields {
    id: string;
    created: string;
    updated: string;
    login: string,
    password: string,
    localAddress: string,
    remoteAddress: string,
    defaultProfile: string,
    prefix: string,
    name: string,
    title: string,
    disabled: 0 | 1,
    l2tpKey: string,
    certificate: any,
}

const defTableHeaders: { text: string, field: keyof RouterFields, width: string, type: TypeField }[] = [
    {text: 'routersTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'routersTableInternalAddress', field: 'localAddress', width: '150px', type: 'String'},
    {text: 'routersTableName', field: 'name', width: '150px', type: 'String'},
    {text: 'routersTableTitle', field: 'title', width: '300px', type: 'String'},
    {text: 'routersTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'routersTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageRouters: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [routers, setRouters] = useState<RouterFields[]>([]);

    const [fileBase64, setFileBase64] = useState<string | null>(null);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogTestActive, setDialogTestActive] = useState<boolean>(false);
    const [dialogSyncActive, setDialogSyncActive] = useState<boolean>(false);
    const [dialogViewersActive, setDialogViewersActive] = useState<boolean>(false);
    const [dialogEditorsActive, setDialogEditorsActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [localAddress, setLocalAddress] = useState<string>('');
    const [remoteAddress, setRemoteAddress] = useState<string>('');
    const [defaultProfile, setDefaultProfile] = useState<string>('');
    const [prefix, setPrefix] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [certificate, setCertificate] = useState<File | null>(null);
    const [l2tpKey, setL2tpKey] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);

    const [groups, setGroups] = useState<any[]>([]);
    const [viewers, setViewers] = useState<any[]>([]);
    const [editors, setEditors] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: getQueryObj(),
        }).then((response) => {
            setRouters(response.data)
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

    const create = () => {
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/router", {
            login: login.trim(),
            password: password.trim(),
            remoteAddress: remoteAddress.trim(),
            localAddress: localAddress.trim(),
            prefix: prefix.trim(),
            name: name.trim(),
            title: title.trim(),
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey.trim(),
        }).then((response) => {
            setDialogCreateActive(false);
            routers.unshift({
                ...response.data,
            });
            setRouters(routers);
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        });
    }

    const update = () => {
        dispatch(setAppLoading(true));
        axios.put(import.meta.env.VITE_BASE_URL + "/db/router", {
            id: id,
            login: login.trim(),
            password: password.trim(),
            remoteAddress: remoteAddress.trim(),
            localAddress: localAddress.trim(),
            defaultProfile: defaultProfile.trim(),
            prefix: prefix.trim(),
            name: name.trim(),
            title: title.trim(),
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey.trim(),
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = routers.findIndex((row: RouterFields) => {
                return row.id === response.data.id
            });
            routers[index] = {
                ...response.data,
            };
            setRouters(routers);
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        });
    }

    const remove = () => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/router", {
            data: {id: id},
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = routers.findIndex((row: RouterFields) => {
                return row.id === response.data.id
            });
            routers.splice(index, 1);
            setRouters(routers);
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

    const createViewer = (groupId: number) => {
        const routerId = id;
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/router-group-viewer", {
            routerId,
            groupId,
        }).then((_response) => {
            openViewersDialog(routerId);
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

    const createEditor = (groupId: number) => {
        const routerId = id;
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/router-group-editor", {
            routerId,
            groupId,
        }).then((_response) => {
            openEditorsDialog(routerId);
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

    const deleteViewer = (groupId: number) => {
        const routerId = id;

        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/router-group-viewer", {
            data: {
                routerId,
                groupId,
            }
        }).then((_response) => {
            openViewersDialog(routerId);
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

    const deleteEditor = (groupId: number) => {
        const routerId = id;

        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/router-group-editor", {
            data: {
                routerId,
                groupId,
            }
        }).then((_response) => {
            openEditorsDialog(routerId);
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

    const syncVpns = () => {
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/router/sync/", {
            routerId: id,
        }).then((response) => {
            console.log(response)
            setDialogSyncActive(false);
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        });
    }

    /// DIALOG

    const openCreateDialog = () => {
        setId(0);
        setLogin('');
        setPassword('');
        setLocalAddress('');
        setRemoteAddress('');
        setDefaultProfile('');
        setPrefix('');
        setName('');
        setTitle('');
        setDisabled(false);
        setCertificate(null)
        setL2tpKey('');
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.router.id);
            setLogin(response.data.router.login);
            setPassword(response.data.router.password);
            setLocalAddress(response.data.router.localAddress);
            setRemoteAddress(response.data.router.remoteAddress);
            setDefaultProfile(response.data.router.defaultProfile);
            setPrefix(response.data.router.prefix);
            setName(response.data.router.name);
            setTitle(response.data.router.title);
            setDisabled(response.data.router.disabled);
            setProfiles(response.data.profiles);
            if (response.data.router.certificate) {
                const file = convertToFile(response.data.router.certificate, 'certificate.crt')
                setCertificate(file);
            } else {
                setCertificate(null);
            }
            setL2tpKey(response.data.router.l2tpKey);
            setDialogUpdateActive(true);
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

    const openDeleteDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.router.id);
            setName(response.data.router.name);
            setDialogDeleteActive(true);
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

    const openTestDialog = () => {
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/router/test/", {
            host: localAddress,
            user: login,
            password: password,
        }).then((response) => {
            setConnected(response.data === true);
        }).catch((error) => {
            setConnected(false);
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
            setDialogTestActive(true);
            dispatch(setAppLoading(false));
        });
    }

    const openSyncDialog = () => {
        setDialogSyncActive(true);
    }

    const openViewersDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setViewers(response.data.router.routerGroupViewer);
            axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {}).then((response) => {
                setGroups(response.data);
                setDialogViewersActive(true);
            }).catch((error) => {
                if (error.response && error.response.data) {
                    dispatch(setAppError(error.response.data));
                } else {
                    dispatch(setAppError(error.message));
                }
            }).finally(() => {
                dispatch(setAppLoading(false));
            })
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        });
    }

    const openEditorsDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setEditors(response.data.router.routerGroupEditor);
            axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {}).then((response) => {
                setGroups(response.data);
                setDialogEditorsActive(true);
            }).catch((error) => {
                if (error.response && error.response.data) {
                    dispatch(setAppError(error.response.data));
                } else {
                    dispatch(setAppError(error.message));
                }
            }).finally(() => {
                dispatch(setAppLoading(false));
            })
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        });
    }

    const openFilterDialog = () => {
        setDialogFilterActive(true)
    }

    /// OTHER

    const sortTable = (column: keyof RouterFields, asc: boolean) => {
        const sorted = [...routers];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRouters(sorted);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setCertificate(selectedFile);
            convertFileToBase64(selectedFile);
        }
    };

    const convertFileToBase64 = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const convertToFile = (certificate: any, fileName: string) => {
        const buffer = new Uint8Array(certificate.data);
        const blob = new Blob([buffer], {type: 'application/x-x509-ca-cert'});
        return new File([blob], fileName, {type: blob.type});
    };

    const setQuery = () => {
        const queryParams = new URLSearchParams(location.search);

        Object.keys(filter).forEach(key => {
            if (filter[key]) {
                queryParams.set(key, filter[key]);
            } else {
                queryParams.delete(key);
            }
        });

        navigate({
            pathname: location.pathname,
            search: queryParams.toString(),
        }, {replace: true});

        setDialogFilterActive(false);
    }

    const getQueryObj = () => {
        const queryParams = new URLSearchParams(location.search);
        const queryObject: any = {};

        for (const [key, value] of queryParams.entries()) {
            queryObject[key] = value;
        }

        return queryObject;
    }

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('routersTitle'));
        getAll();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, routers]);

    return (
        <>
            <div className={'table'}>
                <table className={'header'}>
                    <thead>
                    <tr>
                        <th className={'action'}>
                            <div className={'action-buttons'}>
                                <button
                                    onClick={openFilterDialog}
                                    children={<IconTableFilter/>}
                                />
                                <button
                                    onClick={openCreateDialog}
                                    children={<IconTableCreate/>}
                                />
                            </div>
                        </th>
                        {defTableHeaders.map((defTableHeader, index) => (
                            <th key={index}
                                style={{
                                    minWidth: defTableHeader.width,
                                    maxWidth: defTableHeader.width,
                                }}
                            >
                                <div className={'sort-buttons'}>
                                    <button
                                        onClick={() => sortTable(defTableHeader.field, true)}
                                        children={<IconSortAsc/>}
                                    />
                                    <button
                                        onClick={() => sortTable(defTableHeader.field, false)}
                                        children={<IconSortDesc/>}
                                    />
                                </div>
                                {t(defTableHeader.text)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                </table>
                <table className={'body'}>
                    <tbody>
                    {routers.map((router, index) => (
                        <tr key={index}>
                            <td className={'action'}>
                                <div className={'action-buttons'}>
                                    <button
                                        onClick={() => openEditDialog(router.id)}
                                        children={<IconTableEdit/>}
                                    />
                                    <button
                                        onClick={() => openDeleteDialog(router.id)}
                                        children={<IconTableDelete/>}
                                    />
                                </div>
                            </td>
                            {defTableHeaders.map((defTableHeader, index) => (
                                <td key={index}
                                    style={{
                                        minWidth: defTableHeader.width,
                                        maxWidth: defTableHeader.width,
                                    }}
                                >
                                    {defTableHeader.type === 'String' && (
                                        router[defTableHeader.field]
                                    )}
                                    {defTableHeader.type === 'Integer' && (
                                        Number(router[defTableHeader.field])
                                    )}
                                    {defTableHeader.type === 'Boolean' && (
                                        router[defTableHeader.field] ? 'True' : 'False'
                                    )}
                                    {defTableHeader.type === 'Date' && (
                                        dateToString(new Date(router[defTableHeader.field]))
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {dialogCreateActive && <Dialog
                title={t('routersCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('routersCreateFieldLogin')}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldPassword')}
                        placeholder={"Enter text"}
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldInternalAddress')}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldExternalAddress')}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldPrefix')}
                        placeholder={"Enter text"}
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersCreateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('routersCreateVpnServer')}
                        value={disabled}
                        invert={true}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={t('routersCreateCertificate')}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={t('routersCreateL2tpKey')}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('routersCreateButtonCancel')},
                    {action: () => create(), text: t('routersCreateButtonConfirm')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('routersUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('routersUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldLogin')}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldPassword')}
                        placeholder={"Enter text"}
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldInternalAddress')}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldExternalAddress')}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <div className='Field'>
                        <div className='title'>
                            <p>{t('routersUpdateFieldDefaultProfile')}</p>
                        </div>
                        <div className='field'>
                            <select
                                value={defaultProfile}
                                onChange={(e) => setDefaultProfile(e.target.value)}
                            >
                                <option
                                    value={'NULL'}
                                    children={'NULL'}
                                />
                                {profiles && profiles.map((profile, i) => (
                                    <option
                                        key={i}
                                        value={profile.name}
                                    >
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <FieldInputString
                        title={t('routersUpdateFieldPrefix')}
                        placeholder={"Enter text"}
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('routersUpdateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('routersUpdateVpnServer')}
                        value={disabled}
                        invert={true}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={t('routersUpdateCertificate')}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={t('routersUpdateL2tpKey')}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('routersUpdateButtonCancel')},
                    {action: () => openTestDialog(), text: t('routersUpdateButtonTest')},
                    {action: () => openSyncDialog(), text: t('routersUpdateButtonSynchronize')},
                    {action: () => openViewersDialog(id), text: t('routersUpdateButtonViewers')},
                    {action: () => openEditorsDialog(id), text: t('routersUpdateButtonEditors')},
                    {action: () => update(), text: t('routersUpdateButtonConfirm')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('routersDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('routersDeleteText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('routersDeleteButtonCancel')},
                    {action: () => remove(), text: t('routersDeleteButtonDelete')},
                ]}
            />}
            {dialogTestActive && <Dialog
                title={t('routersTestTitle')}
                close={() => setDialogTestActive(false)}
                children={<>
                    {connected
                        ? <p>{t('routersTestTextSuccess')}: "{name}" (ID: {id})</p>
                        : <p>{t('routersTestTextFailed')}: "{name}" (ID: {id})</p>
                    }
                </>}
                buttons={[
                    {action: () => setDialogTestActive(false), text: t('routersTestButtonClose')},
                ]}
            />}
            {dialogSyncActive && <Dialog
                title={t('routersSynchronizeTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('routersSynchronizeText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogSyncActive(false), text: t('routersSynchronizeButtonCancel')},
                    {action: () => syncVpns(), text: t('routersSynchronizeButtonYes')},
                ]}
            />}
            {dialogViewersActive && <Dialog
                title={t('routersViewersTitle')}
                close={() => setDialogViewersActive(false)}
                children={<div className={'groups'}>
                    <div className={'left'}>
                        {viewers.map((viewer, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{viewer.group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteViewer(viewer.groupId)}
                                    >{t('routersViewersDel')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={'right'}>
                        {groups.map((group, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => createViewer(group.id)}
                                    >{t('routersViewersAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogViewersActive(false), text: t('routersViewersButtonClose')},
                ]}
            />}
            {dialogEditorsActive && <Dialog
                title={t('routersEditorsTitle')}
                close={() => setDialogViewersActive(false)}
                children={<div className={'groups'}>
                    <div className={'left'}>
                        {editors.map((editor, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{editor.group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteEditor(editor.groupId)}
                                    >{t('routersEditorsDel')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={'right'}>
                        {groups.map((group, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => createEditor(group.id)}
                                    >{t('routersEditorsAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogEditorsActive(false), text: t('routersEditorsButtonClose')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('routersFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('routersFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('routersFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldLogin')}
                        placeholder={'Enter text'}
                        value={filter.login}
                        onChange={(e) => setFilter({...filter, login: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldPassword')}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldInternalAddress')}
                        placeholder={'Enter text'}
                        value={filter.localAddress}
                        onChange={(e) => setFilter({...filter, localAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldExternalAddress')}
                        placeholder={'Enter text'}
                        value={filter.remoteAddress}
                        onChange={(e) => setFilter({...filter, remoteAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldDefaultProfile')}
                        placeholder={'Enter text'}
                        value={filter.defaultProfile}
                        onChange={(e) => setFilter({...filter, defaultProfile: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldPrefix')}
                        placeholder={'Enter text'}
                        value={filter.prefix}
                        onChange={(e) => setFilter({...filter, prefix: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldName')}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={t('routersFilterFieldTitle')}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={t('routersFilterVpnServer')}
                        value={filter.disabled}
                        invert={true}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                    <FieldInputString
                        title={t('routersFilterL2tpKey')}
                        placeholder={'Enter text'}
                        value={filter.l2tpKey}
                        onChange={(e) => setFilter({...filter, l2tpKey: e.target.value})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('routersFilterButtonClose')},
                    {action: () => setQuery(), text: t('routersFilterButtonConfirm')},
                ]}
            />}
        </>
    )
}

export default PageRouters
