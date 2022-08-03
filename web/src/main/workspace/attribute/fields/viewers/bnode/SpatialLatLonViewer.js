import React, { useEffect, useState} from "react";

const latToDegrees = (lat) => {
    const latDegrees = Math.floor(lat);
    const latMinutes = Math.floor((lat - latDegrees) * 60);
    const latSeconds = Math.floor(((lat - latDegrees) * 60 - latMinutes) * 60);
    return `${latDegrees}° ${latMinutes}' ${latSeconds}"`;
}

const lonToDegrees = (lon) => {
    const lonDegrees = Math.floor(lon);
    const lonMinutes = Math.floor((lon - lonDegrees) * 60);
    const lonSeconds = Math.floor(((lon - lonDegrees) * 60 - lonMinutes) * 60);
    return `${lonDegrees}° ${lonMinutes}' ${lonSeconds}"`;
}


const SpatialLatLonViewer = ({bnode}) => {
    const [coordinates, setCoordinates] = useState(undefined);

    useEffect(() => {
        if(bnode.data.latitude && bnode.data.longitude){
            setCoordinates({
                latitude: bnode.data.latitude.object,
                longitude: bnode.data.longitude.object
            });
        }
    }, [bnode]);
    return (
        <>
        {
            coordinates && (
                <section className="spatial-lat-lon-value">
                    <section className="spatial-value">
                        <section className="label">Latitude</section>
                        <section className="degrees">
                            {latToDegrees(coordinates.latitude)}
                            <section className="raw">
                                {coordinates.latitude}
                            </section>
                        </section>
                        
                    </section>
                    <section className="spatial-value">
                        <section className="label">Longitude</section>
                        <section className="degrees">
                            {lonToDegrees(coordinates.longitude)}
                            <section className="raw">
                                {coordinates.longitude}
                            </section>
                        </section>
                        
                    </section>    
                </section>
            )
        }</>
    )
}


export default SpatialLatLonViewer;