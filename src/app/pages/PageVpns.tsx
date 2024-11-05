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
import {RouterFields} from "./PageRouters.tsx";
import Dialog from "../dialogs/Dialog.tsx";
import FieldInputString from "../fields/FieldInputString.tsx";
import FieldInputBoolean from "../fields/FieldInputBoolean.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import FieldInputSelectOne from "../fields/FieldInputSelectOne.tsx";
import {UserFields} from "./PageUsers.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {getInitialsFromFullname} from "../../utils/getInitialsFromFullname.ts";
import FieldInputDateRange from "../fields/FieldInputDateRange.tsx";
import FieldInputBooleanNullable from "../fields/FieldInputBooleanNullable.tsx";
import FieldInputSelectMany from "../fields/FieldInputSelectMany.tsx";
import FieldGenerator, {PasswordType} from "../fields/FieldGenerator.tsx";
import {dateToString} from "../../utils/dateToString.ts";
import {useTranslation} from "react-i18next";
import IconDownload from "../icons/IconDownload.tsx";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {convertToFile} from "../../utils/convertToFile.ts";
import JsPDF from 'jspdf';
import robotoNormalFont from '../../fonts/Roboto/Roboto-Regular.ttf';
import robotoBoldFont from '../../fonts/Roboto/Roboto-Bold.ttf';
import vpnConnectionGuidePath from '../../assets/vpn_connection_guide.pdf';

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

export interface VpnFields {
    id: number;
    created: string;
    updated: string;

    name: string,
    password: string,
    profile: string,
    service: string,
    remoteAddress: string,
    title: string,
    vpnId: string,
    routerId: string;
    router: RouterFields;
    routerName: string;
    userId: string;
    user: any;
    userName: string;

    disabled: 0 | 1,
}

interface TableHeaders {
    text: string,
    field: keyof VpnFields,
    width: string,
    type: TypeField,
}

const defTableHeaders: TableHeaders[] = [
    {text: 'vpnsTableID', field: 'id', width: '50px', type: 'Integer'},
    {text: 'vpnsTableRouter', field: 'routerName', width: '100px', type: 'String'},
    {text: 'vpnsTableDisabled', field: 'disabled', width: '100px', type: 'Boolean'},
    {text: 'vpnsTableName', field: 'name', width: '200px', type: 'String'},
    {text: 'vpnsTablePassword', field: 'password', width: '150px', type: 'String'},
    {text: 'vpnsTableUser', field: 'userName', width: '150px', type: 'String'},
    {text: 'vpnsTableInternalAddress', field: 'remoteAddress', width: '150px', type: 'String'},
]

