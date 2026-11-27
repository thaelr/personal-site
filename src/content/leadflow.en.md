### Introduction

Customers rarely explain what they want in one neat message. They write in fragments, ask several questions at once, change the subject, and send photos that need a human to look at them.

For a tattoo studio, I adapted LeadFlowAI, a conversational system that handles incoming customer requests and decides what should happen next.

### Conversation Instead of a Script

At its core is an LLM that interprets messages and scores customer intent. But the model doesn't get to make up its own answers. The system follows predefined business logic: it selects the right information to send, asks for missing details, triggers an action, or hands the conversation over to an operator.

I accounted for messages arriving in fragments, language switching, and requests that don't fit the usual flow. An operator can take over the conversation at any time or switch automation back on.

### Booking Inside WhatsApp

I also built a separate Node.js application for booking consultations through WhatsApp Flows.

Customers choose a date and an available time, enter their contact details, and confirm the booking without leaving WhatsApp. The application reads availability from Google Calendar, checks the selected slot again before creating the event, and sends the result back to the conversation system.

I connected everything through the WhatsApp Business API, Chatwoot, and n8n. That made it possible to handle the conversation, operator handoff, and booking as one process.

[GitHub / LeadFlowAI](https://github.com/thaelr/LeadFlowAI)

[GitHub / WhatsApp Booking](https://github.com/thaelr/calendar-flow-endpoint)
