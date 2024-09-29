import './Page.scss';
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import FieldInputRadio from "../fields/FieldInputRadio.tsx";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputRadioNullable from "../fields/FieldInputRadioNullable.tsx";
import {dateToString} from "../../utils/dateToString.ts";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface GroupFields {
    id: string;
    created: string;
    updated: string;
    name: string;
    title: string;
    accessRouters: 0 | 1 | 2,
    accessUsers: 0 | 1 | 2,
    accessDepartments: 0 | 1 | 2,
}

const defTableHeaders: { text: string, field: keyof GroupFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Routers', field: 'accessRouters', width: '100px', type: 'Integer'},
    {text: 'Users', field: 'accessUsers', width: '100px', type: 'Integer'},
    {text: 'Departments', field: 'accessDepartments', width: '100px', type: 'Integer'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageGroups: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [groups, setGroups] = useState<GroupFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogGroupsActive, setDialogGroupsActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [accessRouters, setAccessRouters] = useState<number>(0);
    const [accessUsers, setAccessUsers] = useState<number>(0);
    const [accessDepartments, setAccessDepartments] = useState<number>(0);

    const [accountGroups, setAccountGroups] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {
            params: getQueryObj(),
        }).then((response) => {
            setGroups(response.data)
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
        if (accessRouters > 2 ||
            accessRouters < 0 ||
            accessUsers > 2 ||
            accessUsers < 0 ||
            accessDepartments > 2 ||
            accessDepartments < 0
        ) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/security/group", {
            name: name.trim(),
            title: title.trim(),
            accessRouters: accessRouters,
            accessUsers: accessUsers,
            accessDepartments: accessDepartments,
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
        })
    }

    const update = () => {
        if (accessRouters > 2 ||
            accessRouters < 0 ||
            accessUsers > 2 ||
            accessUsers < 0 ||
            accessDepartments > 2 ||
            accessDepartments < 0
        ) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.put(import.meta.env.VITE_BASE_URL + "/security/group", {
            id: id,
            name: name.trim(),
            title: title.trim(),
            accessRouters: accessRouters,
            accessUsers: accessUsers,
            accessDepartments: accessDepartments,
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
        })
    }

    const remove = () => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/security/group", {
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

    const createAccountGroup = (accountId: number) => {
        const groupId = id;
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/security/account-group", {
            accountId,
            groupId,
        }).then((_response) => {
            openGroupsDialog(groupId);
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

    const deleteAccountGroup = (accountId: number) => {
        const groupId = id;

        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/security/account-group", {
            data: {
                accountId,
                groupId,
            }
        }).then((_response) => {
            openGroupsDialog(groupId);
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

    /// OPEN DIALOG

    const openCreateDialog = () => {
        setId(0);
        setName('');
        setTitle('');
        setAccessRouters(0);
        setAccessUsers(0);
        setAccessDepartments(0);
        setDialogCreateActive(true)
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setTitle(response.data.title);
            setAccessRouters(response.data.accessRouters);
            setAccessUsers(response.data.accessUsers);
            setAccessDepartments(response.data.accessDepartments);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
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

    const openGroupsDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {
            params: {id: Number(id)}
        }).then((response) => {
            setAccountGroups(response.data.accountGroups);
            axios.get(import.meta.env.VITE_BASE_URL + "/security/account", {}).then((response) => {
                setAccounts(response.data);
                setDialogGroupsActive(true);
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
            dispatch(setAppLoading(false));
        })
    }

    const openFilterDialog = () => {
        setDialogFilterActive(true)
    }

    /// OTHER

    const sortTable = (column: keyof GroupFields, asc: boolean) => {
        const sorted = [...groups];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setGroups(sorted);
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
        dispatch(setAppTitle('Groups'));
        getAll();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, groups]);

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
                    {groups.map((account, index) => (
                        <tr key={index}>
                            <td className={'action'}>
                                <div className={'action-buttons'}>
                                    <button
                                        onClick={() => openEditDialog(account.id)}
                                        children={<IconTableEdit/>}
                                    />
                                    <button
                                        onClick={() => openDeleteDialog(account.id)}
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
                                        account[defTableHeader.field]
                                    )}
                                    {defTableHeader.type === 'Integer' && (
                                        Number(account[defTableHeader.field])
                                    )}
                                    {defTableHeader.type === 'Boolean' && (
                                        account[defTableHeader.field] ? 'True' : 'False'
                                    )}
                                    {defTableHeader.type === 'Date' && (
                                        dateToString(new Date(account[defTableHeader.field]))
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {dialogCreateActive && <Dialog
                title={'Create Group'}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={"Name"}
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
                    <FieldInputRadio
                        title={'Access Routers'}
                        value={accessRouters}
                        setValue={setAccessRouters}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={'Access Users'}
                        value={accessUsers}
                        setValue={setAccessUsers}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={'Access Departments'}
                        value={accessDepartments}
                        setValue={setAccessDepartments}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: 'Cancel'},
                    {action: () => create(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update Group'}
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
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputRadio
                        title={'Access Routers'}
                        value={accessRouters}
                        setValue={setAccessRouters}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={'Access Users'}
                        value={accessUsers}
                        setValue={setAccessUsers}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={'Access Departments'}
                        value={accessDepartments}
                        setValue={setAccessDepartments}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => openGroupsDialog(id), text: 'Accounts'},
                    {action: () => update(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete Group'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => remove(), text: 'Delete'},
                ]}
            />}
            {dialogGroupsActive && <Dialog
                title={'Account-Group'}
                close={() => setDialogGroupsActive(false)}
                children={<div className={'groups'}>
                    <div className={'left'}>
                        {accountGroups.map((accountGroup, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{accountGroup.account.fullname}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteAccountGroup(accountGroup.accountId)}
                                    >Del
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={'right'}>
                        {accounts.map((account, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{account.fullname}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => createAccountGroup(account.id)}
                                    >Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogGroupsActive(false), text: 'Close'},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={'Filter Groups'}
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
                    <FieldInputRadioNullable
                        title={'Access Users'}
                        value={filter.accessUsers}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessUsers: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessUsers: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessUsers: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessUsers: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={'Access Routers'}
                        value={filter.accessRouters}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessRouters: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessRouters: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessRouters: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessRouters: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={'Access Departments'}
                        value={filter.accessDepartments}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessDepartments: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessDepartments: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessDepartments: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessDepartments: 'editor'})},
                        ]}
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

export default PageGroups
