# EdgeCostSeg Website

Static multi-page website for EdgeCostSeg (Powered by Real Deal Accounting).
Pure HTML/CSS/JS, no build step. Deploys as-is to GitHub Pages, Vercel, or Netlify.

## Structure

```
index.html              Home
about.html              About + team
services.html           Services
cost-segregation.html   Cost Segregation 101
industries.html         Industries served
process.html            How it works
faq.html                FAQ
contact.html            Contact form
estimate.html           Savings estimator + lead form
styles.css              All styles (design tokens at the top)
script.js               Nav, FAQ, estimator, form handling
assets/                 Logo, illustrations, team photos, explainer animation
```

## Publish on GitHub Pages

1. Create a new repository on GitHub.
2. Upload everything in this folder (keep the folder structure; `index.html` must be at the root).
3. In the repo: **Settings → Pages → Source: Deploy from a branch → main / root → Save**.
4. Your site goes live at `https://<your-username>.github.io/<repo-name>/`.

## Things already wired up

- **Lead form** (estimate page) → Formspree `mzdqrjjo`
- **Contact form** (contact page) → Formspree `xbdedrbw`
- **"Meet With Us" / booking buttons** → Calendly `https://calendly.com/swasserman-o0l3/costseg`
- Phone `(561) 270-4850` and email `clientservices@realdealaccounting.com`

To change any of these, search the HTML for the `EDIT:` comments.
