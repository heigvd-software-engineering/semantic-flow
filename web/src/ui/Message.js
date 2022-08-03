import React from 'react';

const Message = ({ type, title, content }) => {
    return (
        <section className={`message ${type ? type : 'info'}`}>
            {title && (<section className='message-header'>
                <section className='message-type info'>Info</section> 
                <section className='message-type warning'>Warning</section> 
                <section className='message-type error'>Error</section> 
                <section className='message-title'>{title}</section>
            </section>)}
            <section className='message-body'>{content}</section>
        </section>
    )
}

export default Message;