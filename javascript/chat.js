/*!
 * Copyright © 2020, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * REQUIRED: These variables need to be replaced with values that point to the desired bot.
 */
const baseURL = "REPLACE_THIS_VALUE";
const botId = "REPLACE_THIS_VALUE";
const revisionId = "REPLACE_THIS_VALUE";
const sasUserId = "REPLACE_THIS_VALUE";
const sasPassword = "REPLACE_THIS_VALUE";

/**
 * These values can also be changed based on the user using the bot and the name of the connector.
 */
const userId = "myUserId";
const userName = "myUserName";
const connectorName = "mySampleConnector";

/**
 * These values are all defined/updated at runtime to reflect the current session.
 */
let authToken = null;
let sessionId = null;
let nextEventsLink = null;
let chatContent = null;


/**
 * This function is called when a new session should be started. This normally happens when the page is loaded.
 */
let startNewSession = function () {
    let successHandler = () => {
        chatContent.innerHTML = "";
        setTimeout(pollForEvents, 2000);
    };
    createSession(successHandler);
};

/**
 * This function polls for events based on the nextEventsLink.
 */
let pollForEvents = function () {
    if (!botId || !revisionId || !sessionId || !nextEventsLink) {
        return;
    }

    checkToken().then(() => {
        fetch(baseURL + nextEventsLink, {
            method: "GET",
            headers: {
                "Authorization": authToken
            }
        }).then(function (response) {
            return response.json();
        })
            .then((response) => {
                response.links.forEach(link => {
                    if (link.rel === 'next') {
                        nextEventsLink = link.href;
                    }
                });

                response.items.forEach(event => {
                    // this sample only handles message events but there are other types of events (typing, transfer, end chat)
                    // that might need to be handled by a production connector
                    if (event.type === "messageEvent") {
                        createMessageElements(event);
                        chatContent.scrollTop = chatContent.scrollHeight;
                    }
                });

                setTimeout(pollForEvents, 2000);
            }, (error) => {
                console.error(error);
            });
    });
};

let createMessageElements = function (messageEvent) {
    let messageStyle = messageEvent.sourceId === userId ? "userInput" : "botResponse";
    if (messageEvent.bodyElements && messageEvent.bodyElements.length) {
        messageEvent.bodyElements.forEach(bodyElement => {
            switch (bodyElement.type) {
                case "textElement":
                    chatContent.innerHTML += "<div class='chatRow " + messageStyle + "'><span>" + bodyElement.text + "</span></div>";
                    break;
                case "htmlElement":
                    chatContent.innerHTML += "<div class='chatRow " + messageStyle + "'>" + bodyElement.text + "</div>";
                    break;
            }
        });
    } else if (messageEvent.text) {
        chatContent.innerHTML += "<div class='chatRow " + messageStyle + "'><span>" + messageEvent.text + "</span></div>";
    }

    if (messageEvent.attachments && messageEvent.attachments.length) {
        let attachmentIndex = 0;
        messageEvent.attachments.forEach(attachment => {
            if (attachment.mediaType.startsWith("image/")) {
                let parentDivId = messageEvent.id + "_" + attachmentIndex++;
                chatContent.innerHTML += "<div class='chatRow " + messageStyle + "' id='" + parentDivId + "'></div>";
                getImageContent(attachment.uri, attachment.mediaType, parentDivId);
            }
        });
    }

    if (messageEvent.messageLinks && messageEvent.messageLinks.length) {
        messageEvent.messageLinks.forEach(link => {
            chatContent.innerHTML += "<div class='chatRow " + messageStyle + "'><a href='" + link.uri + "' target='_blank'>" + link.label + "</a></div>";
        });
    }

    if (messageEvent.buttons && messageEvent.buttons.length) {
        let buttonDivContents = "";
        let buttonIndex = 0;
        messageEvent.buttons.forEach(button => {
            let buttonId = messageEvent.id+"_"+buttonIndex++;
            buttonDivContents += "<input type='button' id='" + buttonId + "' value='" + button.eventText + "' onclick='sendUserInputEvent(\""+button.eventText+"\")'/>";
        });
        chatContent.innerHTML += "<div>"+buttonDivContents+"</div>";
    }
};

