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
import FieldValueString from "../fields/FieldValueString.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {UserFields} from "./PageUsers.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldGenerator, {PasswordType} from "../fields/FieldGenerator.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {getInitialsFromFullname} from "../../utils/getInitialsFromFullname.ts";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import {useTranslation} from "react-i18next";
import {MailGroupFields} from "./PageMailGroups.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface MailFields {
    id: string;
    created: string;
    updated: string;

    nickname: string,
    password: string,
    email: string,
    nameFirst: string,
    nameLast: string,
    nameMiddle: string,
    position: string,
    isAdmin: boolean,
    isEnabled: boolean,

    userId: number,
    userName: string,
}

const defTableHeaders: { text: string, field: keyof MailFields, width: string, type: TypeField }[] = [
    {text: 'mailsTableID', field: 'id', width: '50px', type: 'String'},
    {text: 'mailsTableUser', field: 'userName', width: '200px', type: 'String'},
    {text: 'mailsTableEMail', field: 'email', width: '250px', type: 'String'},
    {text: 'mailsTableFirstName', field: 'nameFirst', width: '130px', type: 'String'},
    {text: 'mailsTableMiddleName', field: 'nameMiddle', width: '130px', type: 'String'},
    {text: 'mailsTableLastName', field: 'nameLast', width: '130px', type: 'String'},
    {text: 'mailsTablePosition', field: 'position', width: '200px', type: 'String'},
    {text: 'mailsTableAdmin', field: 'isAdmin', width: '60px', type: 'Boolean'},
    {text: 'mailsTableEnabled', field: 'isEnabled', width: '60px', type: 'Boolean'},
    {text: 'mailsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'mailsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const PageMails: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [rows, setRows] = useState<MailFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);
    const [dialogGroupsActive, setDialogGroupsActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [nickname, setNickname] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [nameFirst, setNameFirst] = useState<string>('');
    const [nameLast, setNameLast] = useState<string>('');
    const [nameMiddle, setNameMiddle] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isEnabled, setIsEnabled] = useState<boolean>(false);
    const [userId, setUserId] = useState<number>(0);

    const [users, setUsers] = useState<UserFields[]>([]);
    const [groups, setGroups] = useState<MailGroupFields[]>([]);
    const [allMailGroups, setAllMailGroups] = useState<MailGroupFields[]>([]);
    const [filteredMailGroups, setFilteredMailGroups] = useState<MailGroupFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail", {
            params: getQueryObj(),
        }).then((response) => {
            setRows(response.data.mails.map((row: any) => {
                return {
                    ...row,
                    userName: row.user?.fullname ? getInitialsFromFullname(row.user.fullname) : 'NULL',
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/mail", {
            data: {
                nickname: nickname.trim(),
                password: password.trim(),
                nameFirst: nameFirst.trim(),
                nameLast: nameLast.trim(),
                nameMiddle: nameMiddle.trim(),
                position: position.trim(),
                isAdmin: isAdmin,
                userId: userId,
            }
        }).then((response) => {
            setDialogCreateActive(false);
            rows.unshift({
                ...response.data.created,
                userName: response.data.created.user?.fullname
                    ? getInitialsFromFullname(response.data.created.user.fullname)
                    : 'NULL',
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/mail", {
            data: {
                id,
                nickname: nickname.trim(),
                password: password.trim(),
                nameFirst: nameFirst.trim(),
                nameLast: nameLast.trim(),
                nameMiddle: nameMiddle.trim(),
                position: position.trim(),
                isAdmin: isAdmin,
                isEnabled: isEnabled,
                userId: userId,
            }
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = rows.findIndex((row: MailFields) => {
                return row.id === response.data.created.id
            });
            rows[index] = {
                ...response.data.created,
                userName: response.data.created.user?.fullname
                    ? getInitialsFromFullname(response.data.created.user.fullname)
                    : 'NULL',
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/mail", {
            data: {
                id: id,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: MailFields) => {
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

    const addGroup = (mailGroupId: string) => {
        dispatch(setAppLoading(true));
        axios.post(import.meta.env.VITE_BASE_URL + "/db/mail-mail-group", {
            mailId: Number(id),
            mailGroupId: Number(mailGroupId),
        }).then((response) => {
            console.log(response);
            groups.unshift({
                ...response.data.created.mailGroup,
            });
            setGroups([...groups]);
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

    const deleteGroup = (mailGroupId: string) => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/mail-mail-group", {
            data: {
                mailId: Number(id),
                mailGroupId: Number(mailGroupId),
            }
        }).then((response) => {
            const index = groups.findIndex((group: MailGroupFields) => {
                return group.id === response.data.deleted.mailGroupId
            });
            groups.splice(index, 1);
            setGroups([...groups]);
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
        setNickname('');
        setPassword('');
        setNameFirst('');
        setNameLast('');
        setNameMiddle('');
        setPosition('');
        setIsAdmin(false);
        setIsEnabled(false);
        setUserId(0);
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail", {
            params: {
                id,
            },
        }).then((response) => {
            setId(response.data.mail.id);
            setNickname(response.data.mail.nickname);
            setPassword(response.data.mail.password);
            setNameFirst(response.data.mail.nameFirst);
            setNameLast(response.data.mail.nameLast);
            setNameMiddle(response.data.mail.nameMiddle);
            setPosition(response.data.mail.position);
            setIsAdmin(response.data.mail.isAdmin);
            setIsEnabled(response.data.mail.isEnabled);
            setUserId(response.data.mail.userId ? response.data.mail.userId : 0);
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.mail.id);
            setNickname(response.data.mail.nickname);
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

    const openGroupsDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail", {
            params: {id: Number(id)}
        }).then((response) => {
            const groups = response.data.mail.groups.map((group: any) => group.mailGroup)
            setGroups(groups);
            axios.get(import.meta.env.VITE_BASE_URL + "/db/mail-group", {}).then((response) => {
                setAllMailGroups(response.data.mailGroups);
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

    const sortTable = (column: keyof MailFields, asc: boolean) => {
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
            }).sort((a: any, b: any) => {
                return a.fullname.localeCompare(b.fullname)
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

    const syncAccounts = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/mail/sync/", {}).then((response) => {
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

    const autoFill = () => {
        const user = users.find(user => Number(user.id) === userId);
        console.log('user:', user);
        if (user) {
            setNickname(`${translit(user.name.charAt(0).toLowerCase())}.${translit(user.surname.toLowerCase())}`);
            setNameFirst(user.name);
            setNameMiddle(user.patronymic);
            setNameLast(user.surname);
            setPosition(user.title);

            const chars = PasswordType.Normal;
            let hasNumber = false;
            let generatedPassword = "";
            for (let i = 0; i < 10; i++) {
                const char = chars.charAt(Math.floor(Math.random() * chars.length));
                generatedPassword += char;
                if (!isNaN(parseInt(char))) {
                    hasNumber = true;
                }
            }
            if (!hasNumber) {
                const randomIndex = Math.floor(Math.random() * length);
                const randomDigit = PasswordType.PIN.charAt(Math.floor(Math.random() * PasswordType.PIN.length));
                generatedPassword = password.substring(0, randomIndex) + randomDigit + password.substring(randomIndex + 1);
            }
            setPassword(generatedPassword);
        }
    }

    const translit = (word: string): string => {
        const translitMap: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
            'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
            'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
            'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
            'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
            'ш': 'sh', 'щ': 'shch', 'ы': 'y', 'э': 'e', 'ю': 'yu',
            'я': 'ya', 'ь': '', 'ъ': ''
        };

        return word.split('').map((char) => {
            const lowerChar = char.toLowerCase();
            const isUpperCase = char !== lowerChar;
            const translitChar = translitMap[lowerChar];
            return isUpperCase ? translitChar.toUpperCase() : translitChar;
        }).join('');
    }

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('mailsTitle'));
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

    useEffect(() => {
        const groupIds: number[] = groups.map((group: any) => group.id);
        const filteredMailGroups = allMailGroups.filter((mail: any) => {
            return !groupIds.includes(mail.id);
        })
        setFilteredMailGroups(filteredMailGroups);
    }, [allMailGroups, groups]);

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
                title={t('mailsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('mailsCreateNickname')}
                        placeholder={"Enter text"}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsCreatePassword')}
                        placeholder={"Enter text"}
                        value={password}
                        password={true}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <FieldInputString
                        title={t('mailsCreateFirstName')}
                        placeholder={"Enter text"}
                        value={nameFirst}
                        onChange={(e) => setNameFirst(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsCreateLastName')}
                        placeholder={"Enter text"}
                        value={nameLast}
                        onChange={(e) => setNameLast(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsCreateMiddleName')}
                        placeholder={"Enter text"}
                        value={nameMiddle}
                        onChange={(e) => setNameMiddle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsCreatePosition')}
                        placeholder={"Enter text"}
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('mailsCreateAdmin')}
                        value={isAdmin}
                        setTrue={() => setIsAdmin(true)}
                        setFalse={() => setIsAdmin(false)}
                    />
                    <FieldInputSelectOne
                        title={t('mailsCreateUser')}
                        value={userId}
                        setValue={setUserId}
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
                    {action: () => setDialogCreateActive(false), text: t('mailsCreateButtonCancel')},
                    {action: () => autoFill(), text: t('mailsCreateButtonAutofill')},
                    {action: () => syncAccounts(), text: t('mailsCreateButtonSynchronize')},
                    {action: () => create(), text: t('mailsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('mailsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('mailsUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('mailsUpdateNickname')}
                        placeholder={"Enter text"}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsUpdatePassword')}
                        placeholder={"Enter text"}
                        value={password}
                        password={true}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <FieldInputString
                        title={t('mailsUpdateFirstName')}
                        placeholder={"Enter text"}
                        value={nameFirst}
                        onChange={(e) => setNameFirst(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsUpdateLastName')}
                        placeholder={"Enter text"}
                        value={nameLast}
                        onChange={(e) => setNameLast(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsUpdateMiddleName')}
                        placeholder={"Enter text"}
                        value={nameMiddle}
                        onChange={(e) => setNameMiddle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('mailsUpdatePosition')}
                        placeholder={"Enter text"}
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                    />
                    <FieldInputBoolean
                        title={t('mailsUpdateAdmin')}
                        value={isAdmin}
                        setTrue={() => setIsAdmin(true)}
                        setFalse={() => setIsAdmin(false)}
                    />
                    <FieldInputBoolean
                        title={t('mailsUpdateEnabled')}
                        value={isEnabled}
                        setTrue={() => setIsEnabled(true)}
                        setFalse={() => setIsEnabled(false)}
                    />
                    <FieldInputSelectOne
                        title={t('mailsUpdateUser')}
                        value={userId}
                        setValue={setUserId}
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
                    {action: () => setDialogUpdateActive(false), text: t('mailsUpdateButtonCancel')},
                    {action: () => openGroupsDialog(id), text: t('mailsUpdateButtonGroups')},
                    {action: () => update(), text: t('mailsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('mailsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('mailsDeleteText')} "{nickname}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('mailsDeleteButtonCancel')},
                    {action: () => remove(), text: t('mailsDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('mailsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('mailsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('mailsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterNickname')}
                        placeholder={'Enter text'}
                        value={filter.nickname}
                        onChange={(e) => setFilter({...filter, nickname: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterPassword')}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterEMail')}
                        placeholder={'Enter text'}
                        value={filter.email}
                        onChange={(e) => setFilter({...filter, email: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterFirstName')}
                        placeholder={'Enter text'}
                        value={filter.nameFirst}
                        onChange={(e) => setFilter({...filter, nameFirst: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterLastName')}
                        placeholder={'Enter text'}
                        value={filter.nameLast}
                        onChange={(e) => setFilter({...filter, nameLast: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterMiddleName')}
                        placeholder={'Enter text'}
                        value={filter.nameMiddle}
                        onChange={(e) => setFilter({...filter, nameMiddle: e.target.value})}
                    />
                    <FieldInputString
                        title={t('mailsFilterPosition')}
                        placeholder={'Enter text'}
                        value={filter.position}
                        onChange={(e) => setFilter({...filter, position: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={t('mailsFilterAdmin')}
                        value={filter.isAdmin}
                        setNull={() => setFilter({...filter, isAdmin: 0})}
                        setTrue={() => setFilter({...filter, isAdmin: 'true'})}
                        setFalse={() => setFilter({...filter, isAdmin: 'false'})}
                    />
                    <FieldInputBooleanNullable
                        title={t('mailsFilterEnabled')}
                        value={filter.isEnabled}
                        setNull={() => setFilter({...filter, isEnabled: 0})}
                        setTrue={() => setFilter({...filter, isEnabled: 'true'})}
                        setFalse={() => setFilter({...filter, isEnabled: 'false'})}
                    />
                    <FieldInputSelectMany
                        title={t('mailsFilterUser')}
                        value={filter.userId || []}
                        setValue={(ids: number[]) => setFilter({...filter, userId: ids})}
                        variants={users.map((user: UserFields) => {
                            return {
                                value: Number(user.id),
                                text: `[ID:${user.id}] ${user.fullname}`
                            };
                        })}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('mailsFilterButtonClose')},
                    {action: () => setQuery(), text: t('mailsFilterButtonConfirm')},
                ]}
            />}
            {dialogGroupsActive && <Dialog
                title={t('mailsGroupsTitle')}
                close={() => setDialogGroupsActive(false)}
                children={<div className={'groups'}>
                    <div className={'left'}>
                        {groups.map((group, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{group.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => deleteGroup(group.id)}
                                    >{t('mailsGroupsDelete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={'right'}>
                        {filteredMailGroups.map((mailGroup, index) => (
                            <div className={'group'} key={index}>
                                <div className={'left'}>
                                    <p>{mailGroup.name}</p>
                                </div>
                                <div className={'right'}>
                                    <button
                                        onClick={() => addGroup(mailGroup.id)}
                                    >{t('mailsGroupsAdd')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>}
                buttons={[
                    {action: () => setDialogGroupsActive(false), text: t('mailsGroupsButtonClose')},
                ]}
            />}
        </>
    )
}

export default PageMails
