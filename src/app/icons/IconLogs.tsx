import './Icon.scss';
import React from "react";

const IconLogs: React.FC = () => {

    return (
        <div className='Icon'>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px">
                <path
                    d="M480-144q-140 0-238-98t-98-238h72q0 109 77.5 186.5T480-216q109 0 186.5-77.5T744-480q0-109-77.5-186.5T480-744q-62 0-114.55 25.6Q312.91-692.8 277-648h107v72H144v-240h72v130q46-60 114.5-95T480-816q70 0 131.13 26.6 61.14 26.6 106.4 71.87 45.27 45.26 71.87 106.4Q816-550 816-480t-26.6 131.13q-26.6 61.14-71.87 106.4-45.26 45.27-106.4 71.87Q550-144 480-144Zm100-200L444-480v-192h72v162l115 115-51 51Z"/>
            </svg>
        </div>
    )
}

export default IconLogs