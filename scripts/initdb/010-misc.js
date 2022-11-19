db.misc.insertMany([
    {
        "_id": "config.global",
        "data": {
            "global": {
                "excessiveLogging": false,
                "botAdmins": [
                    "137258778092503042",
                    "171675309177831424",
                    "207435670854041602",
                ]
            }
        },
        "__v": 4,
    },

    {
        "_id": "config.service-composition",
        "data": [
            {
                "name": "Core",
                "services": [
                    {
                        "id": "api",
                        "min": 1,
                        "max": 1
                    },
                    {
                        "id": "manager",
                        "min": 1,
                        "max": 1
                    }
                ]
            },
            {
                "name": "Tools",
                "services": [
                    {
                        "id": "thumbnailer",
                        "min": 1,
                        "max": 1
                    },
                    {
                        "id": "link-proxy",
                        "min": 1,
                        "max": 1
                    }
                ]
            },
            {
                "name": "Discord",
                "services": [
                    {
                        "id": "discord-gateway",
                        "min": 1,
                        "max": 1
                    },
                    {
                        "id": "discord-interactions",
                        "min": 1,
                        "max": 5
                    }
                ]
            },
            {
                "name": "Publisher",
                "services": [
                    {
                        "id": "discord-publisher",
                        "min": 1,
                        "max": 10
                    },
                    {
                        "id": "telegram-publisher",
                        "min": 0,
                        "max": 1
                    },
                    {
                        "id": "twitter-publisher",
                        "min": 0,
                        "max": 1
                    },
                    {
                        "id": "api-publisher",
                        "min": 1,
                        "max": 1
                    }
                ]
            }
        ],
        "__v": 7,
    },
]);