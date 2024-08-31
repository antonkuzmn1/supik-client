import './Navbar.scss';
import React, {useEffect, useState} from "react";
import IconMenu from "../../assets/icons/IconMenu.tsx";
import {RoutePageInterface} from "../App.tsx";
import {useNavigate} from "react-router-dom";

export interface NavbarProps {
    routePages: RoutePageInterface[]
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
    const navigate = useNavigate();
    const [dropdownIsActive, setDropdownIsActive] = useState(false);

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDropdownIsActive(prevState => !prevState);
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
                <p>Серебрянников Владимир Николаевич</p>
            </div>
            {dropdownIsActive &&
                <div className='dropdown'>
                    {props.routePages.map((page, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(page.path)}
                        >
                            <div className={'icon'}>{page.icon}</div>
                            <p className={'text'}>{page.title}</p>
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}

export default Navbar
