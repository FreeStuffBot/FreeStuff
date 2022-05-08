# Discord Gateway

## Endpoints

### GET `/channels/:guild`

Returns all channels in that guild and automatically calculates the bot user's permissions.

Code| Data | Description
----|------|---
200 | Channels | success
400 | - | invalid guild
403 | - | missing permissions to look up channels
404 | - | guild not found
502 | - | channels lookup failed due to bad gateway


### GET `/guild/:guild`

Returns the guild and it's roles.

Code| Data | Description
----|------|---
200 | Guild | success
400 | - | invalid guild
403 | - | missing permissions to look up guild
404 | - | guild not found
502 | - | guild lookup failed due to bad gateway


### GET `/member/:guild`

Returns the bot user's guild member entity.

Returns all bot owned webhooks in that channel.

Code| Data | Description
----|------|---
200 | Member | success
400 | - | invalid guild
403 | - | missing permissions to look up member
404 | - | guild not found
502 | - | member lookup failed due to bad gateway


### GET `/webhooks/:channel`

Returns all bot owned webhooks in that channel.

Code| Data | Description
----|------|---
200 | Webhooks | success
400 | - | invalid channel
403 | - | missing permissions to view webhooks
500 | - | webhook lookup failed for unknown reason (e.g. guild not found)
502 | - | webhook lookup failed due to bad gateway


### GET `/webhooks/:hookid/:hooktoken`

Tests a given webhook and proxies the exact data Discord returns.

Directives:
- nodata: Does not return the webhook object on success, only status code

Code| Data | Description
----|------|---
200 | Webhook | success
400 | - | invalid channel
403 | - | missing permissions to view webhook
500 | - | webhook lookup failed for unknown reason (e.g. guild not found)
502 | - | webhook lookup failed due to bad gateway


### POST `/webhooks/:channel`

Creates a new webhook in that channel and returns it's data.

Code| Data | Description
----|------|---
200 | Webhook | success
400 | - | invalid channel
403 | - | missing permissions to create webhook
409 | - | maximum amount of webhooks in channel reached
500 | - | webhook creation failed for unknown reason
502 | - | webhook creation failed due to bad gateway

