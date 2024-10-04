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
import {useTranslation} from "react-i18next";

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
    localWorkplace: string,
    phone: string,
    cellular: string,

    departmentId: number,
    departmentName: string,

    disabled: 0 | 1,
}

const defTableHeaders: { text: string, field: keyof UserFields, width: string, type: TypeField }[] = [
    {text: 'usersTableID', field: 'id', width: '50px', type: 'String'},
    {text: 'usersTableDisabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'usersTableFullname', field: 'fullname', width: '300px', type: 'String'},
    {text: 'usersTableLogin', field: 'login', width: '150px', type: 'String'},
    {text: 'usersTableDepartment', field: 'departmentName', width: '150px', type: 'String'},
    {text: 'usersTableRemoteWorkplace', field: 'workplace', width: '200px', type: 'String'},
    {text: 'usersTableLocalWorkplace', field: 'localWorkplace', width: '200px', type: 'String'},
    {text: 'usersTablePhone', field: 'phone', width: '100px', type: 'String'},
    {text: 'usersTableCellular', field: 'cellular', width: '150px', type: 'String'},
    {text: 'usersTableTitle', field: 'title', width: '300px', type: 'String'},
    {text: 'usersTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'usersTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageUsers: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

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
    const [localWorkplace, setLocalWorkplace] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [cellular, setCellular] = useState<string>('');
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
            name: name.trim(),
            surname: surname.trim(),
            patronymic: patronymic.trim(),
            fullname: `${surname} ${name} ${patronymic}`,
            title: title.trim(),
            login: login.trim(),
            password: password.trim(),
            workplace: workplace.trim(),
            localWorkplace: localWorkplace.trim(),
            phone: phone.trim(),
            cellular: cellular.trim(),
            departmentId: departmentId,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            setDialogCreateActive(false);
            rows.unshift({
                ...response.data,
                departmentName: response.data.department ? response.data.department.name : 'NULL',
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/user", {
            id: id,
            name: name.trim(),
            surname: surname.trim(),
            patronymic: patronymic.trim(),
            fullname: `${surname} ${name} ${patronymic}`,
            title: title.trim(),
            login: login.trim(),
            password: password.trim(),
            workplace: workplace.trim(),
            localWorkplace: localWorkplace.trim(),
            phone: phone.trim(),
            cellular: cellular.trim(),
            departmentId: departmentId,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = rows.findIndex((row: UserFields) => {
                return row.id === response.data.id
            });
            rows[index] = {
                ...response.data,
                departmentName: response.data.department ? response.data.department.name : 'NULL',
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/user", {
            data: {
                id: id,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: UserFields) => {
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
        setLocalWorkplace('');
        setPhone('');
        setCellular('');
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
            setLocalWorkplace(response.data.localWorkplace);
            setPhone(response.data.phone);
            setCellular(response.data.cellular);
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
        dispatch(setAppTitle('usersTitle'));
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
                title={t('usersCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('usersCreateFieldSurname')}
                        placeholder={"Enter text"}
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldPatronymic')}
                        placeholder={"Enter text"}
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldPost')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldLogin')}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldPassword')}
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
                        title={t('usersCreateFieldDepartment')}
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
                        title={t('usersCreateFieldRemoteWorkplace')}
                        placeholder={"Enter text"}
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldLocalWorkplace')}
                        placeholder={"Enter text"}
                        value={localWorkplace}
                        onChange={(e) => setLocalWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldPhone')}
                        placeholder={"Enter text"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersCreateFieldCellular')}
                        placeholder={"Enter text"}
                        value={cellular}
                        onChange={(e) => setCellular(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('usersCreateFieldDisabled')}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('usersCreateButtonCancel')},
                    {action: () => create(), text: t('usersCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('usersUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('usersUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldSurname')}
                        placeholder={"Enter text"}
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldPatronymic')}
                        placeholder={"Enter text"}
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldPost')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldLogin')}
                        placeholder={"Enter text"}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldPassword')}
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
                        title={t('usersUpdateFieldDepartment')}
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
                        title={t('usersUpdateFieldRemoteWorkplace')}
                        placeholder={"Enter text"}
                        value={workplace}
                        onChange={(e) => setWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldLocalWorkplace')}
                        placeholder={"Enter text"}
                        value={localWorkplace}
                        onChange={(e) => setLocalWorkplace(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldPhone')}
                        placeholder={"Enter text"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <FieldInputString
                        title={t('usersUpdateFieldCellular')}
                        placeholder={"Enter text"}
                        value={cellular}
                        onChange={(e) => setCellular(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('usersUpdateFieldDisabled')}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('usersUpdateButtonCancel')},
                    {action: () => exportUserPDF(), text: t('usersUpdateButtonExportPDF')},
                    {action: () => update(), text: t('usersUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('usersDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('usersDeleteText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('usersDeleteButtonCancel')},
                    {action: () => remove(), text: t('usersDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('usersFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('usersFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('usersFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldName')}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldSurname')}
                        placeholder={'Enter text'}
                        value={filter.surname}
                        onChange={(e) => setFilter({...filter, surname: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldPatronymic')}
                        placeholder={'Enter text'}
                        value={filter.patronymic}
                        onChange={(e) => setFilter({...filter, patronymic: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldFullname')}
                        placeholder={'Enter text'}
                        value={filter.fullname}
                        onChange={(e) => setFilter({...filter, fullname: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldPost')}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldLogin')}
                        placeholder={'Enter text'}
                        value={filter.login}
                        onChange={(e) => setFilter({...filter, login: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldPassword')}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputSelectMany
                        title={t('usersFilterFieldDepartment')}
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
                        title={t('usersFilterFieldRemoteWorkplace')}
                        placeholder={'Enter text'}
                        value={filter.workplace}
                        onChange={(e) => setFilter({...filter, workplace: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldLocalWorkplace')}
                        placeholder={'Enter text'}
                        value={filter.localWorkplace}
                        onChange={(e) => setFilter({...filter, localWorkplace: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldPhone')}
                        placeholder={'Enter text'}
                        value={filter.phone}
                        onChange={(e) => setFilter({...filter, phone: e.target.value})}
                    />
                    <FieldInputString
                        title={t('usersFilterFieldCellular')}
                        placeholder={'Enter text'}
                        value={filter.cellular}
                        onChange={(e) => setFilter({...filter, cellular: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={t('usersFilterFieldDisabled')}
                        value={filter.disabled}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('usersFilterButtonClose')},
                    {action: () => setQuery(), text: t('usersFilterButtonConfirm')},
                ]}
            />}
        </>
    )
}

export default PageUsers
