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
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import {UserFields} from "./PageUsers.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {getInitialsFromFullname} from "../../utils/getInitialsFromFullname.ts";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import {dateToString, dateToStringOnlyDate} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";
import FieldInputInteger from "../fields/FieldInputInteger.tsx";
import FieldInputSelectOneString from "../fields/FieldInputSelectOneString.tsx";
import FieldInputDate from "../fields/FieldInputDate.tsx";
import IconDownload from "../icons/IconDownload.tsx";
import IconDelete from "../icons/IconDelete.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface ItemFields {
    id: number;
    created: string;
    updated: string;

    type: string,
    article: string,
    vendor: string,
    device: string,
    serialNumber: string,
    partNumber: string,
    supplier: string,
    deliveryDate: string;
    warrantyMonths: number;
    cost: number;
    state: string;
    specs: string;
    note: string;
    userId: number;

    userName: string;
}

export interface ItemDocument {
    id: number;
    created: string;
    updated: string;

    blob: { type: string; data: number[] };
    name: string;
    type: string;
    note: string;
    date: string;

    itemId: number;
}

interface TableHeaders {
    text: string,
    field: keyof ItemFields,
    width: string,
    type: TypeField,
}

const defTableHeaders: TableHeaders[] = [
    {text: 'itemsTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'itemsTableType', field: 'type', width: '100px', type: 'String'},
    {text: 'itemsTableArticle', field: 'article', width: '100px', type: 'String'},
    {text: 'itemsTableDevice', field: 'device', width: '150px', type: 'String'},
    {text: 'itemsTableCost', field: 'cost', width: '100px', type: 'Integer'},
    {text: 'itemsTableState', field: 'state', width: '150px', type: 'String'},
    {text: 'itemsTableUserName', field: 'userName', width: '200px', type: 'String'},
    {text: 'itemsTableCreated', field: 'created', width: '150px', type: 'Date'},
    {text: 'itemsTableUpdated', field: 'updated', width: '150px', type: 'Date'},
]

const types = [
    '',
    'ПК',
    'Ноутбук',
    'Монитор',
    'HDD SATA',
    'HDD SAS',
    'SSD SATA',
    'SSD NVME',
    'MEM',
    'CPU',
    'MB',
    'Блок питания',
    'Видеокарта',
    'Телефон voip',
    'Смартфон',
    'Веб-камера',
];

const states = [
    '',
    'В эксплуатации',
    'В сервисном центре',
    'Списано',
];

const documentTypes = [
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

    const [rows, setRows] = useState<ItemFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);
    const [dialogDocumentsActive, setDialogDocumentsActive] = useState<boolean>(false);
    const [dialogDocumentsCreateActive, setDialogDocumentsCreateActive] = useState<boolean>(false);
    const [dialogDocumentsDeleteActive, setDialogDocumentsDeleteActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [type, setType] = useState<string>('');
    const [article, setArticle] = useState<string>('');
    const [vendor, setVendor] = useState<string>('');
    const [device, setDevice] = useState<string>('');
    const [serialNumber, setSerialNumber] = useState<string>('');
    const [partNumber, setPartNumber] = useState<string>('');
    const [supplier, setSupplier] = useState<string>('');
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [warrantyMonths, setWarrantyMonths] = useState<number>(0);
    const [cost, setCost] = useState<number>(0);
    const [state, setState] = useState<string>('');
    const [specs, setSpecs] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [userId, setUserId] = useState<number>(0);

    const [users, setUsers] = useState<UserFields[]>([]);

    const [filter, setFilter] = useState<any>({});

    const [createDocumentFile, setCreateDocumentFile] = useState<File | null>(null);
    const [createDocumentName, setCreateDocumentName] = useState<string>('');
    const [createDocumentType, setCreateDocumentType] = useState<string>('');
    const [createDocumentNote, setCreateDocumentNote] = useState<string>('');
    const [createDocumentDate, setCreateDocumentDate] = useState<string>('');

    const [documents, setDocuments] = useState<ItemDocument[]>([]);

    const [deleteDocument, setDeleteDocument] = useState<ItemDocument | null>(null);

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item", {
            params: getQueryObj(),
        }).then((response) => {
            const data = response.data.items.map((item: any) => {
                return {
                    ...item,
                    userName: item.user ? getInitialsFromFullname(item.user.fullname) : 'NULL',
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/item", {
            data: {
                type: type,
                article: article.trim(),
                vendor: vendor.trim(),
                device: device.trim(),
                serialNumber: serialNumber.trim(),
                partNumber: partNumber.trim(),
                supplier: supplier.trim(),
                deliveryDate: deliveryDate,
                warrantyMonths: warrantyMonths,
                cost: cost,
                state: state.trim(),
                specs: specs.trim(),
                note: note.trim(),
                userId: userId,
            },
        }).then((response) => {
            setDialogCreateActive(false);
            rows.unshift({
                ...response.data.item,
                userName: response.data.item.user ? getInitialsFromFullname(response.data.item.user.fullname) : 'NULL',
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/item", {
            data: {
                id: id,
                type: type.trim(),
                article: article.trim(),
                vendor: vendor.trim(),
                device: device.trim(),
                serialNumber: serialNumber.trim(),
                partNumber: partNumber.trim(),
                supplier: supplier.trim(),
                deliveryDate: deliveryDate.trim(),
                warrantyMonths: warrantyMonths,
                cost: cost,
                state: state.trim(),
                specs: specs.trim(),
                note: note.trim(),
                userId: userId,
            }
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = rows.findIndex((row: ItemFields) => {
                return row.id === response.data.item.id
            });
            rows[index] = {
                ...response.data.item,
                userName: response.data.item.user ? getInitialsFromFullname(response.data.item.user.fullname) : 'NULL',
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/item", {
            data: {
                id: id,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: ItemFields) => {
                return row.id === response.data.item.id
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

    const createItemDocument = () => {
        dispatch(setAppLoading(true));
        const file: File | null = createDocumentFile;
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
            const name = createDocumentName;
            const type = createDocumentType;
            const note = createDocumentNote;
            const date = createDocumentDate;
            const itemId = id

            axios.post(import.meta.env.VITE_BASE_URL + "/db/item-document", {
                data: {
                    blob,
                    name,
                    type,
                    note,
                    date,
                    itemId,
                },
            }).then((_response) => {
                setDialogDocumentsCreateActive(false);
                getItemDocuments();
                console.log(_response);
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

    const getItemDocuments = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item-document", {
            params: {itemId: id},
        }).then((response) => {
            const data = response.data.itemDocuments.map((item: any) => {
                return {
                    ...item,
                }
            }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setDocuments(data);
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

    const removeItemDocument = () => {
        dispatch(setAppLoading(true));
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/item-document", {
            data: {
                id: deleteDocument ? deleteDocument.id : 0,
            },
        }).then((_response) => {
            getItemDocuments();
            setDialogDocumentsDeleteActive(false);
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
        setType('');
        setArticle('');
        setVendor('');
        setDevice('');
        setSerialNumber('');
        setPartNumber('');
        setSupplier('');
        setDeliveryDate('');
        setWarrantyMonths(0);
        setCost(0);
        setState('');
        setSpecs('');
        setNote('');
        setUserId(0);
        getUsers();
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.item.id);
            setType(response.data.item.type);
            setArticle(response.data.item.article);
            setVendor(response.data.item.vendor);
            setDevice(response.data.item.device);
            setSerialNumber(response.data.item.serialNumber);
            setPartNumber(response.data.item.partNumber);
            setSupplier(response.data.item.supplier);
            setDeliveryDate(response.data.item.deliveryDate.split('T')[0]);
            setWarrantyMonths(response.data.item.warrantyMonths);
            setCost(response.data.item.cost);
            setState(response.data.item.state);
            setSpecs(response.data.item.specs);
            setNote(response.data.item.note);
            setUserId(response.data.item.userId ? response.data.item.userId : 0);
            getUsers();
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

    const openDeleteDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/item", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.item.id);
            setDevice(response.data.item.device);
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

    const openDocumentsDialog = () => {
        getItemDocuments();
        setDialogDocumentsActive(true)
    }

    const openDocumentsCreateDialog = () => {
        setCreateDocumentFile(null);
        setCreateDocumentName('');
        setCreateDocumentType('');
        setCreateDocumentNote('');
        setCreateDocumentDate('');
        setDialogDocumentsCreateActive(true);
    }

    const openDocumentsDeleteDialog = (document: ItemDocument) => {
        setDeleteDocument(document);
        setDialogDocumentsDeleteActive(true)
    }

    /// OTHER

    const sortTable = (column: keyof ItemFields, asc: boolean) => {
        const sorted = [...rows];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRows(sorted);
    };

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

    const handleItemDocumentFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const eventTarget: EventTarget & HTMLInputElement = event.target;
        const fileList: FileList | null = eventTarget.files;
        if (fileList) {
            const file: File = fileList[0];
            setCreateDocumentFile(file);
            setCreateDocumentName(file.name);
        }
    }

    const formatFileSize = (sizeInBytes: number): string => {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        } else if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(2)} KB`;
        } else if (sizeInBytes < 1024 * 1024 * 1024) {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
        } else {
            return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }
    };

    const downloadItemDocumentFile = (itemDocument: ItemDocument) => {
        if (!itemDocument || !itemDocument.blob || !itemDocument.blob.data) {
            dispatch(setAppError('Incorrect document'));
            return;
        }

        const { blob, name } = itemDocument;
        const fileBlob = new Blob([Uint8Array.from(blob.data)], { type: blob.type });
        const url = URL.createObjectURL(fileBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = name || 'document';
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const autofill = () => {
        const index = indexToString(types.findIndex(el => el === type));
        const articles = rows.filter(row => row.type === type).map(row => Number(row.article.substring(3, 9)));
        let articleNumber = 0;
        for (let i = 0; i < 999999; i++) {
            if (!articles.includes(i)) {
                articleNumber = i;
                break;
            }
        }
        const article = articleToString(articleNumber)
        setArticle(index + article);
    }

    const indexToString = (index: number): string => {
        if (index < 0 || index > 999) {
            return '000';
        } else if (index >= 0 && index < 10) {
            return `00${index}`;
        } else if (index >= 10 && index < 100) {
            return `0${index}`;
        } else {
            return `${index}`;
        }
    }

    const articleToString = (article: number): string => {
        if (article < 0 || article > 999) {
            return '000000';
        } else if (article >= 0 && article < 10) {
            return `00000${article}`;
        } else if (article >= 10 && article < 100) {
            return `0000${article}`;
        } else if (article >= 100 && article < 1000) {
            return `000${article}`;
        } else if (article >= 1000 && article < 10000) {
            return `00${article}`;
        } else if (article >= 10000 && article < 100000) {
            return `0${article}`;
        } else {
            return `${article}`;
        }
    }

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('itemsTitle'));
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
                title={t('itemsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputSelectOneString
                        title={t('itemsCreateFieldType')}
                        value={type}
                        setValue={setType}
                        variants={types.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldArticle')}
                        placeholder={"Enter text"}
                        value={article}
                        mask={'999999999'}
                        onChange={(e) => setArticle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldVendor')}
                        placeholder={"Enter text"}
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldDevice')}
                        placeholder={"Enter text"}
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldSerialNumber')}
                        placeholder={"Enter text"}
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldPartNumber')}
                        placeholder={"Enter text"}
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldSupplier')}
                        placeholder={"Enter text"}
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                    />
                    <FieldInputDate
                        title={t('itemsCreateFieldDeliveryDate')}
                        placeholder={"Enter text"}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                    <FieldInputInteger
                        title={t('itemsCreateFieldWarrantyMonths')}
                        min={0}
                        max={999}
                        step={1}
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(e.target.value)}
                    />
                    <FieldInputInteger
                        title={t('itemsCreateFieldCost')}
                        min={0}
                        max={100000000}
                        step={1000}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />
                    <FieldInputSelectOneString
                        title={t('itemsCreateFieldState')}
                        value={state}
                        setValue={setState}
                        variants={states.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldSpecs')}
                        placeholder={"Enter text"}
                        value={specs}
                        onChange={(e) => setSpecs(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsCreateFieldNote')}
                        placeholder={"Enter text"}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={t('itemsCreateFieldUser')}
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
                    {action: () => setDialogCreateActive(false), text: t('itemsCreateButtonCancel')},
                    {action: () => autofill(), text: t('itemsCreateButtonAutofill')},
                    {action: () => create(), text: t('itemsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('itemsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('itemsUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputSelectOneString
                        title={t('itemsUpdateFieldType')}
                        value={type}
                        setValue={setType}
                        variants={types.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldArticle')}
                        placeholder={"Enter text"}
                        value={article}
                        mask={'999999999'}
                        onChange={(e) => setArticle(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldVendor')}
                        placeholder={"Enter text"}
                        value={vendor}
                        onChange={(e) => setVendor(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldDevice')}
                        placeholder={"Enter text"}
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldSerialNumber')}
                        placeholder={"Enter text"}
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldPartNumber')}
                        placeholder={"Enter text"}
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldSupplier')}
                        placeholder={"Enter text"}
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                    />
                    <FieldInputDate
                        title={t('itemsUpdateFieldDeliveryDate')}
                        placeholder={"Enter text"}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                    <FieldInputInteger
                        title={t('itemsUpdateFieldWarrantyMonths')}
                        min={0}
                        max={999}
                        step={1}
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(e.target.value)}
                    />
                    <FieldInputInteger
                        title={t('itemsUpdateFieldCost')}
                        min={0}
                        max={100000000}
                        step={1000}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                    />
                    <FieldInputSelectOneString
                        title={t('itemsUpdateFieldState')}
                        value={state}
                        setValue={setState}
                        variants={states.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldSpecs')}
                        placeholder={"Enter text"}
                        value={specs}
                        onChange={(e) => setSpecs(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsUpdateFieldNote')}
                        placeholder={"Enter text"}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={t('itemsUpdateFieldUser')}
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
                    {action: () => setDialogUpdateActive(false), text: t('itemsUpdateButtonCancel')},
                    {action: () => openDocumentsDialog(), text: t('itemsUpdateButtonDocuments')},
                    {action: () => update(), text: t('itemsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('itemsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('itemsDeleteText')} "{device}" (ID: {id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('itemsDeleteButtonCancel')},
                    {action: () => remove(), text: t('itemsDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('itemsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('itemsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('itemsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    {/*<FieldInputSelectMany*/}
                    {/*    title={t('itemsFilterFieldType')}*/}
                    {/*    value={filter.type}*/}
                    {/*    setValue={(e: any) => setFilter({...filter, type: e.target.value})}*/}
                    {/*    variants={types.map((type) => {*/}
                    {/*        return {*/}
                    {/*            value: type,*/}
                    {/*            text: '',*/}
                    {/*        }*/}
                    {/*    }) as any}*/}
                    {/*/>*/}
                    <FieldInputString
                        title={t('itemsFilterFieldType')}
                        placeholder={'Enter text'}
                        value={filter.type}
                        onChange={(e) => setFilter({...filter, type: e.target.value})}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldArticle')}
                        placeholder={"Enter text"}
                        value={filter.article}
                        mask={'999999999'}
                        onChange={(e) => setFilter({...filter, article: e.target.value})}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldVendor')}
                        placeholder={"Enter text"}
                        value={filter.vendor}
                        onChange={(e) => setFilter({...filter, article: e.target.value})}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldDevice')}
                        placeholder={"Enter text"}
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldSerialNumber')}
                        placeholder={"Enter text"}
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldPartNumber')}
                        placeholder={"Enter text"}
                        value={partNumber}
                        onChange={(e) => setPartNumber(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldSupplier')}
                        placeholder={"Enter text"}
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                    />
                    <FieldInputDate
                        title={t('itemsFilterFieldDeliveryDate')}
                        placeholder={"Enter text"}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                    {/*<FieldInputInteger*/}
                    {/*    title={t('itemsFilterFieldWarrantyMonths')}*/}
                    {/*    min={0}*/}
                    {/*    max={999}*/}
                    {/*    step={1}*/}
                    {/*    value={warrantyMonths}*/}
                    {/*    onChange={(e) => setWarrantyMonths(e.target.value)}*/}
                    {/*/>*/}
                    {/*<FieldInputInteger*/}
                    {/*    title={t('itemsFilterFieldCost')}*/}
                    {/*    min={0}*/}
                    {/*    max={100000000}*/}
                    {/*    step={1000}*/}
                    {/*    value={cost}*/}
                    {/*    onChange={(e) => setCost(e.target.value)}*/}
                    {/*/>*/}
                    <FieldInputString
                        title={t('itemsFilterFieldState')}
                        placeholder={"Enter text"}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldSpecs')}
                        placeholder={"Enter text"}
                        value={specs}
                        onChange={(e) => setSpecs(e.target.value)}
                    />
                    <FieldInputString
                        title={t('itemsFilterFieldNote')}
                        placeholder={"Enter text"}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <FieldInputSelectMany
                        title={t('itemsFilterFieldUsers')}
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
                    {action: () => setDialogFilterActive(false), text: t('itemsFilterButtonClose')},
                    {action: () => setQuery(), text: t('itemsFilterButtonConfirm')},
                ]}
            />}
            {dialogDocumentsActive && <Dialog
                title={t('itemsDocumentsTitle')}
                close={() => setDialogDocumentsActive(false)}
                children={<>
                    {documents.map((document, index) => (
                        <div className='Field' key={index}>
                            <div className='field'>
                                <button
                                    style={{maxWidth: 40, minWidth: 40}}
                                    onClick={() => downloadItemDocumentFile(document)}
                                    children={<IconDownload/>}
                                />
                                <button
                                    style={{maxWidth: 40, minWidth: 40}}
                                    onClick={() => openDocumentsDeleteDialog(document)}
                                    children={<IconDelete/>}
                                />
                            </div>
                            <div className='field'>
                                <p>{dateToStringOnlyDate(new Date(document.date))}</p>
                            </div>
                            <div className='field'>
                                <p>{document.name}</p>
                            </div>
                            <div className='field'>
                                <p>{document.type}</p>
                            </div>
                            <div className='field'>
                                <p>{document.note}</p>
                            </div>
                        </div>
                    ))}
                </>}
                buttons={[
                    {action: () => setDialogDocumentsActive(false), text: t('itemsDocumentsButtonClose')},
                    {action: () => openDocumentsCreateDialog(), text: t('itemsDocumentsButtonAdd')},
                ]}
            />}
            {dialogDocumentsCreateActive && <Dialog
                title={t('itemsDocumentsCreateTitle')}
                close={() => setDialogDocumentsCreateActive(false)}
                children={<>
                    <div className='Field'>
                        <div className='title'>
                            <p>{t('itemsDocumentsCreateFieldFile')}</p>
                        </div>
                        <div className='field'>
                            <input
                                type={'file'}
                                onChange={handleItemDocumentFileInput}
                            />
                            <div>
                                <p>{createDocumentFile ? createDocumentFile.type : ''}</p>
                            </div>
                            <div>
                                <p>{createDocumentFile ? formatFileSize(createDocumentFile.size) : ''}</p>
                            </div>
                        </div>
                    </div>
                    <FieldInputString
                        title={t('itemsDocumentsCreateFieldName')}
                        placeholder={"Enter text"}
                        value={createDocumentName}
                        onChange={(e) => setCreateDocumentName(e.target.value)}
                    />
                    <FieldInputSelectOneString
                        title={t('itemsDocumentsCreateFieldType')}
                        value={createDocumentType}
                        setValue={setCreateDocumentType}
                        variants={documentTypes.map((type) => {
                            return {
                                value: type,
                                text: '',
                            }
                        })}
                    />
                    <FieldInputString
                        title={t('itemsDocumentsCreateFieldNote')}
                        placeholder={"Enter text"}
                        value={createDocumentNote}
                        onChange={(e) => setCreateDocumentNote(e.target.value)}
                    />
                    <FieldInputDate
                        title={t('itemsDocumentsCreateFieldDate')}
                        placeholder={"Enter text"}
                        value={createDocumentDate}
                        onChange={(e) => setCreateDocumentDate(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogDocumentsCreateActive(false), text: t('itemsDocumentsCreateButtonCancel')},
                    {action: () => createItemDocument(), text: t('itemsDocumentsCreateButtonCreate')},
                ]}
            />}
            {dialogDocumentsDeleteActive && <Dialog
                title={t('itemsDocumentsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('itemsDocumentsDeleteText')} "{deleteDocument?.name}" (ID: {deleteDocument?.id})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDocumentsDeleteActive(false), text: t('itemsDocumentsDeleteButtonCancel')},
                    {action: () => removeItemDocument(), text: t('itemsDocumentsDeleteButtonDelete')},
                ]}
            />}
        </>
    )
}

export default PageItems
