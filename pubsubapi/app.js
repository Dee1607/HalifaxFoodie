const express = require('express');

const app = express();
const { PubSub } = require('@google-cloud/pubsub');
const bodyParser = require('body-parser');
const subscribeadm = 'projects/oceanic-spot-321315/subscriptions/admin-sub';
const topicusr = 'projects/oceanic-spot-321315/topics/user';
const subscribeusr = 'projects/oceanic-spot-321315/subscriptions/user-sub';
const pubSubClient = new PubSub('oceanic-spot-321315');
const topicadm = 'projects/oceanic-spot-321315/topics/admin';

let messadm = '';
let messusr = '';

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/blank', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Hey what's up",
    });
});

app.post('/get', (req, res) => {

    try {        
        let typeOfUser = req.body.typeOfUser;
        console.log(`get for ${typeOfUser}`);
        if(!typeOfUser === 'admin'){
            return res.status(200).json({
                dialogState:'',
                message: messusr,
                success: true,
                from: "user"
            })
        }else{
            return res.status(200).json({
                dialogState:'',
                message: messadm,
                success: true,
                from: "admin"
            })
        }
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: "server error"
        })
    }
});


app.post('/push', (req, res) => {

    try {
        
        let msg = req.body.message;
        let typeOfUser = req.body.typeOfUser;
        if(!typeOfUser === 'user'){
            console.log('admin user');
            waitformessusr();
            pushmessadm(msg);
        }else{
            console.log('user state found');
            waitformessadm();
            pushmessusr(msg);
        }

        return res.status(200).json({
            success: true,
            message:"done sucessfully"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: "server error"
        })
    }
});


function waitformessusr() {
    const subscription = pubSubClient.subscription(subscribeadm);

    let messflag = 0;
    const messagework = message => {
        console.log(`user message ${message.id}:`);
        console.log(`\tuser data: ${message.data}`);
        messusr = message.data.toString();
        console.log(`\tParameteres: ${message.attributes}`);
        
        messflag += messflag + 1;
        message.ack();
    };

    subscription.on('message', messagework);

    setTimeout(() => {
        subscription.removeListener('message', messagework);
        console.log(`${messflag} message(s) received.`);
    }, 60 * 1000);
}

function waitformessadm() {
    const subscription = pubSubClient.subscription(subscribeusr);

    let messflag = 0;
    const messagework = message => {
        console.log(`Received message admin ${message.id}:`);
        console.log(`\tData admin: ${message.data}`);
        messadm = message.data.toString();
        console.log(`\tAttributes: ${message.attributes}`);
        messflag += 1;

        message.ack();
    };

    subscription.on('message', messagework);

    setTimeout(() => {
        subscription.removeListener('message', messagework);
        console.log(`${messflag} recieved message.`);
    }, 30 * 1000);
}

async function pushmessadm(data) {
    const buff = Buffer.from(data);

    try {
        const messageId = await pubSubClient.topic(topicadm).publish(buff);
        console.log(`Message ${messageId} `);
    } catch (error) {
        console.error(`error with publishing ${error.message}`);
        process.exitCode = 1;
    }
}

async function pushmessusr(data) {
    const buff = Buffer.from(data);

    try {
        const messageId = await pubSubClient.topic(topicusr).publish(buff);
        console.log(`Message ${messageId} `);
    } catch (error) {
        console.error(`error with publish ${error.message}`);
        process.exitCode = 0;
    }
}

app.use((req, res, next) => {
    return res.status(404).json({
        success: true,
        message: "Invalid URL"
    });
});
module.exports = app;