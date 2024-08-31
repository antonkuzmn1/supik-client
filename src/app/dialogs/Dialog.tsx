import './Dialog.scss';
import React from "react";
import IconClose from "../icons/IconClose.tsx";

export interface DialogProps {
    title: string,
    close: () => void,
    children: React.ReactNode,
    buttons: { action: () => void, text: string }[],
}

const Dialog: React.FC<DialogProps> = (props: DialogProps) => {
    return (
        <div className={'Dialog'} onClick={props.close}>
            <div className={'container'} onClick={(event) => event.stopPropagation()}>
                <div className={'header'}>
                    <h1>{props.title}</h1>
                    <button
                        onClick={props.close}
                        children={<IconClose/>}
                    />
                </div>
                <div className={'content'}>
                    {props.children}
                </div>
                <div className={'action'}>
                    {props.buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.action}
                            children={button.text}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
export default Dialog;
