import './Field.scss';
import React, {useState} from "react";

export enum PasswordType {
    // noinspection SpellCheckingInspection
    PIN = "0123456789",
    Normal = "ABCDEFGHKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789",
    Strong = "ABCDEFGHKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!№;%:?*()_+=",
}

export interface FieldGeneratorProps {
    type: PasswordType;
    length: number;
}

const FieldGenerator: React.FC<FieldGeneratorProps> = (props: FieldGeneratorProps) => {
    const [value, setValue] = useState<string>("");
    // const [copyButtonText, setCopyButtonText] = useState<string>("Copy");
    const [type, setType] = useState<PasswordType>(props.type);
    const [length, setLength] = useState<number>(props.length);

    const handler = (e: any) => {
        setValue(e.target.value);
    }

    const generate = () => {
        let password = "";
        let hasNumber = false;

        for (let i = 0; i < length; i++) {
            const char = type.charAt(Math.floor(Math.random() * type.length));
            password += char;

            if (!isNaN(parseInt(char))) {
                hasNumber = true;
            }
        }

        if (!hasNumber) {
            const randomIndex = Math.floor(Math.random() * length);
            const randomDigit = PasswordType.PIN.charAt(Math.floor(Math.random() * PasswordType.PIN.length));
            password = password.substring(0, randomIndex) + randomDigit + password.substring(randomIndex + 1);
        }

        setValue(password);
    };

    // const copy = () => {
    //     navigator.clipboard.writeText(value).then(() => {
    //         setCopyButtonText("Copied!");
    //         setTimeout(() => {
    //             setCopyButtonText("Copy");
    //         }, 1000);
    //     }).catch(() => {
    //         setCopyButtonText("Error!");
    //     });
    // }

    return (
        <div className='Field'>
            <div className='title'>
                <p>Generator</p>
            </div>
            <div className='field'>
                <input
                    className={'password-generator border-right'}
                    type={'text'}
                    placeholder={'Generate'}
                    value={value}
                    onChange={handler}
                />
                {/*<button*/}
                {/*    onClick={copy}*/}
                {/*    children={copyButtonText}*/}
                {/*/>*/}
                <button
                    className={'border-right'}
                    onClick={generate}
                    children={'Generate'}
                />
                <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    style={{width: '100px'}}
                >
                    <option value={PasswordType.PIN}>PIN</option>
                    <option value={PasswordType.Normal}>Normal</option>
                    <option value={PasswordType.Strong}>Strong</option>
                </select>
                <input
                    value={length}
                    onChange={(e: any) => setLength(e.target.value)}
                    type={'number'}
                    min={1}
                    max={36}
                    style={{width: '80px'}}
                />
            </div>
        </div>
    )
}

export default FieldGenerator
