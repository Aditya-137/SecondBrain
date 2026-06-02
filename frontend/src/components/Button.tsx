import { ReactElement } from "react";

interface ButtonProps {
    title : string,
    startIcon? : ReactElement,
    endIcon? : ReactElement,
    onClick : () => void,
    size : "sm" | "md" | "lg",
    variant : "primary" | "secondary"
}

const sizeStyle = {
    "sm" : "",
    "md" : "",
    "lg" : ""
}

const variantStyle = {
    "primary" : "",
    "secondary" : ""
}

export default function Button (props : ButtonProps){
    <button>
        {props.title}
    </button>
}