import './Page.scss';
import React, {ChangeEvent, useEffect, useState} from "react";
import IconTableFilter from "../icons/IconTableFilter.tsx";
import IconTableCreate from "../icons/IconTableCreate.tsx";
import IconSortAsc from "../icons/IconSortAsc.tsx";
import IconSortDesc from "../icons/IconSortDesc.tsx";
import IconTableEdit from "../icons/IconTableEdit.tsx";
import IconTableDelete from "../icons/IconTableDelete.tsx";
import {setAppLoading, setAppTitle} from "../../slices/appSlice.ts";
import axios from "axios";
import {baseUrl} from "../../utils/baseUrl.ts";
import {useDispatch} from "react-redux";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldInputFile from "../fields/FieldInputFile.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface RouterFields {
    id: string;
    created: string;
    updated: string;
    login: string,
    password: string,
    localAddress: string,
    remoteAddress: string,
    name: string,
    title: string,
    disabled: 0 | 1,
    l2tpKey: string,
}

const defTableHeaders: { text: string, field: keyof RouterFields, width: string, type: TypeField }[] = [
    {text: 'ID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'Local Address', field: 'localAddress', width: '150px', type: 'String'},
    {text: 'Name', field: 'name', width: '200px', type: 'String'},
    {text: 'Title', field: 'title', width: '300px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageRouters: React.FC = () => {
    const dispatch = useDispatch();

    const [routers, setRouters] = useState<RouterFields[]>([]);

    const [fileBase64, setFileBase64] = useState<string | null>(null);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    // const [dialogViewersActive, setDialogViewersActive] = useState<boolean>(false);
    // const [dialogEditorsActive, setDialogEditorsActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [localAddress, setLocalAddress] = useState<string>('');
    const [remoteAddress, setRemoteAddress] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [disabled, setDisabled] = useState<boolean>(false);
    const [certificate, setCertificate] = useState<File | null>(null);
    const [l2tpKey, setL2tpKey] = useState<string>('');

    // const [groups, setGroups] = useState<any[]>([]);
    // const [viewers, setViewers] = useState<any[]>([]);
    // const [editors, setEditors] = useState<any[]>([]);

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/router", {}).then((response) => {
            setRouters(response.data)
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const create = () => {
        dispatch(setAppLoading(true));
        axios.post(baseUrl + "/db/router", {
            login: login,
            password: password,
            remoteAddress: remoteAddress,
            localAddress: localAddress,
            name: name,
            title: title,
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey,
        }).then((response) => {
            console.log(response);
            setDialogCreateActive(false);
            getAll();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        });
    }

    const update = () => {
        dispatch(setAppLoading(true));
        axios.put(baseUrl + "/db/router", {
            id: id,
            login: login,
            password: password,
            remoteAddress: remoteAddress,
            localAddress: localAddress,
            name: name,
            title: title,
            disabled: disabled ? 1 : 0,
            certificate: fileBase64 ? fileBase64 : null,
            l2tpKey: l2tpKey,
        }).then((response) => {
            console.log(response);
            setDialogUpdateActive(false);
            getAll();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        });
    }

    const remove = () => {
        dispatch(setAppLoading(true));
        axios.delete(baseUrl + "/db/router", {
            data: {id: id},
        }).then((_response) => {
            setDialogDeleteActive(false);
            getAll();
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    /// DIALOG

    const openCreateDialog = () => {
        setId(0);
        setLogin('');
        setPassword('');
        setLocalAddress('');
        setRemoteAddress('');
        setName('');
        setTitle('');
        setDisabled(false);
        setCertificate(null)
        setL2tpKey('');
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            console.log(response);
            setId(response.data.id);
            setLogin(response.data.login);
            setPassword(response.data.password);
            setLocalAddress(response.data.localAddress);
            setRemoteAddress(response.data.remoteAddress);
            setName(response.data.name);
            setTitle(response.data.title);
            setDisabled(response.data.disabled);
            if (response.data.certificate) {
                const file = convertToFile(response.data.certificate, 'certificate.crt')
                setCertificate(file);
            } else {
                setCertificate(null);
            }
            setL2tpKey(response.data.l2tpKey);
            setDialogUpdateActive(true);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const openDeleteDialog = (id: string) => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setDialogDeleteActive(true);
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    /// OTHER

    const sortTable = (column: keyof RouterFields, asc: boolean) => {
        const sorted = [...routers];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRouters(sorted);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setCertificate(selectedFile);
            convertFileToBase64(selectedFile);
        }
    };

    const convertFileToBase64 = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const convertToFile = (certificate: any, fileName: string) => {
        const buffer = new Uint8Array(certificate.data);
        const blob = new Blob([buffer], { type: 'application/x-x509-ca-cert' });
        return new File([blob], fileName, { type: blob.type });
    };

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Routers'));
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
                    {routers.map((router, index) => (
                        <tr key={index}>
                            <td className={'action'}>
                                <div className={'action-buttons'}>
                                    <button
                                        onClick={() => openEditDialog(router.id)}
                                        children={<IconTableEdit/>}
                                    />
                                    <button
                                        onClick={() => openDeleteDialog(router.id)}
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
                                        router[defTableHeader.field]
                                    )}
                                    {defTableHeader.type === 'Integer' && (
                                        Number(router[defTableHeader.field])
                                    )}
                                    {defTableHeader.type === 'Boolean' && (
                                        router[defTableHeader.field] ? 'True' : 'False'
                                    )}
                                    {defTableHeader.type === 'Date' && (
                                        new Date(router[defTableHeader.field]).toDateString()
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            {dialogCreateActive && <Dialog
                title={'Create Router'}
                close={() => setDialogCreateActive(false)}
                children={<>
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
                    <FieldInputString
                        title={"Local Addr"}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"Remote Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"name"}
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
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={"Certificate"}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={"L2TP Key"}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: 'Cancel'},
                    {action: () => create(), text: 'Create'},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={'Update Group'}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={"ID"}
                        value={id.toString()}
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
                    <FieldInputString
                        title={"Local Addr"}
                        placeholder={"Enter text"}
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"Remote Addr"}
                        placeholder={"Enter text"}
                        value={remoteAddress}
                        onChange={(e) => setRemoteAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={"name"}
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
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                    <FieldInputFile
                        title={"Certificate"}
                        placeholder={"Upload file"}
                        value={certificate}
                        onChange={handleFileChange}
                    />
                    <FieldInputString
                        title={"L2TP Key"}
                        placeholder={"Enter text"}
                        value={l2tpKey}
                        onChange={(e) => setL2tpKey(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: 'Cancel'},
                    // {action: () => openGroupsDialog(id), text: 'Groups'},
                    {action: () => update(), text: 'Update'},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={'Delete Group'}
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

export default PageRouters
