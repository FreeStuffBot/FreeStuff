import { ReplyableCommandInteraction } from 'cordo'


/** This entire file could be ommitted but I decided to add this for transparency as it could easily be too confusing where the settings command gets handled */
export default function (i: ReplyableCommandInteraction) {
  i.state('about_main')
}
