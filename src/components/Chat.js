import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AWS from 'aws-sdk';
import axios from 'axios';

class LexChatUser extends React.Component {
    constructor(props) {
        super(props);
        this.humanstart = false;
        this.prevMessage = "";
        this.state = {
            data: '',
            lexUserId: 'user-id-lex' + Date.now(),
            sessionAttributes: {}, visible: 'closed'
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        document.getElementById("inputField").focus();
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:881595106227',
        });
        var lexruntime = new AWS.LexRuntime();
        this.lexruntime = lexruntime;

    }

    handleClick() {
        this.setState({ visible: this.state.visible === 'open' ? 'closed' : 'open' });
        console.log(this.state);
    }

    pushChat(event) {
        event.preventDefault();

        var inputFieldText = document.getElementById('inputField');

        if (inputFieldText && inputFieldText.value && inputFieldText.value.trim().length > 0) {

            var inputField = inputFieldText.value.trim();
            inputFieldText.value = '...';
            inputFieldText.locked = true;

            var params = {
                botAlias: '$LATEST',
                botName: this.props.botName,
                inputText: inputField,
                userId: this.state.lexUserId,
                sessionAttributes: this.state.sessionAttributes
            };
            this.showRequest(inputField);

            if (this.humanstart) {
                const url = "http://localhost:3001/publish"
                const data = new URLSearchParams();
                data.set('usertype', 'user');
                data.set('message', inputField);
                axios.post(url, data).then((res) => {
                    console.log(res.data);
                });

                inputFieldText.value = '';
                inputFieldText.locked = false;
            } else {
                var a = function (err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        this.showError('Error:  ' + err.message + ' (check console for more details)')
                    }
                    if (data) {
                        this.setState({ sessionAttributes: data.sessionAttributes });
                        if (data.message === "humanstart") {
                            this.humanstart = true;
                            setInterval(this.loadData, 3000);
                        } else {
                            this.showResponse(data);
                        }
                    }
                    inputFieldText.value = '';
                    inputFieldText.locked = false;
                };
                this.lexruntime.postText(params, a.bind(this));
            }
        }
        return false;
    }

    showRequest(daText) {
        var conversationPart = document.getElementById('conversation');
        var requestingPart = document.createElement("P");
        requestingPart.className = 'userRequest';
        requestingPart.appendChild(document.createTextNode(daText));
        conversationPart.appendChild(requestingPart);
        conversationPart.scrollTop = conversationPart.scrollHeight;
    }

    showError(daText) {
        var conversationPart = document.getElementById('conversation');
        var errorPara = document.createElement("P");
        errorPara.className = 'lexError';
        errorPara.appendChild(document.createTextNode(daText));
        conversationPart.appendChild(errorPara);
        conversationPart.scrollTop = conversationPart.scrollHeight;
    }

    showHumanTurn(){
        var conversationPart = document.getElementById('conversation');
        var errorPara = document.createElement("P");
        errorPara.className = 'humanTurn';
        errorPara.appendChild(document.createTextNode('The chat has been moved to the restaurant reprentative'));
        conversationPart.appendChild(errorPara);
        conversationPart.scrollTop = conversationPart.scrollHeight;
    }

    showResponse(lexResponse) {

        var conversationPart = document.getElementById('conversation');
        var responsePara = document.createElement("P");
        responsePara.className = 'lexResponse';
        if (lexResponse.message) {
            responsePara.appendChild(document.createTextNode(lexResponse.message));
            responsePara.appendChild(document.createElement('br'));
        }
        if (lexResponse.dialogState === 'ReadyForFulfillment') {
            responsePara.appendChild(document.createTextNode(
                'get redy for fulfillment'));
        } else {
            responsePara.appendChild(document.createTextNode(
                ''));
        }
        conversationPart.appendChild(responsePara);
        conversationPart.scrollTop = conversationPart.scrollHeight;
    }

    loadData() {
        try {
            const url = "http://localhost:3001/listen"
            const data = new URLSearchParams();
            data.set('typeOfUser', 'user');
            axios.post(url, data).then((res) => {
                console.log(res.data.message);
                if (this.prevMessage === res.data.message) {

                } else {
                    this.prevMessage = res.data.message;
                    if (res.data.message) {
                        var conversationPart = document.getElementById('conversation');
                        var responsePara = document.createElement("P");
                        responsePara.className = 'lexResponse';
                        if (res.data.message) {
                            responsePara.appendChild(document.createTextNode(res.data.message));
                            responsePara.appendChild(document.createElement('br'));
                        }
                        if (res.data.dialogState === 'ReadyForFulfillment') {
                            responsePara.appendChild(document.createTextNode(
                                'get redy for fulfillment'));
                        } else {
                            responsePara.appendChild(document.createTextNode(
                                ''));
                        }
                        conversationPart.appendChild(responsePara);
                        conversationPart.scrollTop = conversationPart.scrollHeight;
                    }
                }

                
            });
        } catch (e) {
            console.log(e);
        }
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({ data: event.target.value });
    }

    render() {

        const inputStyle = {
            padding: '5px',
            fontSize: 22,
            width: '390px',
            height: '38px',
            borderRadius: '2px',
            border: '12px'
        }

        const conversationStyle = {
            width: '400px',
            height: this.props.height,
            border: 'px solid #ccc',
            backgroundColor: this.props.backgroundColor,
            padding: '5px',
            overflow: 'scroll',
            borderBottom: 'thin ridge #F5F5F5'
        }

        const headerRectStyle = {
            backgroundColor: '#800080',
            width: '408px',
            height: '40px',
            textAlign: 'center',
            paddingTop: 12,
            paddingBottom: -12,
            color: '#BDBDBD',
            fontSize: '24px'
        }

        const chatcontainerStyle = {
            backgroundColor: '#BDBDBD',
            width: 408
        }

        const chatFormStyle = {
            margin: '1px',
            padding: '2px'
        }


        return (
            <div id="chatwrapper">
                <div id="chat-header-rect" style={headerRectStyle} onClick={this.handleClick} >{this.props.headerText}
                    {(this.state.visible === 'open') ? <span className='chevron bottom'></span> : <span className='chevron top'></span>}
                </div>
                <div id="chatcontainer" className={this.state.visible} style={chatcontainerStyle}>
                    <div id="conversation" style={conversationStyle} ></div>
                    <form id="chatform" style={chatFormStyle} onSubmit={this.pushChat.bind(this)}>
                        <input type="text"
                            id="inputField"
                            size="40"
                            value={this.state.data}
                            placeholder={this.props.placeholder}
                            onChange={this.handleChange.bind(this)}
                            style={inputStyle}
                        />
                    </form>
                </div>
            </div>
        )
    }
}

LexChatUser.propTypes = {
    botName: PropTypes.string,
    IdentityPoolId: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    height: PropTypes.number,
    headerText: PropTypes.string
}

export default LexChatUser;