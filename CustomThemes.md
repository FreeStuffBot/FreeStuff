

embed: on off
[message]
[embed]


# variables
basic
           {name} - Game name
       {oldprice} - Original Price in default currency
   {oldprice.eur} - Original Price in Euro
   {oldprice.usd} - Original Price in Dollar
       {newprice} - New Price in default currency - will mostly be 'Free' but might be an actual price if subscribed to discounts
   {newprice.eur} - Same as above but always in Euro - and 0.00€ instead of 'Free'
   {newprice.usd} - Same as above but always in Dollar - and $0.00 instead of 'Free'
            {url} - Store url
     {url.direct} - Direct url, like open up steam client directly. Will be regular url if not available
      {url.clean} - Store url but easier on the eyes, like no https:// etc
      {thumbnail} - Thumbnail url
          {store} - Name of the store
        {mention} - Mentions the role set with @FreeStuff mention
advanced
   {steam.subids} - Sub package ids - only available if game is from steam, will just be blank otherwise
{thumbnail.color} - Primary color in the thumbnail. To use as embed stip color for instance
          {trash} - Weather a game is marked as trash or not.
         {rating} - Game's rating - only available on some stores
  {store.isSteam} - Weather the game is from Steam. Available for all stores


# conditional
{condition? Text if true}{Text if false (optional)}
{store.isUplay? This game is from Uplay}{This Game is not from Uplay}
{steam.subids? !addlicense asf {steam.subids}}
{trash? This game is trash!}{This game is not trash!}


# emojis
:b1: - :b8:
:CUSTOM EMOJI ID HERE:

