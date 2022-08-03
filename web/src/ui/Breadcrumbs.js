import React from "react";

const Breadcrumbs = ({ min, crumbs, onClick }) => {
    return (
        <section className='breadcrumbs'>
            {crumbs && crumbs.length >= min && crumbs.map((c, i) => {
                return (
                    <section className='breadcrumb' key={i} onClick={() => onClick(c.value, i)}>
                        <section className='breadcrumb-title'>{c.label}</section>
                        <section className='breadcrumb-separator'>/</section>
                    </section>
                )
            }
            )}
        </section>
    )
}

export default Breadcrumbs;