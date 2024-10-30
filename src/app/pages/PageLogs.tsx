import './Page.scss';
import React, {useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface LogFields {
    id: string;
    created: string;

    action: string,
    initiatorUsername: string,
}

const defTableHeaders: { text: string, field: keyof LogFields, width: string, type: TypeField }[] = [
    {text: 'logsTableID', field: 'id', width: '50px', type: 'String'},
    {text: 'logsTableInitiator', field: 'initiatorUsername', width: '150px', type: 'String'},
    {text: 'logsTableAction', field: 'action', width: '250px', type: 'String'},
    {text: 'logsTableCreated', field: 'created', width: '150px', type: 'Date'},
]

const PageLogs: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [rows, setRows] = useState<LogFields[]>([]);

    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);

    const [filter, setFilter] = useState<any>({});

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/log", {
            params: getQueryObj(),
        }).then((response) => {
            console.log('logs:', response);
            setRows(response.data.map((log: any) => {
                return {
                    ...log,
                    initiatorUsername: log.initiator.username,
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

    /// DIALOG

    const openFilterDialog = () => {
        setDialogFilterActive(true)
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/log", {
            params: {id: Number(id)}
        }).then((response) => {
            console.log(response.data);
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

    /// OTHER

    const sortTable = (column: keyof LogFields, asc: boolean) => {
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

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('logsTitle'));
        getAll();
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
            <p>{t('logsTextHint')} [F12]</p>
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
            {dialogFilterActive && <Dialog
                title={t('logsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('logsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('logsFilterButtonClose')},
                    {action: () => setQuery(), text: t('logsFilterButtonConfirm')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('logsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    {/*<FieldValueString*/}
                    {/*    title={t('groupsUpdateFieldID')}*/}
                    {/*    value={id.toString()}*/}
                    {/*/>*/}
                    {/*<FieldInputString*/}
                    {/*    title={t('groupsUpdateFieldName')}*/}
                    {/*    placeholder={"Enter text"}*/}
                    {/*    value={name}*/}
                    {/*    onChange={(e) => setName(e.target.value)}*/}
                    {/*/>*/}
                    {/*<FieldInputString*/}
                    {/*    title={t('groupsUpdateFieldTitle')}*/}
                    {/*    placeholder={"Enter text"}*/}
                    {/*    value={title}*/}
                    {/*    onChange={(e) => setTitle(e.target.value)}*/}
                    {/*/>*/}
                    {/*<FieldInputRadio*/}
                    {/*    title={t('groupsUpdateFieldRouters')}*/}
                    {/*    value={accessRouters}*/}
                    {/*    setValue={setAccessRouters}*/}
                    {/*    variants={[*/}
                    {/*        {value: 0, text: 'No'},*/}
                    {/*        {value: 1, text: 'Viewer'},*/}
                    {/*        {value: 2, text: 'Editor'},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                    {/*<FieldInputRadio*/}
                    {/*    title={t('groupsUpdateFieldUsers')}*/}
                    {/*    value={accessUsers}*/}
                    {/*    setValue={setAccessUsers}*/}
                    {/*    variants={[*/}
                    {/*        {value: 0, text: 'No'},*/}
                    {/*        {value: 1, text: 'Viewer'},*/}
                    {/*        {value: 2, text: 'Editor'},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                    {/*<FieldInputRadio*/}
                    {/*    title={t('groupsUpdateFieldDepartments')}*/}
                    {/*    value={accessDepartments}*/}
                    {/*    setValue={setAccessDepartments}*/}
                    {/*    variants={[*/}
                    {/*        {value: 0, text: 'No'},*/}
                    {/*        {value: 1, text: 'Viewer'},*/}
                    {/*        {value: 2, text: 'Editor'},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                    {/*<FieldInputRadio*/}
                    {/*    title={t('groupsUpdateFieldMails')}*/}
                    {/*    value={accessMails}*/}
                    {/*    setValue={setAccessMails}*/}
                    {/*    variants={[*/}
                    {/*        {value: 0, text: 'No'},*/}
                    {/*        {value: 1, text: 'Viewer'},*/}
                    {/*        {value: 2, text: 'Editor'},*/}
                    {/*    ]}*/}
                    {/*/>*/}
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('logsUpdateButtonCancel')},
                ]}
            />}
        </>
    )
}

export default PageLogs
