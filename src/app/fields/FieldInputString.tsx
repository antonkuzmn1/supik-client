import './Field.scss';
import React, {useState} from "react";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import InputMask from "react-input-mask";

export interface FieldInputStringProps {
    title: string,
    placeholder: string,
    password?: boolean,
    value: string,
    onChange: (e: any) => void,
    mask?: string,
    other?: any,
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
                {props.mask ? (
                    <InputMask
                        mask={props.mask}
                        value={props.value || ''}
                        onChange={props.onChange}
                        placeholder={props.placeholder}
                        {...props.other}
                    />
                ) : (
                    <input
                        type={props.password
                            ? show ? 'text' : 'password'
                            : 'text'}
                        placeholder={props.placeholder}
                        value={props.value || ''}
                        onChange={props.onChange}
                        {...props.other}
                    />
                )}
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
