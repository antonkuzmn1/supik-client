import './Page.scss';
import React, {useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import {baseUrl} from "../../utils/baseUrl.ts";
import {RouterFields} from "./PageRouters.tsx";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import {UserFields} from "./PageUsers.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface VpnFields {
    id: number;
    created: string;
    updated: string;

    name: string,
    password: string,
    profile: string,
    service: string,
    remoteAddress: string,
    title: string,
    vpnId: string,
    routerId: string;
    router: RouterFields;
    routerName: string;
    userId: string;
    user: any;

    disabled: 0 | 1,
}

const defTableHeaders: { text: string, field: keyof VpnFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'VID', field: 'vpnId', width: '50px', type: 'String'},
    {text: 'Router', field: 'routerName', width: '150px', type: 'String'},
    {text: 'Disabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Password', field: 'password', width: '150px', type: 'String'},
    {text: 'Remote Address', field: 'remoteAddress', width: '150px', type: 'String'},
    {text: 'Service', field: 'service', width: '100px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageVpns: React.FC = () => {
    const dispatch = useDispatch();

    const [rows, setRows] = useState<VpnFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [profile, setProfile] = useState<string>('');
    const [service, setService] = useState<string>('');
    const [remoteAddress, setRemoteAddress] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [vpnId, setVpnId] = useState<string>('');
    const [routerId, setRouterId] = useState<number>(0);
    const [userId, setUserId] = useState<number>(0);
    const [disabled, setDisabled] = useState<boolean>(false);

    const [routers, setRouters] = useState<RouterFields[]>([]);
    const [users, setUsers] = useState<UserFields[]>([]);

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/vpn", {}).then((response) => {
            setRows(response.data.map((vpn: any) => {
                return {
                    ...vpn,
                    routerName: vpn.router.name,
                }
            }));
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
        axios.post(baseUrl + "/db/vpn", {
            name: name,
            password: password,
            profile: profile,
            service: service,
            remoteAddress: remoteAddress,
            title: title,
            routerId: routerId,
            userId: userId,
            disabled: disabled ? 1 : 0,
        }).then((_response) => {
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
        axios.put(baseUrl + "/db/vpn", {
            id: id,
            name: name,
            password: password,
            profile: profile,
            service: service,
            remoteAddress: remoteAddress,
            title: title,
            vpnId: vpnId,
            routerId: routerId,
            userId: userId,
            disabled: disabled ? 1 : 0,
        }).then((_response) => {
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
        axios.delete(baseUrl + "/db/vpn", {
            data: {
                id: id,
                vpnId: vpnId,
                routerId: routerId,
            },
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

    /// DIALOG

    const openCreateDialog = () => {
        setId(0);
        setName('');
        setPassword('');
        setProfile('default');
        setService('any');
        setRemoteAddress('');
        setTitle('');
        setVpnId('');
        setRouterId(0);
        setUserId(0);
        setDisabled(false);
        getRouters();
        getUsers();
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/vpn", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setPassword(response.data.password);
            setProfile(response.data.profile);
            setService(response.data.service);
            setRemoteAddress(response.data.remoteAddress);
            setTitle(response.data.title);
            setVpnId(response.data.vpnId);
            setRouterId(response.data.routerId);
            setUserId(response.data.userId ? response.data.userId : 0);
            setDisabled(response.data.disabled);
            getRouters();
            getUsers();
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

    const openDeleteDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/vpn", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setVpnId(response.data.vpnId);
            setRouterId(response.data.routerId);
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

    /// OTHER

    const sortTable = (column: keyof VpnFields, asc: boolean) => {
        const sorted = [...rows];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRows(sorted);
    };

    const getRouters = () => {
        axios.get(baseUrl + "/db/router", {}).then((response) => {
            setRouters(response.data)
        }).catch((error) => {
            if (error.response && error.response.data) {
                dispatch(setAppError(error.response.data));
            } else {
                dispatch(setAppError(error.message));
            }
        }).finally(() => {
        })
    }

    const getUsers = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/user", {}).then((response) => {
            setUsers(response.data);
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

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('VPNs'));
        getAll();
    }, []);

    return (
        <>
            <div className={'table'}>
                <table className={'header'}>
                    <thead>
                    <tr>
                        <th className={'action'}>
                            <div className={'action-buttons'}>
                                <button
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
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td className={'action'}>
                                <div className={'action-buttons'}>
                                    <button
                                        onClick={() => openEditDialog(row.id)}
                                        children={<IconTableEdit/>}
                                    />
                                    <button
                                        onClick={() => openDeleteDialog(row.id)}
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
                                        row[defTableHeader.field]
                                    )}
                                    {defTableHeader.type === 'Integer' && (
                                        Number(row[defTableHeader.field])
                                    )}
                                    {defTableHeader.type === 'Boolean' && (
                                        row[defTableHeader.field] ? 'True' : 'False'
                                    )}
                                    {defTableHeader.type === 'Date' && (
                                        new Date(row[defTableHeader.field]).toDateString()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {dialogCreateActive && <Dialog
                title={'Create VPN'}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={"Name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Profile"}
                        placeholder={"Enter text"}
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                    />
                    <FieldInputString
                        title={"Service"}
                        placeholder={"Enter text"}
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                    />
                    <FieldInputString
                        title={"Remote Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={'Router'}
                        value={routerId}
                        nullable={true}
                        setValue={setRouterId}
                        variants={routers.map((router) => {
                            return {
                                value: Number(router.id),
                                text: router.name
                            }
                        })}
                    />
                    <FieldInputSelectOne
                        title={'User'}
                        value={userId}
                        setValue={setUserId}
                        nullable={true}
                        variants={users.map((user) => {
                            return {
                                value: Number(user.id),
                                text: user.fullname
                            }
                        })}
                    />
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: 'Cancel'},
                    {action: () => create(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update VPN'}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={"ID"}
                        value={id.toString()}
                    />
                    <FieldValueString
                        title={"VPN ID"}
                        value={vpnId.toString()}
                    />
                    <FieldInputString
                        title={"Name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Profile"}
                        placeholder={"Enter text"}
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                    />
                    <FieldInputString
                        title={"Service"}
                        placeholder={"Enter text"}
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                    />
                    <FieldInputString
                        title={"Remote Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={'Router'}
                        value={routerId}
                        setValue={setRouterId}
                        variants={routers.map((router) => {
                            return {
                                value: Number(router.id),
                                text: router.name
                            }
                        })}
                    />
                    <FieldInputSelectOne
                        title={'User'}
                        value={userId}
                        setValue={setUserId}
                        nullable={true}
                        variants={users.map((user) => {
                            return {
                                value: Number(user.id),
                                text: user.fullname
                            }
                        })}
                    />
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => update(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete VPN'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{name}" (ID: {id}; VPN ID: {vpnId}; RouterID: {routerId})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => remove(), text: 'Delete'},
                ]}
            />}
        </>
    )
}

export default PageVpns
