# conversation-designer-sample-connector

## Overview

This project provides an example of how to write a connector to communicate with a SAS Conversation Designer bot. This sample shows how a session is created and how events are used to interact with a bot. 

This project is intended to only be a sample. Also, while this example is based on Node.js, the concepts of communicating with a bot are the same for other languages.

# Prerequisites

The following are required before using this project:

- A SAS Conversation Designer bot
- [Node.js](https://nodejs.org/) (at least version 12 recommended)

# Installation

Clone this project locally and run:

`npm install`

Then update the following values in `javascript/chat.js` with values that match your environment:

- baseURL - this value points to the base url of your SAS environment (ex: if SAS Conversation Designer was deployed to http://yourcompany.com/SASConversationDesigner, then set this value to http://yourcompany.com)
- botId - this is the unique identifier for the bot you want the connector to communicate with (ex: e3b1f772-1562-4c8c-a60e-1ee20684ce4b)
- revisionId - this is the unique identifier for the bot revision within your bot that the connector will communicate with; this could be a delegate value (ex: @published, @latest) or the UUID (ex: aa1e4567-e89b-12d3-a456-426614158700)
- authToken - the authentication token used to communicate with your SAS environment (ex: Bearer eyJhbG...)

For more information about authentication and how to obtain a token see the following:

- [SAS REST APIs: Authentication & Authorization](https://developer.sas.com/reference/auth)
- [Authentication to SAS Viya: a couple of approaches](https://blogs.sas.com/content/sgf/2019/01/25/authentication-to-sas-viya/)
- [Building custom apps on top of SAS Viya](https://blogs.sas.com/content/tag/build-custom-app/)

Other values in `javascript/chat.js` that can be changed to better reflect your connector and the user using it:

- userId - the user id of the user interacting with the bot
- userName - the user name of the user interacting with the bot
- connectorName - the name of the connector displayed in the bot history view

# Running the app

To start the sample, run the following node command:

`node sample-connector`

Then in a browser, go to:

[http://localhost:3000](http://localhost:3000)

## Contributing

We welcome your contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit contributions to this project. 

## License

This project is licensed under the [Apache 2.0 License](LICENSE).

## Additional Resources

[SAS Conversation Designer Documentation](https://go.documentation.sas.com/?cdcId=cdesignercdc&cdcVersion=default&docsetId=cdesignerwlcm&docsetTarget=home.htm&locale=en)

# FAQ

## How do I find the botId for my bot?
The most common way to find the botId for a bot is using the Natural Language Conversations API (ex: if SAS Conversation Designer was deployed to http://yourcompany.com/SASConversationDesigner, then the base URL for the API would typically be http://yourcompany.com/naturalLanguageConversations). Once you have found the base URL, you can then call GET on the bots endpoint (ex: http://yourcompany.com/naturalLanguageConversations/bots). This will return a list of all bots that currently exist and you search the list for your bot. Once you find it the botId value is shown as 'id'. 

Here is an example:

    {
    ...
    "items": [
      {
      "id": "7d3137bf-c306-4127-b513-3e3ab816d125",
      "createdBy": "sas",
      "creationTimeStamp": "2020-08-31T14:19:36.136Z",
      "modifiedBy": "sas",
      "modifiedTimeStamp": "2020-08-31T14:19:36.276Z",
      "name": "My bot",
      ...

The 'id' value (ex: 7d3137bf-c306-4127-b513-3e3ab816d125) should be used as the botId mentioned above. 

## How do I find the revisionId for my bot?
There are three options for revisionId:

- @published - (recommended) this value points to the published version of your bot, then each time a new bot version is published, the connector automatically updates to use the most recently published bot version
- @latest - this value points to the latest/draft version of your bot, then each time a new bot latest/draft is created, the connector automatically updates to use the new latest/draft bot version
- specific revision id - this value points to a specific version the bot and will not change as versions are published or created

To find a specific revision id, follow the above instructions on how to get the botId. Then you can use the API to get access to all of the revisions available for a bot. This can be done by calling GET on the revisions endpoint (ex: http://yourcompany.com/naturalLanguageConversations/bots/{botId}/revisions). This will return a list of all revisions that currently exist for your bot. Then find the revision you are interested in and the revision value is shown as 'id'.

Here is an example:

    {
    ...
    "items": [
      {
      "id": "e09881bb-3206-4d73-a9c0-a6280202c188",
      "createdBy": "sas",
      "creationTimeStamp": "2020-08-31T14:19:36.136Z",
      "modifiedBy": "sas",
      "modifiedTimeStamp": "2020-08-31T14:19:36.276Z",
      "name": "My best revision",
      ...

The 'id' value (ex: e09881bb-3206-4d73-a9c0-a6280202c188) should be used as the revisionId mentioned above.

## I'm getting a CORS error. How do I fix it?

When your sample connector is running in a different domain than SAS Viya, you will need to update the SAS Viya CORS configuration to allow access. Instructions can be found on [developers.sas.com](https://developer.sas.com/reference/cors).