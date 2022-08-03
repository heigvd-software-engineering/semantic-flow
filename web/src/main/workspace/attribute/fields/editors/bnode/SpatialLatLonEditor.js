import React, {useCallback, useEffect, useState} from "react";
import BnodeInput from "../../../../../../ui/BnodeInput";

const nextStatus = (current) => {
    // decide the next bnode status based on current data
    let latitude = current.latitude.object;
    let longitude = current.longitude.object;
    if((latitude === '' || longitude === '')){
        return 'deleted'; // delete condition
    }else{
        return 'updated';
    }
}

const SpatialLatLon = ({bnode: {current}, index, onChange}) => {

    const [data, setData] = useState(undefined); 

    useEffect(() => {
        if(!data && current.data.latitude && current.data.longitude){
            setData({
                status: 'initial',
                latitude: current.data.latitude.object,
                longitude: current.data.longitude.object
            });
        }
    }, [current, data, setData]);

    useEffect(() => {
        
        if(current && data && data.status === 'changed'){
            // reacting on data changes to update bnode data based on local "data" status
            setData({
                ...data,
                status: 'initial' // preventing the infinite update loop
            })
            current.data.latitude.object = data.latitude;
            current.data.longitude.object = data.longitude;
            // notify the parent component with current data and the status about the field and bnode
            onChange(nextStatus(current.data));
        }

    }, [data, current, onChange, index])

    const onCoordinateChange = useCallback((coordinate) => {
        setData({
            ...data,
            status: 'changed',
            ...coordinate
        });
    }, [data, setData]);

    return (
        <>
        {
            current && data && (
            <SpatialLatLonInput 
                        data={data}
                        onCoordinateChange={onCoordinateChange}
                    />
            )
        }</>
    )
}

const SpatialLatLonInput = ({data, onCoordinateChange}) => {
    const [latitude, setLat] = useState(data.latitude);
    const [longitude, setLon] = useState(data.longitude);
    return(
        <>
        {
            data && (
                <section className="spatial-lat-lon-value">
                    <CoordinateUnit 
                        name="lat"
                        label="Lat"
                        value={latitude}
                        onChange={(_, value) => {
                            setLat(value);
                            onCoordinateChange({latitude: value, longitude: longitude});
                        }}
                    />
                    <CoordinateUnit
                        name="lon"
                        label="Lon"
                        value={longitude}
                        onChange={(_, value) => {
                            setLon(value);
                            onCoordinateChange({latitude: latitude, longitude: value});
                        }}
                    />
                </section>)
        }
        </>
    )
}

const CoordinateUnit = ({name, label, value, onChange}) => {
    return (
        <BnodeInput
            name={name}
            label={label}
            placeholder="0.0"
            value={value}
            onChange={onChange}
        />
    )
}

export default SpatialLatLon;