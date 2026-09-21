# Resources awaiting confirmed publication details

Do not invent identifiers, contact addresses, publication status or release URLs.

| Item | Current visitor experience | Required input and update |
| --- | --- | --- |
| Paper | Disabled Paper button with SOON label | Verified paper/arXiv URL. Replace the `.btn.res.soon` span with a link, remove `aria-disabled`, and update the matching hidden `#slotR` sizing copy. |
| Code | Disabled Code button with SOON label | Confirmed public code repository and release readiness. Enable the button and update `#slotR` consistently. |
| BibTeX | Plain notice that citation details are forthcoming | Verified publication record. Add the real citation and, if needed, restore a copy control. No placeholder arXiv identifier should be copyable. |
| Contact | Omitted from the footer | Approved public contact address. Add the real `mailto:` link. |
| Project video | Existing “Project video coming soon” placeholder | Approved project video/embed URL and poster. Replace the placeholder, keeping the Video navigation target. |
| Optional hero video | Current teaser image | Approved looping hero clip. Replace the still only if requested; preserve an accessible image description/poster. |

After enabling a resource, verify its actual destination, keyboard behavior and
hero-to-navigation sizing. Keep this checklist synchronized with the page.
