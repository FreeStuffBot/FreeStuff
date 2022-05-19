# FreeStuff API Service

This service is what gets deployed to api.freestuffbot.xyz.

It serves internal apis (cms data, languages, ...), the api for the web dashboard (translations, content moderation, admin view, ...) as well as the commercial v1 and v2 apis.

Another service called api-publisher is responsible for sending data to configured webhoooks, this is beyond this service's scope.

The API service an an anchor point to the entire system, almost every other service relies on the API to connect everything.
