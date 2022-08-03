import React, { useState, useEffect, useCallback } from 'react';
import { debounceInput } from '../utils/utils';

const SearchBar = ({placeholder, search: searchFn, setResults, onSearchChange, value:initial}) => {
    const [ search, setSearch ] = useState('');
    const [ value, setValue ] = useState(initial ? initial : '');
    
    const debounceSearch = useCallback(
        debounceInput(async (val) => setSearch(val)),
        [setSearch, debounceInput]
    );

    useEffect(() => {
        debounceSearch(value)
    }, [value, debounceSearch]);

    useEffect(() => {
        if(onSearchChange) onSearchChange(search);
        searchFn(search, setResults);
    }, [search, setResults, searchFn, onSearchChange]);

    return(
        <section className="search">
            <input type="text" placeholder={placeholder} onChange={(ev) => setValue(ev.target.value)} value={value} />
        </section>
    )
}

export default SearchBar;