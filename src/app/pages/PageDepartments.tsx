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
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {UserFields} from "./PageUsers.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface DepartmentFields {
    id: string;
    created: string;
    updated: string;

    name: string,
    title: string,

    leaderId: number,
    leaderName: string,
    membersLength: number,
}

const defTableHeaders: { text: string, field: keyof DepartmentFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'String'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Leader Name', field: 'leaderName', width: '300px', type: 'String'},
    {text: 'Members', field: 'membersLength', width: '100px', type: 'Integer'},
    {text: 'Title', field: 'title', width: '200px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageDepartments: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [rows, setRows] = useState<DepartmentFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [leaderId, setLeaderId] = useState<number>(0);

    const [users, setUsers] = useState<UserFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/department", {
            params: getQueryObj(),
        }).then((response) => {
            setRows(response.data.departments.map((row: any) => {
                return {
                    ...row,
                    leaderName: row.leader ? row.leader.fullname : 'NULL',
                    membersLength: row.members.length,
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/department", {
            name: name,
            title: title,
            leaderId: leaderId,
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/department", {
            id: id,
            name: name,
            title: title,
            leaderId: leaderId,
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/department", {
            data: {
                id: id,
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
        setTitle('');
        setLeaderId(0);
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/department", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.department.id);
            setName(response.data.department.name);
            setTitle(response.data.department.title);
            setLeaderId(response.data.department.leaderId ? response.data.department.leaderId : 0);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/department", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.department.id);
            setName(response.data.department.name);
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

    const sortTable = (column: keyof DepartmentFields, asc: boolean) => {
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

    const getUsers = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {}).then((response) => {
            setUsers(response.data.filter((user: any) => {
                return user.disabled === 0;
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

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Departments'));
        getAll();
        getUsers();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, rows]);

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
                title={'Create User'}
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
                    <FieldInputSelectOne
                        title={'Leader'}
                        value={leaderId}
                        setValue={setLeaderId}
                        nullable={true}
                        variants={users.map((user) => {
                            return {
                                value: Number(user.id),
                                text: user.fullname
                            }
                        })}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: 'Cancel'},
                    {action: () => create(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update User'}
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
                    <FieldInputSelectOne
                        title={'Leader'}
                        value={leaderId}
                        setValue={setLeaderId}
                        nullable={true}
                        variants={users.map((user) => {
                            return {
                                value: Number(user.id),
                                text: user.fullname
                            }
                        })}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    {action: () => update(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete User'}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>Are u sure want to delete "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: 'Cancel'},
                    {action: () => remove(), text: 'Delete'},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={'Filter Users'}
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
                        title={'Title'}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputSelectMany
                        title={'Leaders'}
                        value={filter.leaderId || []}
                        setValue={(ids: number[]) => setFilter({...filter, leaderId: ids})}
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

export default PageDepartments