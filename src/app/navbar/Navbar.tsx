import './Navbar.scss';
import React, {useEffect, useState} from "react";
import IconMenu from "../../assets/icons/IconMenu.tsx";
import {RoutePageInterface} from "../App.tsx";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setAppTitle} from "../../slices/appSlice.ts";
import {RootState} from "../../utils/store.ts";

export interface NavbarProps {
    routePages: RoutePageInterface[]
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const pageTitle = useSelector((state: RootState) => state.app.title);
    const accountFullname = useSelector((state: RootState) => state.account.fullname);

    const [dropdownIsActive, setDropdownIsActive] = useState(false);
    const [displayedTitle, setDisplayedTitle] = useState<string>('');

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDropdownIsActive(prevState => !prevState);
    }

    const changePage = (page: RoutePageInterface) => {
        navigate(page.path);
        dispatch(setAppTitle(page.title));
        setDropdownIsActive(false);
    }

    useEffect(() => {
        const handleClickOutside = (_event: MouseEvent) => {
            if (dropdownIsActive) {
                setDropdownIsActive(false);
            }
        }

        window.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("click", handleClickOutside);
        }
    }, [dropdownIsActive]);

    useEffect(() => {
        setDisplayedTitle(pageTitle === "" ? accountFullname : pageTitle);
    }, [pageTitle]);

    return (
        <div
            className='Navbar'
            onClick={(event) => event.stopPropagation()}
        >
            <div className='menu'>
                <button
                    onClick={toggleDropdown}
                    children={<IconMenu/>}
                />
            </div>
            <div className='title'>
                <p>{displayedTitle}</p>
            </div>
            {dropdownIsActive &&
                <div className='dropdown'>
                    {props.routePages.map((page, index) => (
                        <button
                            key={index}
                            onClick={() => changePage(page)}
                        >
                            <div className={'icon'}>{page.icon}</div>
                            <p className={'text'}>{page.title === "" ? accountFullname : page.title}</p>
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}

export default Navbar
