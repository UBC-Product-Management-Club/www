# Team members

One JSON file per person. The site picks up every `.json` file in this folder (except the schema) at build time,
so adding someone is just adding a file — there is no list to update.

```json
{
  "$schema": "./member.schema.json",
  "name": "Jane Doe",
  "team": "Tech",
  "role": "Developer",
  "emoji": "🚀",
  "photo": "jane-doe.webp",
  "url": "https://www.linkedin.com/in/janedoe/",
  "order": 9
}
```

| Field   | What it does |
| ------- | ------------ |
| `name`  | Full name on the card. |
| `team`  | One of `Co-Presidents`, `Community`, `Events`, `Finance`, `Marketing`, `Tech`, `Partnerships`, `Advisors`. |
| `role`  | Shown under the name. A role starting with `VP` hangs in the middle of its team's keychain. |
| `emoji` | The badge on the card. `null` shows a PMC gear. |
| `photo` | A file name in [`public/team/`](../../../public/team) or a full `https://` URL. `null` shows initials. |
| `url`   | Where clicking the card goes. `null` makes the card not clickable. |
| `order` | Position within the team, lowest first. Optional. |

**Photos** live in `public/team/`. Use a square image, about 480 × 480, ideally `.webp`, named after the person
(`jane-doe.webp`).

The build fails with a clear message if a file has an unknown team or is missing a name or role, so a typo can't
quietly drop someone from the site.
