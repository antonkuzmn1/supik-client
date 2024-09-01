import './Field.scss';
import React, { useState, useEffect } from "react";

export interface FieldInputFileProps {
    title: string,
    placeholder: string,
    value: File | null,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

const FieldInputFile: React.FC<FieldInputFileProps> = (props: FieldInputFileProps) => {
    const [fileURL, setFileURL] = useState<string | null>(null);

    useEffect(() => {
        if (props.value) {
            const url = URL.createObjectURL(props.value);
            setFileURL(url);

            return () => {
                if (url) URL.revokeObjectURL(url);
            };
        }
    }, [props.value]);

    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    type="file"
                    accept=".crt"
                    placeholder={props.placeholder}
                    onChange={props.onChange}
                />
                {props.value && (
                    <div style={{display: 'flex'}}>
                        <p className="file-name">{props.value.name}</p>
                        {fileURL && (
                            <a href={fileURL} download={props.value.name}>
                                <button className="download-button">Download</button>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FieldInputFile;
