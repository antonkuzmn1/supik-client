import './Field.scss';
import React, {useState} from "react";
import classNames from "classnames";
import {useTranslation} from "react-i18next";

export interface FieldInputStringProps {
    title: string,
    placeholder: string,
    password?: boolean,
    value: string,
    onChange: (e: any) => void,
}

const FieldInputString: React.FC<FieldInputStringProps> = (props: FieldInputStringProps) => {
    const [show, setShow] = useState<boolean>(false)

    const {t} = useTranslation();

    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    type={props.password
                        ? show ? 'text' : 'password'
                        : 'text'}
                    placeholder={props.placeholder}
                    value={props.value || ''}
                    onChange={props.onChange}
                />
                {props.password && <button
                    className={classNames({'active': show})}
                    onClick={() => {setShow(!show)}}
                    children={t('fieldInputStringShow')}
                />}
            </div>
        </div>
    )
}

export default FieldInputString
