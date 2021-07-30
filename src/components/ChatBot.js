import React from 'react'
import LexChatUser from './Chat';


const ChatBot = (props) => {
return (
        <div>
            <LexChat
                botName="HalifaxFoodieSApp"
                IdentityPoolId="us-east-1:881595106227f"
                placeholder="Type here..."
                backgroundColor="#FFFFFF"
                height="530px"
                region="us-east-1"
                headerText="Need Help?"
                headerStyle={{ backgroundColor: "#800080", fontSize: "30px" }}
                greeting={
                    "Hey How can I help you?"
                }
            />
        </div>
    );
}

export default ChatBot
