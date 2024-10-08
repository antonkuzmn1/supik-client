import React, {useEffect, useState} from "react";
import axios from "axios";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
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
import {useLocation, useNavigate} from "react-router-dom";
import {AccountFields} from "./PageAccount.tsx";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

interface TableHeaders {
    text: string,
    field: keyof AccountFields,
    width: string,
    type: TypeField,
}

const defTableHeaders: TableHeaders[] = [
    {text: 'accountsTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'accountsTableUsername', field: 'username', width: '150px', type: 'String'},
    {text: 'accountsTableAdmin', field: 'admin', width: '100px', type: 'Boolean'},
    {text: 'accountsTableDisabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'accountsTableFullname', field: 'fullname', width: '300px', type: 'String'},
    {text: 'accountsTableTitle', field: 'title', width: '300px', type: 'String'},
    {text: 'accountsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'accountsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageAccounts: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [accounts, setAccounts] = useState<AccountFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogGroupsActive, setDialogGroupsActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

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

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAccounts = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/security/account", {
            params: getQueryObj(),
        }).then((response) => {
            setAccounts(response.data)
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

    const createAccount = () => {
        if (password !== passwordRepeat) {
            dispatch(setAppError('Passwords do not match'));
            return;
        }

        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/security/account", {
            username: username.trim(),
            password: password.trim(),
            fullname: fullname.trim(),
            title: title.trim(),
            admin: admin ? 1 : 0,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            console.log(response.data);
            setDialogCreateActive(false);
            accounts.unshift({
                ...response.data,
            });
            setAccounts(accounts);
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

    const updateAccount = () => {
        if (password !== passwordRepeat) {
            dispatch(setAppError('Passwords do not match'));
            return;
        }

        dispatch(setAppLoading(true));
        axios.put(import.meta.env.VITE_BASE_URL + "/security/account", {
            id: id,
            username: username.trim(),
            password: password.trim(),
            fullname: fullname.trim(),
            title: title.trim(),
            admin: admin ? 1 : 0,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = accounts.findIndex((row: AccountFields) => {
                return row.id === response.data.id
            });
            accounts[index] = {
                ...response.data,
            };
            setAccounts(accounts);
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

    const deleteAccount = () => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/security/account", {
            data: {id: id},
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = accounts.findIndex((row: AccountFields) => {
                return row.id === response.data.id
            });
            accounts.splice(index, 1);
            setAccounts(accounts);
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

    const createAccountGroup = (groupId: number) => {
        const accountId = id;

        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/security/account-group", {
            accountId,
            groupId,
        }).then((_response) => {
            openGroupsDialog(accountId);
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

    const deleteAccountGroup = (groupId: number) => {
        const accountId = id;

        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/security/account-group", {
            data: {
                accountId,
                groupId,
            }
        }).then((_response) => {
            openGroupsDialog(accountId);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/security/account", {
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
        axios.get(import.meta.env.VITE_BASE_URL + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setFullname(response.data.fullname);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/security/account", {
            params: {id: Number(id)}
        }).then((response) => {
            setAccountGroups(response.data.accountGroups);
            axios.get(import.meta.env.VITE_BASE_URL + "/security/group", {}).then((response) => {
                setGroups(response.data);
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
        dispatch(setAppTitle('accountsTitle'));
        getAccounts();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, accounts]);

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
                    {accounts.map((row, index) => (
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
                title={t('accountsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('accountsCreateFieldUsername')}
                        placeholder={"Enter text"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsCreateFieldPassword')}
                        password={true}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsCreateFieldPassword')}
                        password={true}
                        placeholder={"Enter text"}
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsCreateFieldFullname')}
                        placeholder={"Enter text"}
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsCreateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('accountsCreateFieldAdmin')}
                        value={admin}
                        setTrue={() => setAdmin(true)}
                        setFalse={() => setAdmin(false)}
                    />
                    <FieldInputBoolean
                        title={t('accountsCreateFieldDisabled')}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('accountsCreateButtonCancel')},
                    {action: () => createAccount(), text: t('accountsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('accountsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('accountsUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('accountsUpdateFieldUsername')}
                        placeholder={"Enter text"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsUpdateFieldPassword')}
                        password={true}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsUpdateFieldPassword')}
                        password={true}
                        placeholder={"Enter text"}
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsUpdateFieldFullname')}
                        placeholder={"Enter text"}
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('accountsUpdateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('accountsUpdateFieldAdmin')}
                        value={admin}
                        setTrue={() => setAdmin(true)}
                        setFalse={() => setAdmin(false)}
                    />
                    <FieldInputBoolean
                        title={t('accountsUpdateFieldDisabled')}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('accountsUpdateButtonCancel')},
                    {action: () => openGroupsDialog(id), text: t('accountsUpdateButtonGroups')},
                    {action: () => updateAccount(), text: t('accountsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('accountsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('accountsDeleteText')} "{fullname}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('accountsDeleteButtonCancel')},
                    {action: () => deleteAccount(), text: t('accountsDeleteButtonDelete')},
                ]}
            />}
            {dialogGroupsActive && <Dialog
                title={t('accountsGroupsTitle')}
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
                                    >{t('accountsGroupsDel')}
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
                                    >{t('accountsGroupsAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogGroupsActive(false), text: t('accountsGroupsButtonClose')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('accountsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('accountsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('accountsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('accountsFilterFieldUsername')}
                        placeholder={'Enter text'}
                        value={filter.username}
                        onChange={(e) => setFilter({...filter, username: e.target.value})}
                    />
                    <FieldInputString
                        title={t('accountsFilterFieldFullname')}
                        placeholder={'Enter text'}
                        value={filter.fullname}
                        onChange={(e) => setFilter({...filter, fullname: e.target.value})}
                    />
                    <FieldInputString
                        title={t('accountsFilterFieldTitle')}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={t('accountsFilterFieldAdmin')}
                        value={filter.admin}
                        setNull={() => setFilter({...filter, admin: 0})}
                        setTrue={() => setFilter({...filter, admin: 'true'})}
                        setFalse={() => setFilter({...filter, admin: 'false'})}
                    />
                    <FieldInputBooleanNullable
                        title={t('accountsFilterFieldDisabled')}
                        value={filter.disabled}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('accountsFilterButtonClose')},
                    {action: () => setQuery(), text: t('accountsFilterButtonConfirm')},
                ]}
            />}
        </>
    )
}

export default PageAccounts
