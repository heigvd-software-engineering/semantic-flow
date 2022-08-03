import React from 'react';

const SearchResults = ({label, click, results, renderResult}) => {
    return(
        <section className="search-results">
        { results && results.length > 0 && 
            <>
                <section className='label'>{results.length} {label} </section>
                <ul> {
                    results.map((result, index) => renderResult(result, index, click))}
                </ul>
            </>
        }
        </section>
    )
}

export default SearchResults;