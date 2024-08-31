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

    const [accountCreateUsername, setAccountCreateUsername] = useState<string>('');
    const [accountCreatePassword, setAccountCreatePassword] = useState<string>('');
    const [accountCreatePasswordRepeat, setAccountCreatePasswordRepeat] = useState<string>('');
    const [accountCreateFullname, setAccountCreateFullname] = useState<string>('');
    const [accountCreateTitle, setAccountCreateTitle] = useState<string>('');
    const [accountCreateAdmin, setAccountCreateAdmin] = useState<boolean>(false);
    const [accountCreateDisabled, setAccountCreateDisabled] = useState<boolean>(false);

    const [accountUpdateId, setAccountUpdateId] = useState<number>(0);
    const [accountUpdateUsername, setAccountUpdateUsername] = useState<string>('');
    const [accountUpdatePassword, setAccountUpdatePassword] = useState<string>('');
    const [accountUpdatePasswordRepeat, setAccountUpdatePasswordRepeat] = useState<string>('');
    const [accountUpdateFullname, setAccountUpdateFullname] = useState<string>('');
    const [accountUpdateTitle, setAccountUpdateTitle] = useState<string>('');
    const [accountUpdateAdmin, setAccountUpdateAdmin] = useState<boolean>(false);
    const [accountUpdateDisabled, setAccountUpdateDisabled] = useState<boolean>(false);

    const [accountDeleteId, setAccountDeleteId] = useState<number>(0);
    const [accountDeleteFullname, setAccountDeleteFullname] = useState<string>('');

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

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setAccountUpdateId(response.data.id);
            setAccountUpdateUsername(response.data.username);
            setAccountUpdatePassword('');
            setAccountUpdatePasswordRepeat('');
            setAccountUpdateFullname(response.data.fullname);
            setAccountUpdateTitle(response.data.title);
            setAccountUpdateAdmin(!!response.data.admin);
            setAccountUpdateDisabled(!!response.data.disabled);
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
            setAccountDeleteId(response.data.id);
            setAccountDeleteFullname(response.data.fullname);
            setDialogDeleteActive(true);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const createAccount = () => {
        if (accountCreatePassword !== accountCreatePasswordRepeat) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.post(baseUrl + "/security/account", {
            username: accountCreateUsername,
            password: accountCreatePassword,
            fullname: accountCreateFullname,
            title: accountCreateTitle,
            admin: accountCreateAdmin ? 1 : 0,
            disabled: accountCreateDisabled ? 1 : 0,
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
        if (accountCreatePassword !== accountCreatePasswordRepeat) {
            return;
        }

        dispatch(setAppLoading(true));
        axios.put(baseUrl + "/security/account", {
            id: accountUpdateId,
            username: accountUpdateUsername,
            password: accountUpdatePassword,
            fullname: accountUpdateFullname,
            title: accountUpdateTitle,
            admin: accountUpdateAdmin ? 1 : 0,
            disabled: accountUpdateDisabled ? 1 : 0,
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
            data: {id: accountDeleteId},
        }).then((_response) => {
            setDialogDeleteActive(false);
            getAccounts();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

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
                                    onClick={() => setDialogCreateActive(true)}
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
                        value={accountCreateUsername}
                        onChange={(e) => setAccountCreateUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={accountCreatePassword}
                        onChange={(e) => setAccountCreatePassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={accountCreatePasswordRepeat}
                        onChange={(e) => setAccountCreatePasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={"Full name"}
                        placeholder={"Enter text"}
                        value={accountCreateFullname}
                        onChange={(e) => setAccountCreateFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={accountCreateTitle}
                        onChange={(e) => setAccountCreateTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"Admin"}
                        value={accountCreateAdmin}
                        setTrue={() => setAccountCreateAdmin(true)}
                        setFalse={() => setAccountCreateAdmin(false)}
                    />
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={accountCreateDisabled}
                        setTrue={() => setAccountCreateDisabled(true)}
                        setFalse={() => setAccountCreateDisabled(false)}
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
                        value={accountUpdateId.toString()}
                    />
                    <FieldInputString
                        title={"Username"}
                        placeholder={"Enter text"}
                        value={accountUpdateUsername}
                        onChange={(e) => setAccountUpdateUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={accountUpdatePassword}
                        onChange={(e) => setAccountUpdatePassword(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        password={true}
                        placeholder={"Enter text"}
                        value={accountUpdatePasswordRepeat}
                        onChange={(e) => setAccountUpdatePasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={"Full name"}
                        placeholder={"Enter text"}
                        value={accountUpdateFullname}
                        onChange={(e) => setAccountUpdateFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={accountUpdateTitle}
                        onChange={(e) => setAccountUpdateTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={"Admin"}
                        value={accountUpdateAdmin}
                        setTrue={() => setAccountUpdateAdmin(true)}
                        setFalse={() => setAccountUpdateAdmin(false)}
                    />
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={accountUpdateDisabled}
                        setTrue={() => setAccountUpdateDisabled(true)}
                        setFalse={() => setAccountUpdateDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => updateAccount(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete Account'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{accountDeleteFullname}" (ID: {accountDeleteId})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => deleteAccount(), text: 'Delete'},
                ]}
            />}
        </>
    )
}

export default PageAccounts
