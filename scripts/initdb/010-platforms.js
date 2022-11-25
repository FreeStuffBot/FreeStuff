db.platforms.insertMany([
    {
        "_id": 0,
        "__v": 0,
        "code": "other",
        "name": "Other",
        "url": "",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "",
            "discordEmoji": ""
        },
        "gibuRef": "",
    },
    {
        "_id": 1,
        "__v": 0,
        "code": "steam",
        "name": "Steam",
        "url": "https://store.steampowered.com/",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://media.discordapp.net/attachments/672907465670787083/820258285566820402/steam.png",
            "discordEmoji": "<:steam:820258442303242320>"
        },
        "gibuRef": "steam",
    },
    {
        "_id": 2,
        "__v": 0,
        "code": "epic",
        "name": "Epic Games",
        "url": "https://www.epicgames.com/store/",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258283293638676/epic.png",
            "discordEmoji": "<:epic:820258440512798731>"
        },
        "gibuRef": "epic",
    },
    {
        "_id": 3,
        "__v": 0,
        "code": "humble",
        "name": "Humble Bundle",
        "url": "https://www.humblebundle.com/",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258291862601728/humble.png",
            "discordEmoji": "<:humble:820258441217966120>"
        },
        "gibuRef": "humble",
    },
    {
        "_id": 4,
        "__v": 0,
        "code": "gog",
        "name": "GOG.com",
        "url": "https://www.gog.com/",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258294735962152/gog.png",
            "discordEmoji": "<:gog:820258440488026113>"
        },
        "gibuRef": "gog",
    },
    {
        "_id": 5,
        "__v": 0,
        "code": "origin",
        "name": "Origin",
        "url": "https://www.origin.com/store",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258290063769600/origin.png",
            "discordEmoji": "<:origin:820258441725476914>"
        },
        "gibuRef": "origin",
    },
    {
        "_id": 6,
        "__v": 0,
        "code": "ubi",
        "name": "Ubisoft Store",
        "url": "https://store.ubi.com/",
        "description": "",
        "enabledDefault": true,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258286816854046/ubi.png",
            "discordEmoji": "<:ubi:820258441704505354>"
        },
        "gibuRef": "ubi",
    },
    {
        "_id": 7,
        "__v": 0,
        "code": "itch",
        "name": "itch.io",
        "url": "https://itch.io/",
        "description": "Itch.io is in beta. Opt in to receive games.",
        "enabledDefault": false,
        "autoPublish": false,
        "assets": {
            "icon": "https://cdn.discordapp.com/attachments/672907465670787083/820258293410299924/itch.png",
            "discordEmoji": "<:itch:820258441557442600>"
        },
        "gibuRef": "itch",
    },
]);