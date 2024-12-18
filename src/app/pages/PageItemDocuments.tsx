import './Page.scss';
import React, {useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import {useDispatch} from "react-redux";
import {setAppError, setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";
import FieldInputDate from "../fields/FieldInputDate.tsx";
import IconDownload from "../icons/IconDownload.tsx";
import {ItemFields} from "./PageItems.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import {formatFileSize} from "../../utils/formatFileSize.ts";
import FieldInputSelectOneString from "../fields/FieldInputSelectOneString.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface ItemDocument {
    id: number;
    created: string;
    updated: string;

    name: string;
    type: string;
    note: string;
    date: string;

    itemId: number;

    itemDevice: string;
}

interface TableHeaders {
    text: string,
    field: keyof ItemDocument,
    width: string,
    type: TypeField,
}

const defTableHeaders: TableHeaders[] = [
    {text: 'itemDocumentsTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'itemDocumentsTableName', field: 'name', width: '150px', type: 'String'},
    {text: 'itemDocumentsTableType', field: 'type', width: '100px', type: 'String'},
    {text: 'itemDocumentsTableNote', field: 'note', width: '100px', type: 'String'},
    {text: 'itemDocumentsTableDate', field: 'date', width: '150px', type: 'Date'},
    {text: 'itemDocumentsTableItemDevice', field: 'itemDevice', width: '150px', type: 'String'},
    {text: 'itemDocumentsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'itemDocumentsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

export const documentTypes = [
    '',
    'Покупка',
    'Передача',
    'Сервисный центр',
];

const PageItems: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [rows, setRows] = useState<ItemDocument[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [itemId, setItemId] = useState<number>(0);

    const [items, setItems] = useState<ItemFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    const [file, setFile] = useState<File>();

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item-document", {
            params: getQueryObj(),
        }).then((response) => {
            const data = response.data.itemDocuments.map((itemDocument: any) => {
                return {
                    ...itemDocument,
                    itemDevice: itemDocument.item.device,
                }
            })
            setRows(data);
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
        if (!file) {
            dispatch(setAppError('File not found'));
            dispatch(setAppLoading(false));
            return;
        }

        if (file.size > 4194304) {
            dispatch(setAppError('File is too large (4MB+)'));
            dispatch(setAppLoading(false));
            return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
            const base64Blob: string | undefined = reader.result?.toString().split(',')[1];
            if (!base64Blob) {
                dispatch(setAppError('Magic issue was happened!'));
                dispatch(setAppLoading(false));
                return;
            }
            const blob = base64Blob;

            axios.post(import.meta.env.VITE_BASE_URL + "/db/item-document", {
                data: {
                    blob: blob,
                    name: name,
                    type: type,
                    note: note,
                    date: date,
                    itemId: itemId,
                },
            }).then((response) => {
                setDialogCreateActive(false);
                rows.unshift({
                    ...response.data.itemDocument,
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

        reader.readAsDataURL(file);
    }

    const remove = () => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/item-document", {
            data: {
                id: id,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: ItemDocument) => {
                return row.id === response.data.itemDocument.id
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
        setType('');
        setNote('');
        setDate('');
        setItemId(0);
        getItems();
        setDialogCreateActive(true);
    }

    const openDeleteDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item-document", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.itemDocument.id);
            setName(response.data.itemDocument.name);
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
        getItems();
        setDialogFilterActive(true);
    }

    /// OTHER

    const sortTable = (column: keyof ItemDocument, asc: boolean) => {
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

    const downloadItemDocumentFile = (itemDocumentId: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item-document/get-blob", {
            params: {id: itemDocumentId},
        }).then((response) => {
            const itemDocument = response.data.itemDocument

            if (!itemDocument || !itemDocument.blob || !itemDocument.blob.data) {
                dispatch(setAppError('Incorrect document'));
                dispatch(setAppLoading(false));
                return;
            }

            const {blob, name} = itemDocument;
            const fileBlob = new Blob([Uint8Array.from(blob.data)], {type: blob.type});
            const url = URL.createObjectURL(fileBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = name || 'document';
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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

    const getItems = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item", {}).then((response) => {
            setItems(response.data.items.sort((a: any, b: any) => {
                return a.device.localeCompare(b.device)
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

    const handleItemDocumentFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget: EventTarget & HTMLInputElement = event.target;
        const fileList: FileList | null = eventTarget.files;
        if (fileList) {
            const file: File = fileList[0];
            setFile(file);
            setName(file.name);
        }
    }

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('itemDocumentsTitle'));
        getAll();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search]);

    return (
        <>
            <div className={'table'}>
                <table className={'header'}>
                    <thead>
                    <tr>
                        <th className={'action'}>
                            <div className={'action-buttons'} style={{width: '80px'}}>
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
                                <div className={'action-buttons'} style={{width: '80px'}}>
                                    <button
                                        onClick={() => downloadItemDocumentFile(row.id)}
                                        children={<IconDownload/>}
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
                title={t('itemDocumentsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <div className='Field'>
                        <div className='title'>
                            <p>{t('itemDocumentsCreateFieldFile')}</p>
                        </div>
                        <div className='field'>
                            <input
                                type={'file'}
                                onChange={handleItemDocumentFileInput}
                            />
                            <div>
                                <p>{file ? file.type : ''}</p>
                            </div>
                            <div>
                                <p>{file ? formatFileSize(file.size) : ''}</p>
                            </div>
                        </div>
                    </div>
                    <FieldInputString
                        title={t('itemDocumentsCreateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputSelectOneString
                        title={t('itemDocumentsCreateFieldType')}
                        value={type}
                        setValue={setType}
                        variants={documentTypes.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemDocumentsCreateFieldNote')}
                        placeholder={"Enter text"}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <FieldInputDate
                        title={t('itemDocumentsCreateFieldDate')}
                        placeholder={"Enter text"}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={t('itemDocumentsCreateFieldItem')}
                        value={itemId}
                        setValue={setItemId}
                        nullable={false}
                        variants={items.map((item) => {
                            return {
                                value: Number(item.id),
                                text: item.device
                            }
                        })}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('itemDocumentsCreateButtonCancel')},
                    {action: () => create(), text: t('itemDocumentsCreateButtonCreate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('itemDocumentsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('itemDocumentsDeleteText')} "{name}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('itemDocumentsDeleteButtonCancel')},
                    {action: () => remove(), text: t('itemDocumentsDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('itemDocumentsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('itemDocumentsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('itemDocumentsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputSelectMany
                        title={t('itemDocumentsFilterFieldItems')}
                        value={filter.itemId || []}
                        setValue={(ids: number[]) => setFilter({...filter, itemId: ids})}
                        variants={items.map((item: ItemFields) => {
                            return {
                                value: Number(item.id),
                                text: `[ID:${item.id}] ${item.device}`
                            };
                        })}
                    />
                </>}
                buttons={[
                    {action: () => setDialogFilterActive(false), text: t('itemDocumentsFilterButtonClose')},
                    {action: () => setQuery(), text: t('itemDocumentsFilterButtonConfirm')},
                ]}
            />}
        </>
    )
}

export default PageItems
