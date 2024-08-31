import './Page.scss';
import React from "react";
import Navbar from "../navbar/Navbar.tsx";
import {routePages} from "../App.tsx";

export interface ContentProps {
    element: any;
}

const Page: React.FC<ContentProps> = (props: ContentProps) => {

    return (
        <>
            <Navbar routePages={routePages}/>
            <div className={'Page'}>{props.element}</div>
        </>
    )
}

export default Page
