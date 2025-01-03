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
import {useTranslation} from "react-i18next";

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
    accessMails: 0 | 1 | 2,
    accessMailGroups: 0 | 1 | 2,
}

const defTableHeaders: { text: string, field: keyof GroupFields, width: string, type: TypeField }[] = [
    {text: 'groupsTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'groupsTableName', field: 'name', width: '200px', type: 'String'},
    {text: 'groupsTableTitle', field: 'title', width: '300px', type: 'String'},
    {text: 'groupsTableRouters', field: 'accessRouters', width: '100px', type: 'Integer'},
    {text: 'groupsTableUsers', field: 'accessUsers', width: '100px', type: 'Integer'},
    {text: 'groupsTableDepartments', field: 'accessDepartments', width: '100px', type: 'Integer'},
    {text: 'groupsTableMails', field: 'accessMails', width: '100px', type: 'Integer'},
    {text: 'groupsTableMailGroups', field: 'accessMailGroups', width: '100px', type: 'Integer'},
    {text: 'groupsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'groupsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageGroups: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

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
    const [accessMails, setAccessMails] = useState<number>(0);
    const [accessMailGroups, setAccessMailGroups] = useState<number>(0);

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
            accessDepartments < 0 ||
            accessMails > 2 ||
            accessMails < 0 ||
            accessMailGroups > 2 ||
            accessMailGroups < 0
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
            accessMails: accessMails,
            accessMailGroups: accessMailGroups,
        }).then((response) => {
            setDialogCreateActive(false);
            groups.unshift({
                ...response.data,
            });
            setGroups(groups);
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
            accessDepartments < 0 ||
            accessMails > 2 ||
            accessMails < 0 ||
            accessMailGroups > 2 ||
            accessMailGroups < 0
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
            accessMails: accessMails,
            accessMailGroups: accessMailGroups,
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = groups.findIndex((row: GroupFields) => {
                return row.id === response.data.id
            });
            groups[index] = {
                ...response.data,
            };
            setGroups(groups);
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
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = groups.findIndex((row: GroupFields) => {
                return row.id === response.data.id
            });
            groups.splice(index, 1);
            setGroups(groups);
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
        setAccessMails(0);
        setAccessMailGroups(0);
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
            setAccessMails(response.data.accessMails);
            setAccessMailGroups(response.data.accessMailGroups);
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
        dispatch(setAppTitle('groupsTitle'));
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
                                {t(defTableHeader.text)}
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
                title={t('groupsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('groupsCreateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('groupsCreateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputRadio
                        title={t('groupsCreateFieldRouters')}
                        value={accessRouters}
                        setValue={setAccessRouters}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsCreateFieldUsers')}
                        value={accessUsers}
                        setValue={setAccessUsers}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsCreateFieldDepartments')}
                        value={accessDepartments}
                        setValue={setAccessDepartments}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsCreateFieldMails')}
                        value={accessMails}
                        setValue={setAccessMails}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsCreateFieldMailGroups')}
                        value={accessMailGroups}
                        setValue={setAccessMailGroups}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('groupsCreateButtonCancel')},
                    {action: () => create(), text: t('groupsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('groupsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('groupsUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('groupsUpdateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('groupsUpdateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputRadio
                        title={t('groupsUpdateFieldRouters')}
                        value={accessRouters}
                        setValue={setAccessRouters}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsUpdateFieldUsers')}
                        value={accessUsers}
                        setValue={setAccessUsers}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsUpdateFieldDepartments')}
                        value={accessDepartments}
                        setValue={setAccessDepartments}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsUpdateFieldMails')}
                        value={accessMails}
                        setValue={setAccessMails}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                    <FieldInputRadio
                        title={t('groupsUpdateFieldMailGroups')}
                        value={accessMailGroups}
                        setValue={setAccessMailGroups}
                        variants={[
                            {value: 0, text: 'No'},
                            {value: 1, text: 'Viewer'},
                            {value: 2, text: 'Editor'},
                        ]}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('groupsUpdateButtonCancel')},
                    {action: () => openGroupsDialog(id), text: t('groupsUpdateButtonAccounts')},
                    {action: () => update(), text: t('groupsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('groupsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('groupsDeleteText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('groupsDeleteButtonCancel')},
                    {action: () => remove(), text: t('groupsDeleteButtonDelete')},
                ]}
            />}
            {dialogGroupsActive && <Dialog
                title={t('groupsAccountsTitle')}
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
                                    >{t('groupsAccountsDel')}
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
                                    >{t('groupsAccountsAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogGroupsActive(false), text: t('groupsAccountsButtonClose')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('groupsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('groupsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('groupsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('groupsFilterFieldName')}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={t('groupsFilterFieldTitle')}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputRadioNullable
                        title={t('groupsFilterFieldRouters')}
                        value={filter.accessRouters}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessRouters: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessRouters: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessRouters: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessRouters: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={t('groupsFilterFieldUsers')}
                        value={filter.accessUsers}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessUsers: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessUsers: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessUsers: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessUsers: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={t('groupsFilterFieldDepartments')}
                        value={filter.accessDepartments}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessDepartments: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessDepartments: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessDepartments: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessDepartments: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={t('groupsFilterFieldMails')}
                        value={filter.accessMails}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessMails: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessMails: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessMails: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessMails: 'editor'})},
                        ]}
                    />
                    <FieldInputRadioNullable
                        title={t('groupsFilterFieldMailGroups')}
                        value={filter.accessMailGroups}
                        variants={[
                            {value: undefined, text: 'NULL', set: () => setFilter({...filter, accessMailGroups: undefined})},
                            {value: 'no', text: 'No', set: () => setFilter({...filter, accessMailGroups: 'no'})},
                            {value: 'viewer', text: 'Viewer', set: () => setFilter({...filter, accessMailGroups: 'viewer'})},
                            {value: 'editor', text: 'Editor', set: () => setFilter({...filter, accessMailGroups: 'editor'})},
                        ]}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('groupsFilterButtonClose')},
                    {action: () => setQuery(), text: t('groupsFilterButtonConfirm')},
                ]}
            />}
        </>
    )
}

export default PageGroups
