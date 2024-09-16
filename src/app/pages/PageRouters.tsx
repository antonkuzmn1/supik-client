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

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface RouterFields {
    id: string;
    created: string;
    updated: string;
    login: string,
    password: string,
    localAddress: string,
    remoteAddress: string,
    name: string,
    title: string,
    disabled: 0 | 1,
    l2tpKey: string,
}

const defTableHeaders: { text: string, field: keyof RouterFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Internal Address', field: 'localAddress', width: '150px', type: 'String'},
    {text: 'Name', field: 'name', width: '150px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageRouters: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

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
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [certificate, setCertificate] = useState<File | null>(null);
    const [l2tpKey, setL2tpKey] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);

    const [groups, setGroups] = useState<any[]>([]);
    const [viewers, setViewers] = useState<any[]>([]);
    const [editors, setEditors] = useState<any[]>([]);

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
            login: login,
            password: password,
            remoteAddress: remoteAddress,
            localAddress: localAddress,
            name: name,
            title: title,
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey,
        }).then((response) => {
            console.log(response);
            setDialogCreateActive(false);
            getAll();
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
            login: login,
            password: password,
            remoteAddress: remoteAddress,
            localAddress: localAddress,
            name: name,
            title: title,
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey,
        }).then((response) => {
            console.log(response);
            setDialogUpdateActive(false);
            getAll();
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
        }).then((_response) => {
            setDialogDeleteActive(false);
            getAll();
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
            setName(response.data.router.name);
            setTitle(response.data.router.title);
            setDisabled(response.data.router.disabled);
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
        dispatch(setAppTitle('Routers'));
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
                                {defTableHeader.text}
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
                                        new Date(router[defTableHeader.field]).toDateString()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {dialogCreateActive && <Dialog
                title={'Create Router'}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={"Login"}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Internal Addr"}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"External Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"VPN Server"}
                        value={disabled}
                        invert={true}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={"Certificate"}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={"L2TP Key"}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: 'Cancel'},
                    {action: () => create(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update Router'}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={"ID"}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={"Login"}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Internal Addr"}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"External Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"VPN Server"}
                        value={disabled}
                        invert={true}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={"Certificate"}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={"L2TP Key"}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => openTestDialog(), text: 'Test'},
                    {action: () => openSyncDialog(), text: 'Sync'},
                    {action: () => openViewersDialog(id), text: 'Viewers'},
                    {action: () => openEditorsDialog(id), text: 'Editors'},
                    {action: () => update(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete Router'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => remove(), text: 'Delete'},
                ]}
            />}
            {dialogTestActive && <Dialog
                title={'Test Connection'}
                close={() => setDialogTestActive(false)}
                children={<>
                    {connected
                        ? <p>Successfully success: "{name}" (ID: {id})</p>
                        : <p>Connection failed: "{name}" (ID: {id})</p>
                    }
                </>}
                buttons={[
                    {action: () => setDialogTestActive(false), text: 'Close'},
                ]}
            />}
            {dialogSyncActive && <Dialog
                title={'Synchronize VPN accounts'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to sync VPN accounts by "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogSyncActive(false), text: 'Cancel'},
                    {action: () => syncVpns(), text: 'Yes'},
                ]}
            />}
            {dialogViewersActive && <Dialog
                title={'Viewers'}
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
                                    >Del
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
                                    >Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogViewersActive(false), text: 'Close'},
                ]}
            />}
            {dialogEditorsActive && <Dialog
                title={'Editors'}
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
                                    >Del
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
                                    >Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogEditorsActive(false), text: 'Close'},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={'Filter Routers'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={'Created'}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={'Updated'}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={'Login'}
                        placeholder={'Enter text'}
                        value={filter.login}
                        onChange={(e) => setFilter({...filter, login: e.target.value})}
                    />
                    <FieldInputString
                        title={'Password'}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputString
                        title={'Internal addr'}
                        placeholder={'Enter text'}
                        value={filter.localAddress}
                        onChange={(e) => setFilter({...filter, localAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={'External addr'}
                        placeholder={'Enter text'}
                        value={filter.remoteAddress}
                        onChange={(e) => setFilter({...filter, remoteAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={'Name'}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={'Title'}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={'VPN Server'}
                        value={filter.disabled}
                        invert={true}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                    <FieldInputString
                        title={'L2TP Key'}
                        placeholder={'Enter text'}
                        value={filter.l2tpKey}
                        onChange={(e) => setFilter({...filter, l2tpKey: e.target.value})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: 'Close'},
                    {action: () => setQuery(), text: 'Confirm'},
                ]}
            />}
        </>
    )
}

export default PageRouters
