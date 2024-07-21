import React, { useEffect, useState } from 'react';
import './Quote.css';

const Quote = () => {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [name, setName] = useState('');
    const [msg, setMsg] = useState('');
    const [sMessage, setSMessage] = useState('');

    useEffect(() => {
        const fetchMsg = async () => {
            const response = await fetch('https://backend-eta-lyart.vercel.app/getmsg', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch profile');
                return;
            }

            const data = await response.json();
            setQuote(data.msg);
            setAuthor(data.name);
        };

        fetchMsg();
    }, []);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await uploadmsg();
    };

    const uploadmsg = async () => {
        try {
            const response = await fetch('https://backend-eta-lyart.vercel.app/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name, msg: msg })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Message added successfully', data);

            setSMessage('Message Added Successfully');
            setName(''); // Reset name field
            setMsg(''); // Reset message field
        } catch (error) {
            console.error('Failed to fetch', error);
        }
    };

    useEffect(() => {
        console.log('Success message:', sMessage);
    }, [sMessage]);

    return (
        <div>
            <div className='maincont'>
                <h1 className='quote'>{quote}</h1>
                <h1 className='author'>-{author}</h1>
            </div>
            <div className='addcont'>
                <h1 className='addmsg'>Add Your Message: </h1>
                <form onSubmit={handleFormSubmit}>
                    <input className='msginp' value={msg} onChange={(e) => setMsg(e.target.value)}></input><br></br>
                    <h1 className='namemsg'>Your Name: </h1>
                    <input className='nameinp' value={name} onChange={(e) => setName(e.target.value)}></input><br></br>
                    {sMessage && <p className='smsg'>{sMessage}</p>}
                    <button type='submit' className='submitbtn'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default Quote;
