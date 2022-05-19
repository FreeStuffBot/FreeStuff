# Thumbnailer Service

Nail your thumbnails ![](https://cdn.discordapp.com/emojis/755481867268128899.png?v=1&size=32)

## What is this?

This is a microservice rendering and serving generated thumbnails for the freestuff bot. It takes in a game id and uses that to fetch the base thumbnail. Depending on the options it will then add content to the thumbnail. The service can currently modify the image in the following ways:
- add game tags
- watermarking

What's planned:
- a text bar at the bottom with customizeable background color

## How to use

The service only has one endpoint over which it takes in a JWT (JsonWebToken) holding the request payload. The JWT is signed using a private key by another service so that users cannot simply modify the request. Once an image is generated it is cached for 5 hours after the latest request. The JWT signature protects the service from cache bypasses and thus reduces computational power where it's not needed. In order to generate a valid token, generate a RSA key pair and use the private key to encrypt the payload. Put the public key in the **public.key** file and you're ready to go. For an example how to programically generate tokens see **/test/createToken.js**. The payload shall look like the following with only gameid being required and the rest as optional:
```jsonc
{
  "gameid": 12345,
  "tags": true, // will append tags if existent
  "watermark": true, // will put a little watermark on the image. can also take a string instead of true: 'tl' topleft, 'tr' topright, 'bl' bottomleft, 'br' bottomright
  "full": true // shorthand for turning all of the above on
}
```

You will also need to create the following environment variables:
```env
PORT=5051
FREESTUFF_KEY="your api key here"
```

## Example

Options:
```jsonc
{ "gameid": 785037, "tags": true }
```
To JWT:
```diff
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1laWQiOiI3ODUwMzciLCJ0YWdzIjp0cnVlLCJpYXQiOjE2MTQzNTM3NTF9.T1u5HgfJAEiM5Ekrq4HXmtgKob2zRRsWrjwezPvrokUiVdcYYuY--lnpaIg3S4vB600bEa6a3RssPT6D1tmGrTYupCQc7S6_cOMwgjYSeQacP7NdokxcHD3ElU3jCMmQ6cNWwG7MzFvB9KuQRtq0iR5wYTt7Xr6O1J5411-8Hw4
```
Send HTTP request:
```http
GET https://thumbnailer.mydomain.com/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJnYW1laWQiOiI3ODUwMzciLCJ0YWdzIjp0cnVlLCJpYXQiOjE2MTQzNTM3NTF9.T1u5HgfJAEiM5Ekrq4HXmtgKob2zRRsWrjwezPvrokUiVdcYYuY--lnpaIg3S4vB600bEa6a3RssPT6D1tmGrTYupCQc7S6_cOMwgjYSeQacP7NdokxcHD3ElU3jCMmQ6cNWwG7MzFvB9KuQRtq0iR5wYTt7Xr6O1J5411-8Hw4
```
Original Thumbnail: | Generated Thumbnail: (http response)
---|---
![](https://media.discordapp.net/attachments/543150321686413313/814913447627456532/header.jpg)|![](https://images-ext-2.discordapp.net/external/s19yWa-LYm-Ou00HRmiGY3-3ke5-us_06Vc6awU0-PM/https/media.discordapp.net/attachments/543150321686413313/814906979595845672/response.png)







## new docs

payload:
```jsonc
{
  "data": {
    "thumbnail": "https://image.url/abc.png",
    "tags": [ "gaming", "pogging" ]
  },
  "options": {
    "tags": true,
    "watermark": true // or "tl" for top left, tr, bl, br
  }
}
```