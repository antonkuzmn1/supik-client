import './NotSupported.scss';
import React from "react";
import {useTranslation} from "react-i18next";

const NotSupported: React.FC = () => {
    const {t} = useTranslation();

    return (
        <div className='NotSupported'>
            {t('notSupportedMain')} :(
        </div>
    )
}
export default NotSupported
