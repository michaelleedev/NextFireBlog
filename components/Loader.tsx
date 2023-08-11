import React from 'react'

interface Show {
    show: boolean,
}

export default function Loader(props: Show) {
    return props.show ? <div className="loader"></div> : null;
}
