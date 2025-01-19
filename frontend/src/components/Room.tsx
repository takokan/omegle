import { useEffect } from "react";
import { useSearchParams } from "react-router"

export const Room = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get('name');

    useEffect(() => {

    }, [name]);
    return <div>
        Room Page, hi {name}.
    </div>
}