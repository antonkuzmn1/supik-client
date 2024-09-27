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
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import {DepartmentFields} from "./PageDepartments.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import FieldGenerator, {PasswordType} from "../fields/FieldGenerator.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import JsPDF from 'jspdf';
import robotoNormalFont from '../../fonts/Roboto/Roboto-Regular.ttf';
import robotoBoldFont from '../../fonts/Roboto/Roboto-Bold.ttf';
import {MailFields} from "./PageMails.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface UserFields {
    id: string;
    created: string;
    updated: string;

    name: string,
    surname: string,
    patronymic: string,
    fullname: string,
    title: string,
    login: string,
    password: string,
    workplace: string,
    phone: string,

    departmentId: number,
    departmentName: string,

    disabled: 0 | 1,
}

const defTableHeaders: { text: string, field: keyof UserFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'String'},
    {text: 'Disabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'Fullname', field: 'fullname', width: '300px', type: 'String'},
    {text: 'Login', field: 'login', width: '150px', type: 'String'},
    {text: 'Department', field: 'departmentName', width: '150px', type: 'String'},
    {text: 'Workplace', field: 'workplace', width: '200px', type: 'String'},
    {text: 'Phone', field: 'phone', width: '100px', type: 'String'},
    {text: 'Post', field: 'title', width: '300px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageUsers: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const [rows, setRows] = useState<UserFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [surname, setSurname] = useState<string>('');
    const [patronymic, setPatronymic] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [workplace, setWorkplace] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [departmentId, setDepartmentId] = useState<number>(0);
    const [disabled, setDisabled] = useState<boolean>(false);

    const [departments, setDepartments] = useState<DepartmentFields[]>([]);
    const [mails, setMails] = useState<MailFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {
            params: getQueryObj(),
        }).then((response) => {
            setRows(response.data.map((row: any) => {
                return {
                    ...row,
                    departmentName: row.department ? row.department.name : 'NULL',
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
            title: title,
            login: login,
            password: password,
            workplace: workplace,
            phone: phone,
            departmentId: departmentId,
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
            title: title,
            login: login,
            password: password,
            workplace: workplace,
            phone: phone,
            departmentId: departmentId,
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
        setTitle('');
        setLogin('');
        setPassword('');
        setWorkplace('');
        setPhone('');
        setDepartmentId(0);
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
            setTitle(response.data.title);
            setLogin(response.data.login);
            setPassword(response.data.password);
            setWorkplace(response.data.workplace);
            setPhone(response.data.phone);
            setDisabled(response.data.disabled);
            setDepartmentId(response.data.departmentId ? response.data.departmentId : 0);
            setMails(response.data.mails);
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

    const openFilterDialog = () => {
        setDialogFilterActive(true)
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

    const getDepartments = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/department", {}).then((response) => {
            setDepartments(response.data.departments);
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

    const exportUserPDF = async () => {
        const doc = new JsPDF({
            format: 'a4',
            unit: 'px',
        });

        doc.addFont(robotoNormalFont, 'Roboto', 'normal');
        doc.addFont(robotoBoldFont, 'Roboto', 'bold');
        doc.setFont('Roboto');

        const header = 'Карточка сотрудника'
        // noinspection HttpUrlsUsage
        const data = [
            ['Фамилия', surname],
            ['Имя', name],
            ['Отчество', patronymic],
            ['Должность', title],
            ['Рабочее место', workplace],
            ['Внутренний номер', phone],
            ['Почтовый логин', mails[0]?.email ? mails[0].email : ''],
            ['Почтовый пароль', mails[0]?.password ? mails[0].password : ''],
            ['Системный логин', login],
            ['Системный пароль', password],
            ['Почтовый клиент', 'https://mail.yandex.ru'],
            ['Корпоративный месссенджер', 'Spark'],
            ['Руководство пользователя', 'http://info'],
        ];

        const columnWidths = 150;
        const startX = 10;
        const startY = 60;
        const rowHeight = 20;

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(20);

        doc.text(header, 10, 30);

        doc.setFont('Roboto', 'normal');
        doc.setFontSize(12);

        for (let i = 0; i < data.length; i++) {
            doc.text(data[i][0], startX, startY + rowHeight * i);
            doc.text(data[i][1], columnWidths, startY + rowHeight * i);
            doc.line(startX, startY + 4 + rowHeight * i, 400, startY + 4 + rowHeight * i);
        }

        doc.save(`${surname} ${name} ${patronymic}.pdf`);
    };

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Users'));
        getAll();
        getDepartments();
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
                        title={"Post"}
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
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <FieldInputSelectOne
                        title={'Department'}
                        value={departmentId}
                        setValue={setDepartmentId}
                        nullable={true}
                        variants={departments.map((department) => {
                            return {
                                value: Number(department.id),
                                text: department.name
                            }
                        })}
                    />
                    <FieldInputString
                        title={"Workplace"}
                        placeholder={"Enter text"}
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={"Phone"}
                        placeholder={"Enter text"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        title={"Post"}
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
                        password={true}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <FieldInputSelectOne
                        title={'Department'}
                        value={departmentId}
                        setValue={setDepartmentId}
                        nullable={true}
                        variants={departments.map((department) => {
                            return {
                                value: Number(department.id),
                                text: department.name
                            }
                        })}
                    />
                    <FieldInputString
                        title={"Workplace"}
                        placeholder={"Enter text"}
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={"Phone"}
                        placeholder={"Enter text"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                    {action: () => exportUserPDF(), text: 'Export PDF'},
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
                        title={'Surname'}
                        placeholder={'Enter text'}
                        value={filter.surname}
                        onChange={(e) => setFilter({...filter, surname: e.target.value})}
                    />
                    <FieldInputString
                        title={'Patronymic'}
                        placeholder={'Enter text'}
                        value={filter.patronymic}
                        onChange={(e) => setFilter({...filter, patronymic: e.target.value})}
                    />
                    <FieldInputString
                        title={'Fullname'}
                        placeholder={'Enter text'}
                        value={filter.fullname}
                        onChange={(e) => setFilter({...filter, fullname: e.target.value})}
                    />
                    <FieldInputString
                        title={'Post'}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputString
                        title={'Login'}
                        placeholder={'Enter text'}
                        value={filter.login}
                        onChange={(e) => setFilter({...filter, login: e.target.value})}
                    />
                    <FieldInputString
                        title={'Password'}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputSelectMany
                        title={'Departments'}
                        value={filter.departmentId || []}
                        setValue={(ids: number[]) => setFilter({...filter, departmentId: ids})}
                        variants={departments.map((department: DepartmentFields) => {
                            return {
                                value: Number(department.id),
                                text: `[ID:${department.id}] ${department.name}`
                            };
                        })}
                    />
                    <FieldInputString
                        title={'Workplace'}
                        placeholder={'Enter text'}
                        value={filter.workplace}
                        onChange={(e) => setFilter({...filter, workplace: e.target.value})}
                    />
                    <FieldInputString
                        title={'Phone'}
                        placeholder={'Enter text'}
                        value={filter.phone}
                        onChange={(e) => setFilter({...filter, phone: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={'Disabled'}
                        value={filter.disabled}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
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

export default PageUsers
