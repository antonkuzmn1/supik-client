import './Page.scss';
import React, {useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppMessage, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";
import {MailFields} from "./PageMails.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface MailGroupFields {
    id: string;
    created: string;
    updated: string;

    name: string,
    description: string,
    label: string,

    members: string,
    membersCount: number,
}

const defTableHeaders: { text: string, field: keyof MailGroupFields, width: string, type: TypeField }[] = [
    {text: 'mailGroupsTableID', field: 'id', width: '50px', type: 'String'},
    {text: 'mailGroupsTableName', field: 'name', width: '200px', type: 'String'},
    {text: 'mailGroupsTableDescription', field: 'description', width: '150px', type: 'String'},
    {text: 'mailGroupsTableLabel', field: 'label', width: '150px', type: 'String'},
    {text: 'mailGroupsTableMembersCount', field: 'membersCount', width: '100px', type: 'Integer'},
    {text: 'mailGroupsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'mailGroupsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageMails: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [rows, setRows] = useState<MailGroupFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);
    const [dialogMembersActive, setDialogMembersActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [label, setLabel] = useState<string>('');

    const [members, setMembers] = useState<MailFields[]>([]);
    const [allMails, setAllMails] = useState<MailFields[]>([]);
    const [filteredMails, setFilteredMails] = useState<MailFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            params: getQueryObj(),
        }).then((response) => {
            setRows(response.data.mailGroups.map((row: any) => {
                return {
                    ...row,
                    membersCount: row.members.length,
                }
            }).sort((a: any, b: any) => a.name.localeCompare(b.name)));
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            data: {
                name: name.trim(),
                description: description.trim(),
                label: label.trim(),
            }
        }).then((response) => {
            setDialogCreateActive(false);
            rows.unshift({
                ...response.data.created,
            });
            setRows(rows);
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            data: {
                id,
                name: name.trim(),
                description: description.trim(),
                label: label.trim(),
            }
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = rows.findIndex((row: MailGroupFields) => {
                return row.id === response.data.created.id
            });
            rows[index] = {
                ...response.data.created,
            };
            setRows(rows);
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            data: {
                id: id,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: MailGroupFields) => {
                return row.id === response.data.id
            });
            rows.splice(index, 1);
            setRows(rows);
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

    const addMember = (mailId: string) => {
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/mail-mail-group", {
            mailId: Number(mailId),
            mailGroupId: Number(id),
        }).then((response) => {
            members.unshift({
                ...response.data.created.mail,
            });
            setMembers([...members]);
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

    const deleteMember = (mailId: string) => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/mail-mail-group", {
            data: {
                mailId: Number(mailId),
                mailGroupId: Number(id),
            }
        }).then((response) => {
            const index = members.findIndex((member: MailFields) => {
                return member.id === response.data.deleted.mailId
            });
            members.splice(index, 1);
            setMembers([...members]);
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
        setName('');
        setDescription('');
        setLabel('');
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            params: {
                id,
            },
        }).then((response) => {
            setId(response.data.mailGroup.id);
            setName(response.data.mailGroup.name);
            setDescription(response.data.mailGroup.description);
            setLabel(response.data.mailGroup.label);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.mailGroup.id);
            setName(response.data.mailGroup.name);
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

    const openMembersDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group", {
            params: {id: Number(id)}
        }).then((response) => {
            const members = response.data.mailGroup.members.map((member: any) => member.mail)
            setMembers(members);
            axios.get(import.meta.env.VITE_BASE_URL + "/db/mail", {}).then((response) => {
                setAllMails(response.data.mails);
                setDialogMembersActive(true);
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

    const sortTable = (column: keyof MailGroupFields, asc: boolean) => {
        const sorted = [...rows];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRows(sorted);
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

    const syncAccounts = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group/sync/", {}).then((response) => {
            console.log(response);
            getAll();
            dispatch(setAppMessage('Successfully success!'));
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
        dispatch(setAppTitle('mailGroupsTitle'));
        getAll();
        // getUsers();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, rows]);

    useEffect(() => {
        const memberIds: number[] = members.map((member: any) => member.id);
        const filteredMails = allMails.filter((mail: any) => {
            return !memberIds.includes(mail.id);
        })
        filteredMails.sort((a, b) => a.email.localeCompare(b.email));
        setFilteredMails(filteredMails);
    }, [allMails, members]);

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
                                        // @ts-ignore
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
                title={t('mailGroupsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('mailGroupsCreateName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailGroupsCreateDescription')}
                        placeholder={"Enter text"}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailGroupsCreateLabel')}
                        placeholder={"Enter text"}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('mailGroupsCreateButtonCancel')},
                    {action: () => syncAccounts(), text: t('mailGroupsCreateButtonSync')},
                    {action: () => create(), text: t('mailGroupsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('mailGroupsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('mailGroupsCreateName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailGroupsCreateDescription')}
                        placeholder={"Enter text"}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailGroupsCreateLabel')}
                        placeholder={"Enter text"}
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('mailGroupsUpdateButtonCancel')},
                    {action: () => openMembersDialog(id), text: t('mailGroupsUpdateButtonMembers')},
                    {action: () => update(), text: t('mailGroupsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('mailGroupsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('mailGroupsDeleteText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('mailGroupsDeleteButtonCancel')},
                    {action: () => remove(), text: t('mailGroupsDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('mailGroupsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('mailGroupsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('mailGroupsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailGroupsFilterName')}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailGroupsFilterDescription')}
                        placeholder={'Enter text'}
                        value={filter.description}
                        onChange={(e) => setFilter({...filter, description: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailGroupsFilterLabel')}
                        placeholder={'Enter text'}
                        value={filter.label}
                        onChange={(e) => setFilter({...filter, label: e.target.value})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('mailGroupsFilterButtonClose')},
                    {action: () => setQuery(), text: t('mailGroupsFilterButtonConfirm')},
                ]}
            />}
            {dialogMembersActive && <Dialog
                title={t('mailGroupsMembersTitle')}
                close={() => setDialogMembersActive(false)}
                children={<div className={'groups'}>
                    <div className={'left'}>
                        {members.map((member, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{member.email}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteMember(member.id)}
                                    >{t('mailGroupsMembersDelete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={'right'}>
                        {filteredMails.map((mail, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{mail.email}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => addMember(mail.id)}
                                    >{t('mailGroupsMembersAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogMembersActive(false), text: t('mailGroupsMembersButtonClose')},
                ]}
            />}
        </>
    )
}

export default PageMails
