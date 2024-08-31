import React, {useEffect, useState} from "react";
import axios from "axios";
import {baseUrl} from "../../../utils/baseUrl.ts";
import {useDispatch} from "react-redux";
import {setAppLoading, setAppTitle} from "../../../slices/appSlice.ts";
import {AccountFields} from "../page-account/PageAccount.tsx";
import IconSortAsc from "../../icons/IconSortAsc.tsx";
import IconSortDesc from "../../icons/IconSortDesc.tsx";
import IconTableCreate from "../../icons/IconTableCreate.tsx";
import IconTableFilter from "../../icons/IconTableFilter.tsx";
import IconTableEdit from "../../icons/IconTableEdit.tsx";
import IconTableDelete from "../../icons/IconTableDelete.tsx";

type TypeField = 'String' | 'Integer' | 'Boolean' | 'Date';

const defTableHeaders: { text: string, field: keyof AccountFields, width: string, type: TypeField }[] = [
    {text: 'Username', field: 'username', width: '150px', type: 'String'},
    {text: 'Admin', field: 'admin', width: '100px', type: 'Boolean'},
    {text: 'Full name', field: 'fullname', width: '300px', type: 'String'},
    {text: 'Title', field: 'title', width: '200px', type: 'String'},
    {text: 'Created At', field: 'created', width: '150px', type: 'Date'},
    {text: 'Updated At', field: 'updated', width: '150px', type: 'Date'},
]

const PageAccounts: React.FC = () => {
    const dispatch = useDispatch();

    const [accounts, setAccounts] = useState<AccountFields[]>([]);

    const getAccounts = () => {
        dispatch(setAppLoading(true));
        axios.get(baseUrl + "/security/account", {}).then((response) => {
            setAccounts(response.data)
        }).catch((error) => {
            console.log(error);
        }).finally(() => {
            dispatch(setAppLoading(false));
        })
    }

    const sortTable = (column: keyof AccountFields, asc: boolean) => {
        const sortedAccounts = [...accounts];
        sortedAccounts.sort((a, b): number => {
            ``
            if (a[column] > b[column]) return asc ? 1 : -1;
            if (a[column] < b[column]) return asc ? -1 : 1;
            return 0;
        });
        setAccounts(sortedAccounts);
    };

    useEffect(() => {
        dispatch(setAppTitle('Accounts'));
        getAccounts();
    }, []);

    useEffect(() => {
        console.log(accounts)
    }, [accounts]);

    return (
        <div className={'table'}>
            <table className={'header'}>
                <thead>
                <tr>
                    <th className={'action'}>
                        <div className={'action-buttons'}>
                            <button>
                                <IconTableFilter/>
                            </button>
                            <button>
                                <IconTableCreate/>
                            </button>
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
                {accounts.map((account, index) => (
                    <tr key={index}>
                        <td className={'action'}>
                            <div className={'action-buttons'}>
                                <button>
                                    <IconTableEdit/>
                                </button>
                                <button>
                                    <IconTableDelete/>
                                </button>
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
                                    account[defTableHeader.field]
                                )}
                                {defTableHeader.type === 'Integer' && (
                                    Number(account[defTableHeader.field])
                                )}
                                {defTableHeader.type === 'Boolean' && (
                                    account[defTableHeader.field] ? 'True' : 'False'
                                )}
                                {defTableHeader.type === 'Date' && (
                                    new Date(account[defTableHeader.field]).toDateString()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

export default PageAccounts
