import React, {useEffect, useState} from "react";
import axios from "axios";
import {baseUrl} from "../../utils/baseUrl.ts";
import {useDispatch} from "react-redux";
import {setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import {AccountFields} from "./PageAccount.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

const defTableHeaders: { text: string, field: keyof AccountFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Username', field: 'username', width: '150px', type: 'String'},
    {text: 'Admin', field: 'admin', width: '100px', type: 'Boolean'},
    {text: 'Disabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'Full name', field: 'fullname', width: '300px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageAccounts: React.FC = () => {
    const dispatch = useDispatch();

    const [accounts, setAccounts] = useState<AccountFields[]>([]);
    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogGroupsActive, setDialogGroupsActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordRepeat, setPasswordRepeat] = useState<string>('');
    const [fullname, setFullname] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [admin, setAdmin] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(false);

    const [accountGroups, setAccountGroups] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);

    /// CRUD

    const getAccounts = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {}).then((response) => {
            setAccounts(response.data)
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const createAccount = () => {
        if (password !== passwordRepeat) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.post(baseUrl + "/security/account", {
            username: username,
            password: password,
            fullname: fullname,
            title: title,
            admin: admin ? 1 : 0,
            disabled: disabled ? 1 : 0,
        }).then((_response) => {
            setDialogCreateActive(false);
            getAccounts();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const updateAccount = () => {
        if (password !== passwordRepeat) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.put(baseUrl + "/security/account", {
            id: id,
            username: username,
            password: password,
            fullname: fullname,
            title: title,
            admin: admin ? 1 : 0,
            disabled: disabled ? 1 : 0,
        }).then((_response) => {
            setDialogUpdateActive(false);
            getAccounts();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const deleteAccount = () => {
        dispatch(setAppLoading(true));
        axios.delete(baseUrl + "/security/account", {
            data: {id: id},
        }).then((_response) => {
            setDialogDeleteActive(false);
            getAccounts();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const createAccountGroup = (groupId: number) => {
        const accountId = id;

        dispatch(setAppLoading(true));
        axios.post(baseUrl + "/security/account-group", {
            accountId,
            groupId,
        }).then((_response) => {
            openGroupsDialog(accountId);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const deleteAccountGroup = (groupId: number) => {
        const accountId = id;

        dispatch(setAppLoading(true));
        axios.delete(baseUrl + "/security/account-group", {
            data: {
                accountId,
                groupId,
            }
        }).then((_response) => {
            openGroupsDialog(accountId);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    /// OPEN DIALOG

    const openCreateDialog = () => {
        setId(0);
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setFullname('');
        setTitle('');
        setAdmin(false);
        setDisabled(false);
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setUsername(response.data.username);
            setPassword('');
            setPasswordRepeat('');
            setFullname(response.data.fullname);
            setTitle(response.data.title);
            setAdmin(!!response.data.admin);
            setDisabled(!!response.data.disabled);
            setDialogUpdateActive(true);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const openDeleteDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setFullname(response.data.fullname);
            setDialogDeleteActive(true);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const openGroupsDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setAccountGroups(response.data.accountGroups);
            axios.get(baseUrl + "/security/group", {}).then((response) => {
                setGroups(response.data);
                setDialogGroupsActive(true);
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                dispatch(setAppLoading(false));
            })
        }).catch((error) => {
            console.log(error);
            dispatch(setAppLoading(false));
        })
    }

    /// OTHER

    const sortTable = (column: keyof AccountFields, asc: boolean) => {
        const sortedAccounts = [...accounts];
        sortedAccounts.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setAccounts(sortedAccounts);
    };

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Accounts'));
        getAccounts();
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
                    {accounts.map((account, index) => (
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
                title={'Create Account'}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={"Username"}
                        placeholder={"Enter text"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={"Full name"}
                        placeholder={"Enter text"}
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"Admin"}
                        value={admin}
                        setTrue={() => setAdmin(true)}
                        setFalse={() => setAdmin(false)}
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
                    {action: () => createAccount(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update Account'}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={"ID"}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={"Username"}
                        placeholder={"Enter text"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={"Full name"}
                        placeholder={"Enter text"}
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"Admin"}
                        value={admin}
                        setTrue={() => setAdmin(true)}
                        setFalse={() => setAdmin(false)}
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
                    {action: () => openGroupsDialog(id), text: 'Groups'},
                    {action: () => updateAccount(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete Account'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{fullname}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => deleteAccount(), text: 'Delete'},
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
                                    <p>{accountGroup.group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteAccountGroup(accountGroup.groupId)}
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
                                        onClick={() => createAccountGroup(group.id)}
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

export default PageAccounts
