/* SetbackCalc engine - thermostat setback savings. Physics: heating energy is proportional to
   average indoor-outdoor temperature difference, so a setback of S degrees for H hours a day
   cuts the daily average delta-T by S*H/24, and the bill by (S*H/24) / deltaT. */
const SetbackEngine = (() => {
  'use strict';

  const FUELS = {
    gas:        { label: 'Natural gas', unit: 'therms', price: 1.20, co2PerUnit: 5.30 },
    electric:   { label: 'Electricity', unit: 'kWh',    price: 0.15, co2PerUnit: 0.40 },
    oil:        { label: 'Heating oil', unit: 'gallons', price: 4.00, co2PerUnit: 10.20 },
    propane:    { label: 'Propane',     unit: 'gallons', price: 3.00, co2PerUnit: 5.70 }
  };

  // All temperatures as plain degree deltas: works identically in C or F as long as consistent.
  function savingsPct(setbackDeg, setbackHours, deltaT) {
    const s = Number(setbackDeg), h = Number(setbackHours), d = Number(deltaT);
    if (!Number.isFinite(s) || s < 0 || s > 30) throw new Error('setback must be 0-30 degrees');
    if (!Number.isFinite(h) || h < 0 || h > 24) throw new Error('hours must be 0-24');
    if (!Number.isFinite(d) || d <= 0 || d > 100) throw new Error('indoor-outdoor difference must be 0-100 degrees');
    return Math.min(1, (s * (h / 24)) / d);
  }

  function money(savedPct, monthlyBill, months) {
    const b = Number(monthlyBill);
    if (!Number.isFinite(b) || b < 0 || b > 100000) throw new Error('bill must be 0-100000');
    const m = Math.round(Number(months) || 6);
    if (m < 1 || m > 12) throw new Error('months must be 1-12');
    return { perMonth: savedPct * b, perSeason: savedPct * b * m, months: m };
  }

  function energy(monthlySavedMoney, pricePerUnit) {
    const p = Number(pricePerUnit);
    if (!Number.isFinite(p) || p <= 0 || p > 1000) throw new Error('price per unit must be 0-1000');
    return monthlySavedMoney / p;
  }

  function co2KgPerMonth(unitsPerMonth, fuelKey) {
    const f = FUELS[fuelKey];
    if (!f) throw new Error('unknown fuel');
    return unitsPerMonth * f.co2PerUnit;
  }

  function report(opts) {
    const pct = savingsPct(opts.setbackDeg, opts.setbackHours, opts.deltaT);
    const mon = money(pct, opts.monthlyBill, opts.months);
    const f = FUELS[opts.fuel];
    if (!f) throw new Error('unknown fuel');
    const price = (opts.pricePerUnit !== undefined && opts.pricePerUnit !== null && opts.pricePerUnit !== '')
      ? Number(opts.pricePerUnit) : f.price;
    const unitsMonth = energy(mon.perMonth, price);
    const co2Month = unitsMonth * f.co2PerUnit;
    return {
      pct: pct,
      perMonth: mon.perMonth,
      perSeason: mon.perSeason,
      months: mon.months,
      unitsPerMonth: unitsMonth,
      unitLabel: f.unit,
      pricePerUnit: price,
      co2PerMonth: co2Month,
      co2PerSeason: co2Month * mon.months
    };
  }

  // Compare table: savings fraction for each setback size from 1..maxDeg
  function table(maxDeg, hours, deltaT) {
    const rows = [];
    for (let s = 1; s <= maxDeg; s++) rows.push({ setbackDeg: s, pct: savingsPct(s, hours, deltaT) });
    return rows;
  }

  return { FUELS, savingsPct, money, energy, co2KgPerMonth, report, table };
})();
if (typeof module !== 'undefined') module.exports = SetbackEngine;
