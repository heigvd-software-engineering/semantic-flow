import React, { useState } from 'react';
import SearchResults from '../../ui/SearchResults';
import SearchBar from '../../ui/SearchBar';
import URI from '../../common/URI';

const renderResultElement = (result, index, click) => 
    <li key={index} onClick={() => click(result)}>
        <URI value={result.o.value} applyPrefix={true} />
    </li>

const SearchIndividuals = ({click, search: searchFn}) => {
    
    const [ results, setResults ] = useState([]); 

    return(
        <section className="find">
                <SearchBar 
                    placeholder="Search for individuals"
                    setResults={setResults}
                    search={searchFn}
                />
                <SearchResults 
                    label="individuals"
                    click={click}
                    results={results}
                    renderResult={renderResultElement}  />
        </section>
    )
}

export default SearchIndividuals;