const PageVpns: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const {t} = useTranslation();

    const [rows, setRows] = useState<VpnFields[]>([]);

    const [dialogCreateActive, setDialogCreateActive] = useState<boolean>(false);
    const [dialogUpdateActive, setDialogUpdateActive] = useState<boolean>(false);
    const [dialogDeleteActive, setDialogDeleteActive] = useState<boolean>(false);
    const [dialogFilterActive, setDialogFilterActive] = useState<boolean>(false);
    const [dialogDownloadActive, setDialogDownloadActive] = useState<boolean>(false);

    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [profile, setProfile] = useState<string>('');
    const [service, setService] = useState<string>('');
    const [remoteAddress, setRemoteAddress] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [vpnId, setVpnId] = useState<string>('');
    const [routerId, setRouterId] = useState<number>(0);
    const [userId, setUserId] = useState<number>(0);
    const [disabled, setDisabled] = useState<boolean>(false);

    const [routers, setRouters] = useState<RouterFields[]>([]);
    const [users, setUsers] = useState<UserFields[]>([]);
    const [_profiles, setProfiles] = useState<any[]>([]);
    const [pools, setPools] = useState<any>({});
    const [selectedPool, setSelectedPool] = useState<string[] | undefined>(undefined);
    const [routerRemoteAddr, setRouterRemoteAddr] = useState<string>('');
    const [routerL2tpKey, setRouterL2tpKey] = useState<string>('');
    const [routerPrefix, setRouterPrefix] = useState<string>('');

    const [filter, setFilter] = useState<any>({});

    const [rdpAddress, setRdpAddress] = useState<string>('');
    const [rdpUsername, setRdpUsername] = useState<string>('');

    /// CRUD

    const getAll = () => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            params: getQueryObj(),
        }).then((response) => {
            const responseWithRouter = response.data.map((vpn: any) => {
                return {
                    ...vpn,
                    routerName: vpn.router.name,
                    userName: vpn.user ? getInitialsFromFullname(vpn.user.fullname) : 'NULL',
                }
            })
            setRows(responseWithRouter);
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
        axios.post(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            name: name.trim(),
            password: password.trim(),
            profile: profile.trim(),
            service: service.trim(),
            remoteAddress: remoteAddress.trim(),
            title: title.trim(),
            routerId: routerId,
            userId: userId,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            setDialogCreateActive(false);
            rows.unshift({
                ...response.data,
                routerName: response.data.router.name,
                userName: response.data.user ? getInitialsFromFullname(response.data.user.fullname) : 'NULL',
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
        axios.put(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            id: id,
            name: name.trim(),
            password: password.trim(),
            profile: profile.trim(),
            service: service.trim(),
            remoteAddress: remoteAddress.trim(),
            title: title.trim(),
            vpnId: vpnId,
            routerId: routerId,
            userId: userId,
            disabled: disabled ? 1 : 0,
        }).then((response) => {
            setDialogUpdateActive(false);
            const index = rows.findIndex((row: VpnFields) => {
                return row.id === response.data.id
            });
            rows[index] = {
                ...response.data,
                routerName: response.data.router.name,
                userName: response.data.user ? getInitialsFromFullname(response.data.user.fullname) : 'NULL',
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
        axios.delete(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            data: {
                id: id,
                vpnId: vpnId,
                routerId: routerId,
            },
        }).then((response) => {
            setDialogDeleteActive(false);
            const index = rows.findIndex((row: VpnFields) => {
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
        setPassword('');
        setProfile('default');
        setService('any');
        setRemoteAddress('');
        setTitle('');
        setVpnId('');
        setRouterId(0);
        setUserId(0);
        setDisabled(false);
        getRouters();
        getUsers();
        setDialogCreateActive(true);
    }

    const openEditDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setPassword(response.data.password);
            setProfile(response.data.profile);
            setService(response.data.service);
            setRemoteAddress(response.data.remoteAddress);
            setTitle(response.data.title);
            setVpnId(response.data.vpnId);
            setRouterId(response.data.routerId);
            setUserId(response.data.userId ? response.data.userId : 0);
            setDisabled(response.data.disabled);
            getRouters();
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
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setVpnId(response.data.vpnId);
            setRouterId(response.data.routerId);
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

    const openDownloadDialog = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/vpn", {
            params: {
                id: id,
            },
        }).then((response) => {
            setId(response.data.id);
            setName(response.data.name);
            setPassword(response.data.password);
            setProfile(response.data.profile);
            setService(response.data.service);
            setRemoteAddress(response.data.remoteAddress);
            setTitle(response.data.title);
            setVpnId(response.data.vpnId);
            setRouterId(response.data.routerId);
            setUserId(response.data.userId ? response.data.userId : 0);
            setDisabled(response.data.disabled);
            getRouters();
            getUsers();
            setDialogDownloadActive(true);
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

    const sortTable = (column: keyof VpnFields, asc: boolean) => {
        const sorted = [...rows];
        sorted.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setRows(sorted);
    };

    const getRouters = () => {
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {}).then((response) => {
            setRouters(response.data.filter((router: any) => {
                return router.disabled === 0;
            }))
        }).catch((error) => {
            if (error.response && error.response.data) {
                // dispatch(setAppError(error.response.data));
            } else {
                // dispatch(setAppError(error.message));
            }
        }).finally(() => {
        })
    }

    const getRouter = (id: number) => {
        dispatch(setAppLoading(true));
        axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
            params: {id: Number(id)}
        }).then((response) => {
            setPools(response.data.pools);
            setProfiles(response.data.profiles);
            setSelectedPool(response.data.pools[profile]);
            setProfile(response.data.router.defaultProfile);
            setRouterRemoteAddr(response.data.router.remoteAddress);
            setRouterL2tpKey(response.data.router.l2tpKey);
            setRouterPrefix(response.data.router.prefix);
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

    const autofill = () => {
        if (routerId === 0) {
            dispatch(setAppError('Router field required'));
            return;
        }

        if (userId === 0) {
            dispatch(setAppError('User field required'));
            return;
        }

        const user = users.find(user => Number(user.id) === userId);
        if (user) {
            const prefix = routerPrefix.length > 0 ? `${routerPrefix}_` : '';
            setName(`${prefix}${translit(user.surname.toLowerCase())}`);

            const remoteAddress = selectedPool ? selectedPool[0] : ''
            setRemoteAddress(remoteAddress)

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

    const download = async () => {
        dispatch(setAppLoading(true));
        try {
            if (rdpAddress.length < 7) {
                dispatch(setAppError('RDP Address required'));
                return;
            }

            if (rdpUsername.length < 5) {
                dispatch(setAppError('RDP Username required'));
                return;
            }

            const routerResponse = await axios.get(import.meta.env.VITE_BASE_URL + "/db/router", {
                params: { id: routerId },
            });
            const userResponse = await axios.get(import.meta.env.VITE_BASE_URL + "/db/user", {
                params: { id: userId },
            });

            const zip = new JSZip();

            const router = routerResponse.data.router;
            const certificate = router.certificate;
            const certificateFileName = 'certificate.sstp.crt';
            const certificateFile = convertToFile(certificate, certificateFileName);
            zip.file(certificateFileName, certificateFile);

            const localAddressParts = router.localAddress.split('.');
            const subnet = `${localAddressParts[0]}.${localAddressParts[1]}.${localAddressParts[2]}.0`;

            const codeCmd = `@echo off
setlocal
set "certFile=%~dp0${certificateFileName}"
            
:: Check if script is running with elevated privileges
reg query "HKU\\S-1-5-19\\Environment" >nul 2>&1
if not %errorlevel% EQU 0 (
    echo Running without elevated privileges. Restarting with elevated privileges.
    powershell.exe -windowstyle hidden -command "Start-Process '%~dpnx0' -ArgumentList '%certFile%' -Verb RunAs"
    exit /b
)
            
:: Proceed with the commands if running with elevated privileges
echo Running with elevated privileges. Proceeding with the commands.
            
:: add cert to root store
certutil -addstore Root "%certFile%"
::add route to network
route -p add ${subnet} mask 255.255.255.0 int_adress`;
            zip.file("add_cert_and_route.cmd", codeCmd);

            const user = userResponse.data;
            const doc = new JsPDF({
                format: 'a4',
                unit: 'px',
            });
            doc.addFont(robotoNormalFont, 'Roboto', 'normal');
            doc.addFont(robotoBoldFont, 'Roboto', 'bold');
            doc.setFont('Roboto');
            doc.setFontSize(20);
            doc.text('Карточка сотрудника', 10, 30);
            doc.setFontSize(12);
            const data = [
                ['Фамилия', user.surname],
                ['Имя', user.name],
                ['Отчество', user.patronymic],
                ['Должность', user.title],
                ['Рабочее место', user.workplace],
                ['Внутренний номер', user.phone],
                ['Почтовый логин', user.mails[0]?.email || ''],
                ['Почтовый пароль', user.mails[0]?.password || ''],
                ['Системный логин', user.login],
                ['Системный пароль', user.password],
                ['Почтовый клиент', 'https://mail.yandex.ru'],
                ['Корпоративный мессенджер', 'Spark'],
                ['Руководство пользователя', 'http://info'],
            ];
            data.forEach((row, i) => {
                doc.text(row[0], 10, 60 + 20 * i);
                doc.text(row[1], 150, 60 + 20 * i);
                doc.line(10, 64 + 20 * i, 400, 64 + 20 * i);
            });
            zip.file(`${user.surname} ${user.name} ${user.patronymic}.pdf`, doc.output('blob'));

            const codeRdp = `screen mode id:i:2
use multimon:i:1
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
full address:s:${rdpAddress}
username:s:${rdpUsername}`;
            zip.file("ts-aup.atech.loc.rdp", codeRdp);

            const vpnResponse = await fetch(vpnConnectionGuidePath);
            const vpnBlob = await vpnResponse.blob();
            zip.file("vpn_connection_guide.pdf", vpnBlob);

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, "archive.zip");
        } catch (error: any) {
            const errorMessage = error.response?.data || error.message;
            dispatch(setAppError(errorMessage));
        } finally {
            dispatch(setAppLoading(false));
        }
    };

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('vpnsTitle'));
        getAll();
        getRouters();
        getUsers();
    }, [location.search]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        const filterParams: any = {};
        for (const [key, value] of queryParams.entries()) {
            filterParams[key] = value || '';
        }

        setFilter(filterParams);
    }, [location.search, routers]);

    useEffect(() => {
        if (routerId > 0) {
            getRouter(routerId);
        } else {
            setProfiles([]);
            setProfile('NULL');
            setRouterRemoteAddr('');
            setRouterL2tpKey('');
        }
    }, [routerId]);

    useEffect(() => {
        setSelectedPool(pools[profile]);
    }, [profile]);

    return (
        <>
            <div className={'table'}>
                <table className={'header'}>
                    <thead>
                    <tr>
                        <th className={'action'}>
                            <div className={'action-buttons'} style={{width:'120px'}}>
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
                                <div className={'action-buttons'} style={{width:'120px'}}>
                                    <button
                                        onClick={() => openDownloadDialog(row.id)}
                                        children={<IconDownload/>}
                                    />
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
                title={t('vpnsCreateTitle')}
                close={() => setDialogCreateActive(false)}
                children={<>
                    <FieldInputString
                        title={t('vpnsCreateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('vpnsCreateFieldPassword')}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <div className='Field'>
                        <div className='title'>
                            <p>{t('vpnsCreateFieldInternalAddress')}</p>
                        </div>
                        <div className='field'>
                            <input
                                type='search'
                                value={remoteAddress}
                                onChange={(e) => setRemoteAddress(e.target.value)}
                                list='remote-options'
                                placeholder='Enter text'
                                style={{height: '100%'}}
                            />
                            <datalist id='remote-options'>
                                {selectedPool && selectedPool.map((addr: string, i: number) => (
                                    <option key={i} value={addr}>
                                        {addr}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <FieldInputString
                        title={t('vpnsCreateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={t('vpnsCreateFieldRouter')}
                        value={routerId}
                        nullable={true}
                        setValue={setRouterId}
                        variants={routers.map((router) => {
                            return {
                                value: Number(router.id),
                                text: router.name
                            }
                        })}
                    />
                    <FieldValueString
                        title={t('vpnsCreateFieldExternalAddress')}
                        value={routerRemoteAddr}
                    />
                    <FieldValueString
                        title={t('vpnsCreateFieldL2tpKey')}
                        value={routerL2tpKey}
                    />
                    <FieldInputSelectOne
                        title={t('vpnsCreateFieldUser')}
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
                    <FieldInputBoolean
                        title={"Disabled"}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogCreateActive(false), text: t('vpnsCreateButtonCancel')},
                    {action: () => autofill(), text: t('vpnsCreateButtonAutofill')},
                    {action: () => create(), text: t('vpnsCreateButtonCreate')},
                ]}
            />}
            {dialogUpdateActive && <Dialog
                title={t('vpnsUpdateTitle')}
                close={() => setDialogUpdateActive(false)}
                children={<>
                    <FieldValueString
                        title={t('vpnsUpdateFieldID')}
                        value={id.toString()}
                    />
                    <FieldInputString
                        title={t('vpnsUpdateFieldName')}
                        placeholder={"Enter text"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FieldInputString
                        title={t('vpnsUpdateFieldPassword')}
                        placeholder={"Enter text"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <FieldGenerator
                        type={PasswordType.Normal}
                        length={10}
                    />
                    <div className='Field'>
                        <div className='title'>
                            <p>{t('vpnsUpdateFieldInternalAddress')}</p>
                        </div>
                        <div className='field'>
                            <input
                                type='search'
                                value={remoteAddress}
                                onChange={(e) => setRemoteAddress(e.target.value)}
                                list='remote-options'
                                placeholder='Enter text'
                                style={{height: '100%'}}
                            />
                            <datalist id='remote-options'>
                                {selectedPool && selectedPool.map((addr: string, i: number) => (
                                    <option key={i} value={addr}>
                                        {addr}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <FieldInputString
                        title={t('vpnsUpdateFieldTitle')}
                        placeholder={"Enter text"}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <FieldInputSelectOne
                        title={t('vpnsUpdateFieldRouter')}
                        value={routerId}
                        setValue={setRouterId}
                        variants={routers.map((router) => {
                            return {
                                value: Number(router.id),
                                text: router.name
                            }
                        })}
                    />
                    <FieldValueString
                        title={t('vpnsUpdateFieldExternalAddress')}
                        value={routerRemoteAddr}
                    />
                    <FieldValueString
                        title={t('vpnsUpdateFieldL2tpKey')}
                        value={routerL2tpKey}
                    />
                    <FieldInputSelectOne
                        title={t('vpnsUpdateFieldUser')}
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
                    <FieldInputBoolean
                        title={t('vpnsUpdateFieldDisabled')}
                        value={disabled}
                        setTrue={() => setDisabled(true)}
                        setFalse={() => setDisabled(false)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogUpdateActive(false), text: t('vpnsUpdateButtonCancel')},
                    {action: () => update(), text: t('vpnsUpdateButtonUpdate')},
                ]}
            />}
            {dialogDeleteActive && <Dialog
                title={t('vpnsDeleteTitle')}
                close={() => setDialogDeleteActive(false)}
                children={<>
                    <p>{t('vpnsDeleteText')} "{name}" (ID: {id}; RouterID: {routerId})?</p>
                </>}
                buttons={[
                    {action: () => setDialogDeleteActive(false), text: t('vpnsDeleteButtonCancel')},
                    {action: () => remove(), text: t('vpnsDeleteButtonDelete')},
                ]}
            />}
            {dialogFilterActive && <Dialog
                title={t('vpnsFilterTitle')}
                close={() => setDialogFilterActive(false)}
                children={<>
                    <FieldInputDateRange
                        title={t('vpnsFilterFieldCreated')}
                        valueGte={filter.createdGte}
                        valueLte={filter.createdLte}
                        setGte={(e) => setFilter({...filter, createdGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, createdLte: e.target.value})}
                    />
                    <FieldInputDateRange
                        title={t('vpnsFilterFieldUpdated')}
                        valueGte={filter.updatedGte}
                        valueLte={filter.updatedLte}
                        setGte={(e) => setFilter({...filter, updatedGte: e.target.value})}
                        setLte={(e) => setFilter({...filter, updatedLte: e.target.value})}
                    />
                    <FieldInputString
                        title={t('vpnsFilterFieldName')}
                        placeholder={'Enter text'}
                        value={filter.name}
                        onChange={(e) => setFilter({...filter, name: e.target.value})}
                    />
                    <FieldInputString
                        title={t('vpnsFilterFieldPassword')}
                        placeholder={'Enter text'}
                        value={filter.password}
                        onChange={(e) => setFilter({...filter, password: e.target.value})}
                    />
                    <FieldInputString
                        title={t('vpnsFilterFieldInternalAddress')}
                        placeholder={'Enter text'}
                        value={filter.remoteAddress}
                        onChange={(e) => setFilter({...filter, remoteAddress: e.target.value})}
                    />
                    <FieldInputString
                        title={t('vpnsFilterFieldTitle')}
                        placeholder={'Enter text'}
                        value={filter.title}
                        onChange={(e) => setFilter({...filter, title: e.target.value})}
                    />
                    <FieldInputBooleanNullable
                        title={t('vpnsFilterFieldDisabled')}
                        value={filter.disabled}
                        setNull={() => setFilter({...filter, disabled: 0})}
                        setTrue={() => setFilter({...filter, disabled: 'true'})}
                        setFalse={() => setFilter({...filter, disabled: 'false'})}
                    />
                    <FieldInputSelectMany
                        title={t('vpnsFilterFieldRouters')}
                        value={filter.routerId || []}
                        setValue={(ids: number[]) => setFilter({...filter, routerId: ids})}
                        variants={routers.map((router: RouterFields) => {
                            return {
                                value: Number(router.id),
                                text: `[ID:${router.id}] ${router.name}`
                            };
                        })}
                    />
                    <FieldInputSelectMany
                        title={t('vpnsFilterFieldUsers')}
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
                    {action: () => setDialogFilterActive(false), text: t('vpnsFilterButtonClose')},
                    {action: () => setQuery(), text: t('vpnsFilterButtonConfirm')},
                ]}
            />}
            {dialogDownloadActive && <Dialog
                title={t('vpnsDownloadTitle')}
                close={() => setDialogDownloadActive(false)}
                children={<>
                    <FieldInputString
                        title={t('vpnsDownloadFieldRdpAddress')}
                        placeholder={"Enter text"}
                        value={rdpAddress}
                        onChange={(e) => setRdpAddress(e.target.value)}
                    />
                    <FieldInputString
                        title={t('vpnsDownloadFieldRdpUsername')}
                        placeholder={"Enter text"}
                        value={rdpUsername}
                        onChange={(e) => setRdpUsername(e.target.value)}
                    />
                </>}
                buttons={[
                    {action: () => setDialogDownloadActive(false), text: t('vpnsDownloadButtonClose')},
                    {action: download, text: t('vpnsDownloadButtonDownload')},
                ]}
            />}
        </>
    )
}

export default PageVpns
