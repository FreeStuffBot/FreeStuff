# FreeStuff is going closed source

It was not an easy desicion for the team to no longer release updates to FreeStuff as open source software. What made it a little bit easier for us was to know that this desicion is not entirely final. We can at any point in time go open source again if we ever decide to do so.

To explain why we do this, let's quickly check why we open sourced FreeStuff back in early 2020 in the first place:

1. We wanted to encourage more people to contribute to the bot. This did not work out at all so this is no longer an argument to keep it open source.
2. We wanted people to be able to check the bot's inner workings to be able to trust it on their Discord server. Now while this is still valid up until today, if we actually had malicious intents we would have dozens of ways to act that way even while maintaining an open source repository.

**Then now why exactly are we going closed source?**

Tl;dr: Security.

After three years we are finally adding proper monetization methods to this project. Up until this point this repository was all fun and games. All funding we received came through external sources like Patreon or Ko-Fi and had no connection or logic attached in this codebase. This is changing now.

Both the fact that we are now doing payment handling and the fact that our platform has gained an outreach of multiple millions of people mean that we want to step up our security by a bit. Going closed source is the first measure to do exactly that.

Having your code open source is like showing an attacker the keys to your home. While you don't give them the keys directly, you give them a very strong understanding about how your lock works, which ultimately makes it a lot easier for them to break in. Not disclosing your source code turns your application into a black-box, which usually requires more effort to break in. This is called security by obscurity, and while it's not enough to rely entirely on security by obscurity, it is a security measure regardless, and one we want to take.

We hope you understand why we made this decision. The current version of the code remains online in a read-only state for the foreseeable future, merely updates are no longer public.

If you want to ask questions or follow the development going forward, please do join our Discord server: https://freestuffbot.xyz/discord
