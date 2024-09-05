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
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface UserFields {
    id: string;
    created: string;
    updated: string;

    name: string,
    surname: string,
    patronymic: string,
    fullname: string,
    department: string,
    title: string,
    login: string,
    password: string,

    disabled: 0 | 1,
}

const defTableHeaders: { text: string, field: keyof UserFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'String'},
    {text: 'Disabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'Surname', field: 'surname', width: '150px', type: 'String'},
    {text: 'Name', field: 'name', width: '150px', type: 'String'},
    {text: 'Patronymic', field: 'patronymic', width: '150px', type: 'String'},
    {text: 'Login', field: 'login', width: '150px', type: 'String'},
    {text: 'Password', field: 'password', width: '150px', type: 'String'},
    {text: 'Department', field: 'department', width: '150px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageUsers: React.FC = () => {

    const dispatch = useDispatch();

    const [rows, setRows] = useState<UserFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [patronymic, setPatronymic] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {}).then((response) => {
            setRows(response.data.map((vpn: any) => {
                return {
                    ...vpn,
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/user", {
            name: name,
            surname: surname,
            patronymic: patronymic,
            fullname: `${surname} ${name} ${patronymic}`,
            department: department,
            title: title,
            login: login,
            password: password,
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/user", {
            id: id,
            name: name,
            surname: surname,
            patronymic: patronymic,
            fullname: `${surname} ${name} ${patronymic}`,
            department: department,
            title: title,
            login: login,
            password: password,
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/user", {
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
        setSurname('');
        setPatronymic('');
        setDepartment('');
        setTitle('');
        setLogin('');
        setPassword('');
        setDisabled(false);
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setSurname(response.data.surname);
            setPatronymic(response.data.patronymic);
            setDepartment(response.data.department);
            setTitle(response.data.title);
            setLogin(response.data.login);
            setPassword(response.data.password);
            setDisabled(response.data.disabled);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {
            params: {
                id: id,
            },
        }).then((response) => {
            console.log(response.data)
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

    /// OTHER

    const sortTable = (column: keyof UserFields, asc: boolean) => {
        const sorted = [...rows];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRows(sorted);
    };

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Users'));
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
                title={'Create User'}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={"Surname"}
                        placeholder={"Enter text"}
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Patronymic"}
                        placeholder={"Enter text"}
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />
                    <FieldInputString
                        title={"Department"}
                        placeholder={"Enter text"}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputString
                        title={"Login"}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                title={'Update User'}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={"ID"}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={"Surname"}
                        placeholder={"Enter text"}
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <FieldInputString
                        title={"Name"}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={"Patronymic"}
                        placeholder={"Enter text"}
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />
                    <FieldInputString
                        title={"Department"}
                        placeholder={"Enter text"}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />
                    <FieldInputString
                        title={"Title"}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputString
                        title={"Login"}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={"Password"}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
        </>
    )
}

export default PageUsers
