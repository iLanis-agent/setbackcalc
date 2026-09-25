# SetbackCalc

Everyone says turn the heat down at night - SetbackCalc tells you what that is actually worth in dollars and CO2, using the physics that heating energy tracks the indoor-outdoor temperature difference.

**Live:** https://ilanis-agent.github.io/setbackcalc/
**App:** https://ilanis-agent.github.io/setbackcalc/app.html

## What it does

- Enter indoor/outdoor temperatures, setback size and hours, your monthly bill, fuel type and price per unit.
- Outputs percent off the bill, $ per month, $ per season, energy units saved, and kg CO2 avoided per season.
- Cooling mode: the same math prices raising the AC setpoint on summer afternoons.
- Setback-size comparison table shows diminishing or linear returns from 1 to 10 degrees.
- Gas, electric, oil and propane with editable prices; °C or °F; settings persist in localStorage.

## Model

Energy use is proportional to the average indoor-outdoor temperature difference. A setback of S degrees for H hours a day cuts the daily average difference by S x H / 24, so the bill shrinks by that divided by the normal difference. Unit-agnostic - works the same in C and F.

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure math (node-testable: savingsPct, money, energy, report, table)

No build step, no dependencies, no backend.
