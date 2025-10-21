Issues / Things to fix

    Frontend logistics
        [] When entering a new chat with zero messages, program still tries to request messages resulting in a 404 error
        [] Deleting automatically updates, unless it's the last message in a chat, then user must manually reload 
            [] Similar to sending first message, it updates but there is a slight delay (not really an issue)
        [] Adding chat pop-up needs to focus on input
        [] Should disable chat pop-up after new chat created
        [] Add join chat feature (LARGE ISSUE)
            [] Sending requests to join 
            [] Accepting joining chat requests
        [] Fix issues with duplicate Chats.jsx files
        [] Fix checking for whether user is in chat to be in MessagesContainer rather than MessageInput
            [] Implement blur filter for above

    Frontend 
        [] Fix background of chat-pop up
        [] Account owner messages are slighly smaller than other messages
        [] Fix nav bar layout
        [] Continue architecture organization (extract api, mutation, and queries)
        [] Add frontend tests

    Backend 
        [] Organize backend code + architecture
        [] Add join chat requests
        [] Test join chat requests

