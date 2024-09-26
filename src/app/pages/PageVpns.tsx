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
import {RouterFields} from "./PageRouters.tsx";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import {UserFields} from "./PageUsers.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {getInitialsFromFullname} from "../../utils/getInitialsFromFullname.ts";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import FieldGenerator, {PasswordType} from "../fields/FieldGenerator.tsx";
import {dateToString} from "../../utils/dateToString.ts";

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
    userName: string;

    disabled: 0 | 1,
}

interface TableHeaders {
    text: string,
    field: keyof VpnFields,
    width: string,
    type: TypeField,
}

const defTableHeaders: TableHeaders[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Router', field: 'routerName', width: '100px', type: 'String'},
    {text: 'Disabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Password', field: 'password', width: '150px', type: 'String'},
    {text: 'User', field: 'userName', width: '150px', type: 'String'},
    {text: 'Remote Address', field: 'remoteAddress', width: '150px', type: 'String'},
    {text: 'Service', field: 'service', width: '100px', type: 'String'},
]

const PageVpns: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [rows, setRows] = useState<VpnFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

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
    const [profiles, setProfiles] = useState<any[]>([]);
    const [pools, setPools] = useState<any>({});
    const [selectedPool, setSelectedPool] = useState<string[] | undefined>(undefined);
    const [routerRemoteAddr, setRouterRemoteAddr] = useState<string>('');
    const [routerL2tpKey, setRouterL2tpKey] = useState<string>('');

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            params: getQueryObj(),
        }).then((response) => {
            const responseWithRouter = response.data.map((vpn: any) => {
                return {
                    ...vpn,
                    routerName: vpn.router.name,
                    userName: vpn.user ? getInitialsFromFullname(vpn.user.fullname) : 'NULL',
                }
            })
            setRows(responseWithRouter);
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/vpn", {
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/vpn", {
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/vpn", {
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
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

    const openFilterDialog = () => {
        setDialogFilterActive(true)
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {}).then((response) => {
            setRouters(response.data.filter((router: any) => {
                return router.disabled === 0;
            }))
        }).catch((error) => {
            if (error.response && error.response.data) {
                // dispatch(setAppError(error.response.data));
            } else {
                // dispatch(setAppError(error.message));
            }
        }).finally(() => {
        })
    }

    const getRouter = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setPools(response.data.pools);
            setProfiles(response.data.profiles);
            setSelectedPool(response.data.pools[profile]);
            setRouterRemoteAddr(response.data.router.remoteAddress);
            setRouterL2tpKey(response.data.router.l2tpKey);
        }).catch((error) => {
            if (error.response && error.response.data) {
                // dispatch(setAppError(error.response.data));
            } else {
                // dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const getUsers = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {}).then((response) => {
            setUsers(response.data.filter((user: any) => {
                return user.disabled === 0;
            }).sort((a: any, b: any) => {
                return a.fullname.localeCompare(b.fullname)
            }));
        }).catch((error) => {
            if (error.response && error.response.data) {
                // dispatch(setAppError(error.response.data));
            } else {
                // dispatch(setAppError(error.message));
            }
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

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
        dispatch(setAppTitle('VPNs'));
        getAll();
        getRouters();
        getUsers();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, routers]);

    useEffect(() => {
        if (routerId > 0) {
            getRouter(routerId);
        } else {
            setProfiles([]);
            setProfile('NULL');
            setRouterRemoteAddr('');
            setRouterL2tpKey('');
        }
    }, [routerId]);

    useEffect(() => {
        setSelectedPool(pools[profile]);
    }, [profile]);

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
                                        dateToString(new Date(row[defTableHeader.field]))
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
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <div className='Field'>
                        <div className='title'>
                            <p>{'Profile'}</p>
                        </div>
                        <div className='field'>
                            <select
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                            >
                                <option
                                    value={'NULL'}
                                    children={'NULL'}
                                />
                                {profiles.map((profile, i) => (
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
                    <div className='Field'>
                        <div className='title'>
                            <p>{'Remote Addr'}</p>
                        </div>
                        <div className='field'>
                            <input
                                type='search'
                                value={remoteAddress}
                                onChange={(e) => setRemoteAddress(e.target.value)}
                                list='remote-options'
                                placeholder='Enter text'
                                style={{height: '100%'}}
                            />
                            <datalist id='remote-options'>
                                {selectedPool && selectedPool.map((addr: string, i: number) => (
                                    <option key={i} value={addr}>
                                        {addr}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
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
                    <FieldValueString
                        title={"External Addr"}
                        value={routerRemoteAddr}
                    />
                    <FieldValueString
                        title={"L2TP Key"}
                        value={routerL2tpKey}
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
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <div className='Field'>
                        <div className='title'>
                            <p>{'Profile'}</p>
                        </div>
                        <div className='field'>
                            <select
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                            >
                                <option
                                    value={'NULL'}
                                    children={'NULL'}
                                />
                                {profiles.map((profile, i) => (
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
                    <div className='Field'>
                        <div className='title'>
                            <p>{'Remote Addr'}</p>
                        </div>
                        <div className='field'>
                            <input
                                type='search'
                                value={remoteAddress}
                                onChange={(e) => setRemoteAddress(e.target.value)}
                                list='remote-options'
                                placeholder='Enter text'
                                style={{height: '100%'}}
                            />
                            <datalist id='remote-options'>
                                {selectedPool && selectedPool.map((addr: string, i: number) => (
                                    <option key={i} value={addr}>
                                        {addr}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
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
                    <FieldValueString
                        title={"External Addr"}
                        value={routerRemoteAddr}
                    />
                    <FieldValueString
                        title={"L2TP Key"}
                        value={routerL2tpKey}
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
                    <p>Are u sure want to delete "{name}" (ID: {id}; RouterID: {routerId})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => remove(), text: 'Delete'},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={'Filter VPNs'}
                close={() => setDialogFilterActive(false)}
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
                        title={'Name'}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={'Password'}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputString
                        title={'Profile'}
                        placeholder={'Enter text'}
                        value={filter.profile}
                        onChange={(e) => setFilter({...filter, profile: e.target.value})}
                    />
                    <FieldInputString
                        title={'Service'}
                        placeholder={'Enter text'}
                        value={filter.service}
                        onChange={(e) => setFilter({...filter, service: e.target.value})}
                    />
                    <FieldInputString
                        title={'Remote addr'}
                        placeholder={'Enter text'}
                        value={filter.remoteAddress}
                        onChange={(e) => setFilter({...filter, remoteAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={'Title'}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={'Disabled'}
                        value={filter.disabled}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                    <FieldInputSelectMany
                        title={'Routers'}
                        value={filter.routerId || []}
                        setValue={(ids: number[]) => setFilter({...filter, routerId: ids})}
                        variants={routers.map((router: RouterFields) => {
                            return {
                                value: Number(router.id),
                                text: `[ID:${router.id}] ${router.name}`
                            };
                        })}
                    />
                    <FieldInputSelectMany
                        title={'Users'}
                        value={filter.userId || []}
                        setValue={(ids: number[]) => setFilter({...filter, userId: ids})}
                        variants={users.map((user: UserFields) => {
                            return {
                                value: Number(user.id),
                                text: `[ID:${user.id}] ${user.fullname}`
                            };
                        })}
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

export default PageVpns