/**
 * Images returned by the bot have relative URIs that require the same authorization as all other bot calls.
 * This function loads the image using the appropriate authorization header and then updates the imageDiv with the
 * image content.
 */
let getImageContent = function (uri, mediaType, parentDivId) {
    checkToken().then(() => {
        fetch(baseURL + uri, {
            method: "GET",
            headers: {
                "Authorization": authToken,
                "Content-Type": mediaType
            }
        })
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                let imageDiv = document.getElementById(parentDivId);
                imageDiv.innerHTML = data;
                chatContent.scrollTop = chatContent.scrollHeight;
            });
    });
};

/**
 * This function sends a user input event to the bot.
 */
let sendUserInputEvent = function (userInput) {
    let event = {};
    event.sourceId = userId;
    event.sourceName = userName;
    event.type = "messageEvent";
    event.text = userInput;
    sendChatEvent(event, 'application/vnd.sas.natural.language.conversations.create.message.event+json', null);
};


/**
 * This function checks if an authorization token is already loaded and if not loads one.
 *
 * NOTE: If this connector is meant to be long running then additional code needs to be added to handle
 * expired tokens.
 *
 * @returns {Promise}
 */
let checkToken = function () {
    //check if the authorization token has already been loaded
    if (authToken) {
        return Promise.resolve();
    } else {
        return fetch(baseURL + "/SASLogon/oauth/token", {
            method: "POST",
            body: "grant_type=password&username=" + sasUserId + "&password=" + sasPassword,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic c2FzLmVjOg=="
            }
        }).then(function (response) {
            return response.json();
        })
            .then((response) => {
                authToken = "bearer " + response.access_token;
            }, (error) => {
                console.error(error);
            });
    }
};

/**
 * This function creates a new chat session and calls the successHandler when it is done.
 *
 * @param successHandler - function to call when the session has been created
 */
let createSession = function (successHandler) {

    sessionId = null;
    nextEventsLink = null;

    checkToken().then(() => {
        // this information is stored with the session and used to identify where/how the session was created
        let data = {
            "connectorName": connectorName,
            "state": {
                "sessionProperties": {
                    "userName": userName,
                    "userId": userId
                }
            }
        };

        fetch(baseURL + '/naturalLanguageConversations/bots/' + botId + '/revisions/' + revisionId + '/sessions', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Authorization": authToken,
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            return response.json();
        })
            .then((response) => {
                sessionId = response.id;
                nextEventsLink = '/naturalLanguageConversations/bots/' + botId + '/revisions/' + revisionId + '/sessions/' + sessionId + "/events";
                sendStartChatEvent(successHandler);

            }, (error) => {
                console.error(error);
            });
    });
};

/**
 * This function sends a Start Chat Event.
 *
 * @param successHandler - function to call when the event has been sent
 */
let sendStartChatEvent = function (successHandler) {
    let event = {};
    event.type = "startChatEvent";
    event.sourceId = userId;
    event.sourceName = userName;
    sendChatEvent(event, 'application/vnd.sas.natural.language.conversations.create.start.chat.event+json', successHandler);
};


/**
 * This function sends an event of any type to the bot.
 *
 * @param event - event to send to the bot
 * @param eventContentType - the event type
 * @param successHandler - (optional) function to call when the session has been created
 */

let sendChatEvent = function (event, eventContentType, successHandler) {
    checkToken().then(() => {
        fetch(baseURL + '/naturalLanguageConversations/bots/' + botId + '/revisions/' + revisionId + '/sessions/' + sessionId + "/events", {
            method: "POST",
            body: JSON.stringify(event),
            headers: {
                "Authorization": authToken,
                "Content-Type": eventContentType
            }
        }).then(() => {
            if (successHandler)
                successHandler();
        }, (error) => {
            console.error(error);
        });
    });
};

/**
 * This function runs when the page loads. It sets up listeners and starts the chat session.
 */
window.onload = function () {

    chatContent = document.getElementById('chatContent');
    let userInputField = document.getElementById("userInputField");
    let sendButton = document.getElementById('sendButton');

    let submitUserInput = () => {
        let userInput = userInputField.value;
        userInputField.value = "";
        sendUserInputEvent(userInput);
    };

    userInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            submitUserInput();
        }
    });

    sendButton.addEventListener('click', function (e) {
        submitUserInput();
    });

    // start a new chat session
    startNewSession();
};