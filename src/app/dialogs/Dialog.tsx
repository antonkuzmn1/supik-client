import './Dialog.scss';
import React, {useEffect, useState} from "react";
import IconClose from "../icons/IconClose.tsx";

export interface DialogProps {
    title: string;
    close: () => void;
    children: React.ReactNode;
    buttons: { action: () => void; text: string }[];
}

const Dialog: React.FC<DialogProps> = (props: DialogProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: React.MouseEvent) => {
        setIsDragging(true);
        setStartPosition({ x: event.clientX - position.x, y: event.clientY - position.y });
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
            setPosition({ x: event.clientX - startPosition.x, y: event.clientY - startPosition.y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const onkeypressHandler = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
        } else if (event.key === 'Escape') {
            props.close();
        }
    }

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        window.addEventListener('keydown', onkeypressHandler);

        return () => {
            window.removeEventListener('keydown', onkeypressHandler);
        }
    })

    return (
        <div
            className={'Dialog'}
            onClick={props.close}
        >
            <div
                className={'container'}
                onClick={(event) => event.stopPropagation()}
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            >
                <div className={'header'} onMouseDown={handleMouseDown} style={{ cursor: 'move' }}>
                    <h1>{props.title}</h1>
                    <button
                        onClick={props.close}
                        children={<IconClose />}
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
    );
}

export default Dialog;
