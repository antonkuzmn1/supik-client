import './Page.scss';
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import {baseUrl} from "../../utils/baseUrl.ts";
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

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface GroupFields {
    id: string;
    created: string;
    updated: string;
    name: string;
    title: string;
    accessRouters: 0 | 1 | 2,
    accessUsers: 0 | 1 | 2,
}

const defTableHeaders: { text: string, field: keyof GroupFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Routers', field: 'accessRouters', width: '100px', type: 'Integer'},
    {text: 'Users', field: 'accessUsers', width: '100px', type: 'Integer'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageGroups: React.FC = () => {
    const dispatch = useDispatch();

    const [groups, setGroups] = useState<GroupFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogGroupsActive, setDialogGroupsActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [accessRouters, setAccessRouters] = useState<number>(0);
    const [accessUsers, setAccessUsers] = useState<number>(0);

    const [accountGroups, setAccountGroups] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/group", {}).then((response) => {
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
            accessUsers < 0
        ) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.post(baseUrl + "/security/group", {
            name: name,
            title: title,
            accessRouters: accessRouters,
            accessUsers: accessUsers,
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
            accessUsers < 0
        ) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.put(baseUrl + "/security/group", {
            id: id,
            name: name,
            title: title,
            accessRouters: accessRouters,
            accessUsers: accessUsers,
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
        axios.delete(baseUrl + "/security/group", {
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
        axios.post(baseUrl + "/security/account-group", {
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
        axios.delete(baseUrl + "/security/account-group", {
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
        setDialogCreateActive(true)
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/group", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setTitle(response.data.title);
            setAccessRouters(response.data.accessRouters);
            setAccessUsers(response.data.accessUsers);
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
        axios.get(baseUrl + "/security/group", {
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
        axios.get(baseUrl + "/security/group", {
            params: {id: Number(id)}
        }).then((response) => {
            setAccountGroups(response.data.accountGroups);
            axios.get(baseUrl + "/security/account", {}).then((response) => {
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

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Groups'));
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
                                        new Date(account[defTableHeader.field]).toDateString()
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
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => openGroupsDialog(id), text: 'Groups'},
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
        </>
    )
}

export default PageGroups
