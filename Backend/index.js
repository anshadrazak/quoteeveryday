const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');

const uri = "mongodb+srv://anshadrazakk:Asdrzkknt%40123@cluster0.qyxtmlr.mongodb.net/cluster0?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
async function connectToDb() {
    if (!client.topology || !client.topology.isConnected()) {
        await client.connect();
    }
}

// Daily quote cleanup task
cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
    try {
        await connectToDb();
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        await client.db('New').collection('Messages').deleteMany({ date: { $ne: today } });
        console.log('Old messages cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up old messages:', error.message);
    }
});

app.post('/upload', async (req, res) => {
    try {
        const { name, msg } = req.body;
        const date = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        await connectToDb();
        await client.db('New').collection('Messages').insertOne({ name, msg, date });
        res.status(200).json({ message: 'Message added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getmsg', async (req, res) => {
    try {
        await connectToDb();
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        const dailyQuote = await client.db('New').collection('DailyQuote').findOne({ date: today });

        if (dailyQuote) {
            // If a quote is already set for today, return it
            res.json({ name: dailyQuote.name, msg: dailyQuote.msg });
        } else {
            // Otherwise, select a new quote
            const count = await client.db('New').collection('Messages').countDocuments({ date: today });
            if (count === 0) {
                return res.status(404).json({ message: 'No messages found for today' });
            }
            const randomnumber = Math.floor(Math.random() * count);
            const user = await client.db('New').collection('Messages').find({ date: today }).limit(1).skip(randomnumber).toArray();

            // Store the new quote for today
            await client.db('New').collection('DailyQuote').updateOne(
                { date: today },
                { $set: { name: user[0].name, msg: user[0].msg, date: today } },
                { upsert: true }
            );

            res.json({ name: user[0].name, msg: user[0].msg });
        }
    } catch (error) {
        console.error('Error at /getmsg:', error.message);
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
