import React, {useEffect} from "react";
import {setAppTitle} from "../../slices/appSlice.ts";
import {useDispatch} from "react-redux";
import {useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {RoutePageInterface, routePages} from "../App.tsx";
import FieldValueString from "../fields/FieldValueString.tsx";
import {version} from "../../../package.json";

const PageSettings: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const {t} = useTranslation();

    const changePage = (page: RoutePageInterface) => {
        navigate(page.path);
        dispatch(setAppTitle(page.title));
    }

    useEffect(() => {
        dispatch(setAppTitle('settingsTitle'));
    }, [location.search]);

    return (
        <div className={'settings'}>
            <FieldValueString
                title={t('navbarVersion')}
                value={version}
            />
            {routePages.filter(page => page.settings).map((page: RoutePageInterface) => {
                return (
                    <div className={'button'}>
                        <button
                            onClick={() => changePage(page)}
                        >
                            <div className={'icon'}>
                                {page.icon}
                            </div>
                            {t(page.title)}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default PageSettings
